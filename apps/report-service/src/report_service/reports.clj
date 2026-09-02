(ns report-service.reports
  (:require [clj-pdf.core :refer [pdf]]
            [clojure.data.csv :as csv]
            [clojure.data.json :as json]
            [report-service.db :as db])
  (:import [java.io ByteArrayOutputStream]
           [java.time LocalDateTime]
           [java.time.format DateTimeFormatter]))

;; --- HELPER FUNCTIONS ---

(defn format-date [date]
  (when date
    (.toString date)))

(defn temporal-date-time [date]
  (cond
    (instance? java.sql.Timestamp date) (.toLocalDateTime date)
    :else date))

(defn report-period [from to]
  (str from " - " to))

(def timestamp-formatter (DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm:ss"))

(defn format-timestamp [^LocalDateTime ldt]
  (.format ldt timestamp-formatter))

;; --- map — data transformation ---

(defn reservation->csv-row
  "Transforms one reservation record into a CSV line"
  [r]
  [(:id r)
   (:equipment_name r "")
   (:equipment_category r "")
   (:user_name r "")
   (:user_email r "")
   (format-date (:start_date r))
   (format-date (:end_date r))
   (:status r "")
   (format-date (:actual_return_date r))])

;; --- filter — data filtering ---

(defn filter-by-status
  "Filters reservations by status"
  [status reservations]
  (if status
    (filter #(= (:status %) status) reservations)
    reservations))

(defn filter-returned
  "Returns only returned reservations"
  [reservations]
  (filter #(= (:status %) "RETURNED") reservations))

(defn filter-active
  "Returns only active reservations"
  [reservations]
  (filter #(contains? #{"ACTIVE" "CONFIRMED"} (:status %))
          reservations))

;; --- reduce — data aggregation ---

(defn aggregate-by-category
  "Aggregates hardware statistics per category by reduce"
  [equipment-stats]
  (reduce (fn [acc row]
            (let [category (:category row)
                  count    (:count row 0)]
            (if category
              (update acc category (fnil + 0) count)
              acc)))
          {}
          equipment-stats))

(defn count-by-status
  "Counts reservations per status by reduce"
  [reservations]
  (reduce (fn [acc r]
            (let [status (:status r)]
              (if status
                (update acc status (fnil inc 0))
                acc)))
          {}
          reservations))

(defn total-rental-days
  "Sums the total number of days borrowed by reduce"
  [reservations]
  (reduce (fn [acc r]
            (let [start (:start_date r)
                  end   (:end_date r)]
              (if (and start end)
                (+ acc (.between java.time.temporal.ChronoUnit/DAYS
                                 (temporal-date-time start)
                                 (temporal-date-time end)))
                acc)))
          0
          reservations))

;; --- TAILED RECURSION ---

(defn build-csv-rows
  ([rows] (build-csv-rows rows []))
  ([rows acc]
   (if (empty? rows)
     acc
     (recur (rest rows)
            (conj acc (reservation->csv-row (first rows)))))))

;; --- HIGHER ORDER FUNCTIONS ---

(defn generate-report
  "Reporting pipeline - composition of higher-order functions Takes functions as arguments (higher-order functions)"
  [reservations & {:keys [status-filter transform-fn]
                   :or {status-filter identity
                        transform-fn identity}}]
  (->> reservations
       status-filter
       transform-fn
       (map reservation->csv-row)))

;; --- GENERATING CSV ---

(defn generate-csv
  "Generates CSV from reservations"
  [from to & {:keys [status]}]
  (let [reservations (db/get-reservations from to)
        header       [["ID" "Equipment" "Category" "User" "Email"
                       "Start Date" "End Date" "Status" "Return Date"]]
        rows         (->> reservations
                          (filter-by-status status)
                          build-csv-rows)
        all-rows     (into header rows)]
    (with-out-str
      (csv/write-csv *out* all-rows))))

;; --- GENERATING statistics ---

(defn generate-stats
  "Generates statistics by composition map/filter/reduce"
  [from to]
  (let [reservations   (db/get-reservations from to)
        equipment-data (db/get-equipment-stats)
        by-status      (count-by-status reservations)
        by-category    (aggregate-by-category equipment-data)
        returned       (filter-returned reservations)
        total-days     (total-rental-days returned)
        popular        (->> reservations
                            (map :equipment_name)
                            (remove nil?)
                            frequencies
                            (sort-by val >)
                            (take 5))]
    {:reservations-by-status by-status
     :equipment-by-category  by-category
     :total-rental-days      total-days
     :most-popular-equipment popular
     :total-reservations     (count reservations)}))

;; --- GENERATING PDF ---

(def brand-navy [15 23 42])         ; near-black, used for headings and titles
(def brand-blue [37 99 235])        ; blue accent
(def brand-gray [71 85 105])        ; muted text
(def brand-light-gray [241 245 249]); light backdrop for cards / column headers
(def brand-border [203 213 225])    ; borders
(def white [255 255 255])

(defn metric-cell
  "A single, bordered and centered KPI card used in the executive summary row."
  [label value background]
  [:pdf-cell {:background-color background
              :border true
              :border-color brand-border
              :align :center
              :valign :middle
              :padding 12
              :min-height 55}
   [:paragraph {:align :center}
    [:phrase {:style :bold :size 9 :color brand-gray} (str label "\n")]
    [:phrase {:style :bold :size 18 :color brand-navy} (str value)]]])

(defn metrics-table
  "Executive summary KPI cards, evenly spaced, centered, and bordered."
  [stats]
  [:pdf-table {:width-percent 100 :spacing-after 18 :horizontal-align :center}
   [25 25 25 25]
   [(metric-cell "Total reservations" (:total-reservations stats) white)
    (metric-cell "Rental days" (:total-rental-days stats) brand-light-gray)
    (metric-cell "Statuses tracked" (count (:reservations-by-status stats)) white)
    (metric-cell "Categories" (count (:equipment-by-category stats)) brand-light-gray)]])

(defn titled-pdf-table
  "A pdf-table with an embedded dark title bar spanning all columns (the
  table's name), followed by a light column-header row and data rows."
  [title columns widths rows empty-row]
  (into
   [:pdf-table {:header [[[:pdf-cell {:colspan (count columns)
                                       :background-color brand-navy
                                       :align :center
                                       :padding 8}
                            [:paragraph {:align :center :style :bold :color white}
                             title]]]
                          (mapv (fn [column]
                                  [:pdf-cell {:background-color brand-light-gray
                                              :padding 6}
                                   [:phrase {:style :bold :size 9 :color brand-navy} column]])
                                columns)]
                :width-percent 100
                :spacing-after 16
                :no-split-rows? true}
    widths]
   (if (seq rows) rows [empty-row])))

(defn breakdown-table
  "A titled two-column table (label/count) used for status, category, and
  popularity breakdowns. Accepts a map or a seq of [label count] pairs."
  [title column-title rows]
  (titled-pdf-table
   title
   [column-title "Count"]
   [70 30]
   (map (fn [[label value]] [(str label) (str value)]) rows)
   ["No data available" "0"]))

(defn reservations-table
  "Detailed, titled table of reservation rows for the report period."
  [reservations]
  (titled-pdf-table
   "Reservation details"
   ["Equipment" "Category" "User" "Email" "Start" "End" "Status"]
   [16 16 12 15 19 11 11]
   (map (fn [r]
          [(:equipment_name r "")
           (:equipment_category r "")
           (:user_name r "")
           (:user_email r "")
           (or (format-date (:start_date r)) "")
           (or (format-date (:end_date r)) "")
           (:status r "")])
        reservations)
   ["No reservations match the selected filters." "" "" "" "" "" ""]))

(defn generate-pdf
  "Generates a branded PDF report with executive summary, breakdowns, and
  reservation details for the given period."
  [from to & {:keys [status]}]
  (let [reservations (->> (db/get-reservations from to)
                          (filter-by-status status))
        stats        (generate-stats from to)
        output       (ByteArrayOutputStream.)]
    (pdf
     [{:title "EquipRent report"
       :author "EquipRent"
       :subject "Reservation report"
       :size :a4
       :orientation :landscape
       :left-margin 28
       :right-margin 28
       :top-margin 28
       :bottom-margin 34
       :footer {:text "EquipRent - confidential" :align :center}}

      [:chunk {:style :bold :size 24 :color brand-navy} "EquipRent"]
      [:chunk {:size 13 :color brand-blue} "  Rental intelligence report"]
      [:spacer 1]
      [:paragraph {:size 10 :color brand-gray}
       (str "Generated at " (format-timestamp (LocalDateTime/now))
            " | Period: " (report-period from to)
            (when status (str " | Status filter: " status)))]
      [:line {:color brand-blue}]
      [:spacer 1]

      [:heading {:style {:size 16 :color brand-navy}} "Executive summary"]
      [:spacer 1]
      (metrics-table stats)

      [:spacer 1]
      (breakdown-table "Reservations by status" "Status" (:reservations-by-status stats))
      (breakdown-table "Equipment by category" "Category" (:equipment-by-category stats))
      (breakdown-table "Most popular equipment" "Equipment" (:most-popular-equipment stats))

      [:pagebreak]
      (reservations-table reservations)]
     output)
    (.toByteArray output)))
