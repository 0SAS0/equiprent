(ns report-service.db
  (:require [next.jdbc :as jdbc]
            [next.jdbc.result-set :as rs]))

(def db-spec
  {:dbtype   "postgresql"
   :dbname   (or (System/getenv "DB_NAME") "equiprent")
   :host     (or (System/getenv "DB_HOST") "localhost")
   :port     5432
   :user     (or (System/getenv "DB_USER") "equiprent")
   :password (or (System/getenv "DB_PASSWORD") "equiprent_secret")})

(defn get-ds []
  (jdbc/get-datasource db-spec))

(defn get-reservations
  [from to]
  (jdbc/execute!
   (get-ds)
   ["SELECT
       r.id AS id,
       r.status AS status,
       r.\"startDate\" AS start_date,
       r.\"endDate\" AS end_date,
       r.\"actualReturnDate\" AS actual_return_date,
       r.\"purposeNote\" AS purpose_note,

       e.name AS equipment_name,
       e.category AS equipment_category,
       e.\"serialNumber\" AS equipment_serial_number,

       u.name AS user_name,
       u.email AS user_email

     FROM \"Reservation\" r
     JOIN \"Equipment\" e
       ON r.\"equipmentId\" = e.id

     JOIN \"User\" u
       ON r.\"userId\" = u.id

     WHERE r.\"startDate\" >= ?::timestamp
       AND r.\"endDate\" <= ?::timestamp

     ORDER BY r.\"startDate\" DESC"
    from
    to]
   {:builder-fn rs/as-unqualified-lower-maps}))

(defn get-equipment-stats []
  (jdbc/execute!
   (get-ds)
   ["SELECT
       category AS category,
       status AS status,
       COUNT(*) AS count
     FROM \"Equipment\"
     WHERE active = true
     GROUP BY category, status
     ORDER BY category"]
   {:builder-fn rs/as-unqualified-lower-maps}))
