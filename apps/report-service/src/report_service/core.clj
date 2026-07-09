(ns report-service.core
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [ring.middleware.json :refer [wrap-json-response]]
            [ring.middleware.params :refer [wrap-params]]
            [compojure.core :refer [defroutes GET]]
            [compojure.route :refer [not-found]]
            [report-service.handlers :as handlers])
  (:gen-class))

(defroutes app-routes
  (GET "/health"       request (handlers/health-handler request))
  (GET "/report/csv"   request (handlers/csv-report-handler request))
  (GET "/report/stats" request (handlers/stats-handler request))
  (not-found {:status 404
              :headers {"Content-Type" "application/json"}
              :body "{\"error\": \"Not found\"}"}))

(def app
  (-> app-routes
      wrap-params
      wrap-json-response))

(defn -main [& _args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3002"))]
    (println (str "Report service starting on port " port))
    (run-jetty app {:port port :join? false})
    (println "Report service ready!")))
