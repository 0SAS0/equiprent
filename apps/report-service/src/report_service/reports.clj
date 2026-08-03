(ns report-service.reports
  (:require [clojure.data.csv :as csv]
            [clojure.data.json :as json]
            [report-service.db :as db]))

;; --- HELPER FUNCTIONS ---

(defn format-date [date]
  (when date
    (.toString date)))

(defn temporal-date-time [date]
  (cond
    (instance? java.sql.Timestamp date) (.toLocalDateTime date)
    :else date))

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
  "Builds CSV lines via tailed recursion. Safe for large data sets - does not overflow the stack"
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
