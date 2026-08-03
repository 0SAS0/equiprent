(ns report-service.handlers
  (:require [clojure.data.json :as json]
            [report-service.reports :as reports]))

(defn health-handler [_request]
  {:status 200
   :headers {"Content-Type" "application/json"}
   :body (json/write-str {:status "ok"
                          :service "report-service"})})

(defn csv-report-handler [request]
  (let [params (:params request)
        from   (:from params "2020-01-01")
        to     (:to params "2030-12-31")
        status (:status params)]
    (try
      {:status  200
       :headers {"Content-Type"        "text/csv; charset=utf-8"
                 "Content-Disposition" "attachment; filename=report.csv"}
       :body    (reports/generate-csv from to :status status)}
      (catch Exception e
        {:status 500
         :headers {"Content-Type" "application/json"}
         :body (json/write-str {:error (.getMessage e)})}))))

(defn stats-handler [request]
  (let [params (:params request)
        from   (:from params "2020-01-01")
        to     (:to params "2030-12-31")]
    (try
      {:status  200
       :headers {"Content-Type" "application/json"}
       :body    (json/write-str (reports/generate-stats from to))}
      (catch Exception e
        {:status 500
         :headers {"Content-Type" "application/json"}
         :body (json/write-str {:error (.getMessage e)})}))))

(defn pdf-report-handler [request]
  (let [params (:params request)
        from   (:from params "2020-01-01")
        to     (:to params "2030-12-31")
        status (:status params)]
    (try
      {:status  200
       :headers {"Content-Type"        "application/pdf"
                 "Content-Disposition" "attachment; filename=equiprent-report.pdf"}
       :body    (reports/generate-pdf from to :status status)}
      (catch Exception e
        {:status 500
         :headers {"Content-Type" "application/json"}
         :body (json/write-str {:error (.getMessage e)})}))))
