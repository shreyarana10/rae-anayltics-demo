// C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\dbtest.js

const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  port: 3306, // The specific port from your ddev describe ddev port 61567
  user: "root", // DDEV default user
  password: "", // DDEV default password
  database: "csaraebackuponline", // DDEV default database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
