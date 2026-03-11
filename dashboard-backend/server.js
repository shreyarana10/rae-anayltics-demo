const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// FIXED: Host changed to localhost for your MacBook Air
// FIXED: Ensure password matches your local MySQL setup
const db = mysql.createPool({
  // host: "195.35.7.160",
  // port: 3306, // The specific port from your ddev describe ddev port 61567
  // user: "csaengg", // DDEV default user
  // password: "Revanthshiva3", // DDEV default password
  // database: "csarae", // DDEV default database name
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0,
  host: "localhost",
  port: 3306, // The specific port from your ddev describe ddev port 61567
  user: "root", // DDEV default user
  password: "", // DDEV default password
  database: "csaraebackuponline", // DDEV default database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const financeRoutes = require("./routes/financeRoutes");
app.use("/api/finance", financeRoutes);

const buildingRoutes = require("./routes/BuildingRoutes");
app.use("/api/building", buildingRoutes);

const industrialRoutes = require("./routes/IndustrialRoute");
app.use("/api/industrial", industrialRoutes);

const itRoutes = require("./routes/itRoutes");
app.use("/api/it", itRoutes);

const businessRoutes = require("./routes/BusinessRoutes");
app.use("/api/accounts", businessRoutes);

const salesRoutes = require("./routes/SalesRoutes");
app.use("/api/sales", salesRoutes);

app.get("/api/team-projects", async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT 
                p.project_id, 
                p.project_name, 
                p.p_team, 
                p.progress, 
                p.start_date,
                p.assign_to_id,
                p.assign_to,
                p.urgency,
                COALESCE(ts.total_hours, 0) as hours_spent,
                u.fullname as engineer_name,
                u.profile_pic as engineer_image
            FROM projects p
            LEFT JOIN (
                SELECT project_id_timesheet, SUM(working_hours) as total_hours 
                FROM timesheet 
                GROUP BY project_id_timesheet
            ) ts ON p.project_id = ts.project_id_timesheet
            LEFT JOIN tbl_admin u ON p.assign_to_id = u.user_id
            ORDER BY p.start_date DESC
        `);

    // Categorize the data for the frontend
    const categories = {
      not_assigned: rows.filter((p) => !p.assign_to_id),
      not_started: rows.filter((p) => p.assign_to_id && p.progress === 0),
      newly_started: rows.filter((p) => p.progress > 0 && p.progress <= 20),
    };

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ... existing imports and DB config
app.get("/api/detailed-projects-building", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
    p.*, 
    p.end_date AS estimated_date,
    p.urgency,

    (
        SELECT CONCAT(
            '[',
            GROUP_CONCAT(
                JSON_OBJECT(
                    'user_id', u.user_id,
                    'name', u.fullname,
                    'pic', COALESCE(u.profile_pic, ''),
                    'total_hours', sub.total_hours,
                    'breakouts',
                    (
                        SELECT CONCAT(
                            '[',
                            GROUP_CONCAT(
                                JSON_OBJECT(
                                    'date', date_value,
                                    'hours', working_hours
                                )
                            ),
                            ']'
                        )
                        FROM timesheet
                        WHERE project_id_timesheet = p.project_id
                        AND user_id = u.user_id
                    )
                )
            ),
            ']'
        )
        FROM (
            SELECT project_id_timesheet, user_id, SUM(working_hours) AS total_hours
            FROM timesheet
            GROUP BY project_id_timesheet, user_id
        ) sub
        JOIN tbl_admin u ON sub.user_id = u.user_id
        WHERE sub.project_id_timesheet = p.project_id
    ) AS contributors

FROM projects p

WHERE LOWER(TRIM(p.p_team)) LIKE '%building%'

ORDER BY p.start_date DESC;

        `);

    const formattedRows = rows.map((row) => {
      const cleanEPT = row.EPT
        ? parseFloat(row.EPT.toString().replace(/[^\d.]/g, ""))
        : 0;
      return {
        ...row,
        estimated_hours: cleanEPT,
        contributors:
          typeof row.contributors === "string"
            ? JSON.parse(row.contributors)
            : row.contributors || [],
      };
    });
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/detailed-projects-industrial", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
    p.*, 
    p.end_date AS estimated_date,
    p.urgency,

    (
        SELECT CONCAT(
            '[',
            GROUP_CONCAT(
                JSON_OBJECT(
                    'user_id', u.user_id,
                    'name', u.fullname,
                    'pic', COALESCE(u.profile_pic, ''),
                    'total_hours', sub.total_hours,
                    'breakouts',
                    (
                        SELECT CONCAT(
                            '[',
                            GROUP_CONCAT(
                                JSON_OBJECT(
                                    'date', date_value,
                                    'hours', working_hours
                                )
                            ),
                            ']'
                        )
                        FROM timesheet
                        WHERE project_id_timesheet = p.project_id
                        AND user_id = u.user_id
                    )
                )
            ),
            ']'
        )
        FROM (
            SELECT project_id_timesheet, user_id, SUM(working_hours) AS total_hours
            FROM timesheet
            GROUP BY project_id_timesheet, user_id
        ) sub
        JOIN tbl_admin u ON sub.user_id = u.user_id
        WHERE sub.project_id_timesheet = p.project_id
    ) AS contributors

FROM projects p

WHERE LOWER(TRIM(p.p_team)) LIKE '%Industrial%'

ORDER BY p.start_date DESC;

        `);

    const formattedRows = rows.map((row) => {
      const cleanEPT = row.EPT
        ? parseFloat(row.EPT.toString().replace(/[^\d.]/g, ""))
        : 0;
      return {
        ...row,
        estimated_hours: cleanEPT,
        contributors:
          typeof row.contributors === "string"
            ? JSON.parse(row.contributors)
            : row.contributors || [],
      };
    });
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/detailed-projects-it", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
    p.*, 
    p.end_date AS estimated_date,
    p.urgency,

    (
        SELECT CONCAT(
            '[',
            GROUP_CONCAT(
                JSON_OBJECT(
                    'user_id', u.user_id,
                    'name', u.fullname,
                    'pic', COALESCE(u.profile_pic, ''),
                    'total_hours', sub.total_hours,
                    'breakouts',
                    (
                        SELECT CONCAT(
                            '[',
                            GROUP_CONCAT(
                                JSON_OBJECT(
                                    'date', date_value,
                                    'hours', working_hours
                                )
                            ),
                            ']'
                        )
                        FROM timesheet
                        WHERE project_id_timesheet = p.project_id
                        AND user_id = u.user_id
                    )
                )
            ),
            ']'
        )
        FROM (
            SELECT project_id_timesheet, user_id, SUM(working_hours) AS total_hours
            FROM timesheet
            GROUP BY project_id_timesheet, user_id
        ) sub
        JOIN tbl_admin u ON sub.user_id = u.user_id
        WHERE sub.project_id_timesheet = p.project_id
    ) AS contributors

FROM projects p

WHERE LOWER(TRIM(p.p_team)) LIKE '%it%'

ORDER BY p.start_date DESC;

        `);

    const formattedRows = rows.map((row) => {
      const cleanEPT = row.EPT
        ? parseFloat(row.EPT.toString().replace(/[^\d.]/g, ""))
        : 0;
      return {
        ...row,
        estimated_hours: cleanEPT,
        contributors:
          typeof row.contributors === "string"
            ? JSON.parse(row.contributors)
            : row.contributors || [],
      };
    });
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/detailed-projects-accounts", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
    p.*, 
    p.end_date AS estimated_date,
    p.urgency,

    (
        SELECT CONCAT(
            '[',
            GROUP_CONCAT(
                JSON_OBJECT(
                    'user_id', u.user_id,
                    'name', u.fullname,
                    'pic', COALESCE(u.profile_pic, ''),
                    'total_hours', sub.total_hours,
                    'breakouts',
                    (
                        SELECT CONCAT(
                            '[',
                            GROUP_CONCAT(
                                JSON_OBJECT(
                                    'date', date_value,
                                    'hours', working_hours
                                )
                            ),
                            ']'
                        )
                        FROM timesheet
                        WHERE project_id_timesheet = p.project_id
                        AND user_id = u.user_id
                    )
                )
            ),
            ']'
        )
        FROM (
            SELECT project_id_timesheet, user_id, SUM(working_hours) AS total_hours
            FROM timesheet
            GROUP BY project_id_timesheet, user_id
        ) sub
        JOIN tbl_admin u ON sub.user_id = u.user_id
        WHERE sub.project_id_timesheet = p.project_id
    ) AS contributors

FROM projects p

WHERE LOWER(TRIM(p.p_team)) LIKE '%accounts%'

ORDER BY p.start_date DESC;

        `);

    const formattedRows = rows.map((row) => {
      const cleanEPT = row.EPT
        ? parseFloat(row.EPT.toString().replace(/[^\d.]/g, ""))
        : 0;
      return {
        ...row,
        estimated_hours: cleanEPT,
        contributors:
          typeof row.contributors === "string"
            ? JSON.parse(row.contributors)
            : row.contributors || [],
      };
    });
    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`),
);
//C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\server.js
