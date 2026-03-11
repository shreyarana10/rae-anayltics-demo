const express = require("express");
const router = express.Router();
const db = require("../dbtest");
const {
  getMonthlyTotalBarChartQuery,
  getGreenUrgencyProjectsQuery,
  getJoiningPeopleQuery,
  getClosedProjectQuery,
  getprojectPerClientQuery,
  getprojectPerMonthQuery,
  getamountPeopleperSalesQuery,
  getEmployeeEvolutionQuery,
  getProjectsSubprojectsQuery,
  getCustomerRetentionQuery,
} = require("../queries/BuildingQueries");

router.get("/monthly-total", async (req, res) => {
  try {
    const [rows] = await db.query(getMonthlyTotalBarChartQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monthly totals" });
  }
});

router.get("/urgency-openproject", async (req, res) => {
  try {
    const [rows] = await db.query(getGreenUrgencyProjectsQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check the urgency" });
  }
});
router.get("/joining-date-people", async (req, res) => {
  try {
    const [rows] = await db.query(getJoiningPeopleQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch the people" });
  }
});

router.get("/purple-closed", async (req, res) => {
  try {
    const [rows] = await db.query(getClosedProjectQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch closed projects" });
  }
});

router.get("/client-project", async (req, res) => {
  try {
    const [rows] = await db.query(getprojectPerClientQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch client " });
  }
});

router.get("/project-per-month", async (req, res) => {
  try {
    const [rows] = await db.query(getprojectPerMonthQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch the project " });
  }
});

router.get("/sales-per-month", async (req, res) => {
  try {
    const [rows] = await db.query(getamountPeopleperSalesQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales per month " });
  }
});

router.get("/employee-evolution", async (req, res) => {
  try {
    const [rows] = await db.query(getEmployeeEvolutionQuery);
    res.json(rows);
  } catch (error) {
    console.error(error); // ✅ was `err` — undefined variable, would crash silently
    res.status(500).json({ error: "Failed to fetch the details" });
  }
});

// GET employee projects and subprojects with all details
router.get("/employee-projects/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      -- Get projects where user is directly assigned (as manager, team lead, or assignee)
      SELECT DISTINCT
          'project' AS record_type,
          p.project_id,
          p.project_name,
          p.urgency AS project_urgency,
          p.start_date,
          p.end_date,
          p.progress,
          p.project_details,
          p.p_team,
          p.revision_project_id,
          rp.project_name AS revision_project_name,
          rp.urgency AS revision_urgency,
          NULL AS subproject_id,
          NULL AS subproject_name,
          NULL AS subproject_status,
          NULL AS subproject_urgency,
          NULL AS sub_end_date,
          NULL AS sub_progress
      FROM projects p
      LEFT JOIN projects rp ON p.revision_project_id = rp.project_id
      WHERE p.p_team LIKE '%building%'
        AND (
          p.project_managers_id = ? OR 
          p.team_lead_id = ? OR 
          p.assign_to_id = ?
        )
      
      UNION ALL
      
      -- Get subprojects where user is assigned, with parent project details
      SELECT DISTINCT
          'subproject' AS record_type,
          p.project_id,
          p.project_name,
          p.urgency AS project_urgency,
          p.start_date AS project_start_date,
          p.end_date AS project_end_date,
          p.progress AS project_progress,
          p.project_details,
          p.p_team AS project_p_team,
          p.revision_project_id,
          rp.project_name AS revision_project_name,
          rp.urgency AS revision_urgency,
          sp.table_id AS subproject_id,
          sp.subproject_name,
          sp.subproject_status,
          sp.urgency AS subproject_urgency,
          sp.sub_end_date,
          sp.sub_progress
      FROM subprojects sp
      JOIN projects p ON sp.project_id = p.project_id
      LEFT JOIN projects rp ON p.revision_project_id = rp.project_id
      WHERE p.p_team LIKE '%building%'
        AND sp.p_team LIKE '%building%'
        AND (
          sp.project_managers_id = ? OR 
          sp.team_lead_id = ? OR 
          sp.assign_to_id = ?
        )
      
      ORDER BY project_id DESC, subproject_id;
    `;

    const [rows] = await db.query(query, [
      userId,
      userId,
      userId, // Project roles (3 params)
      userId,
      userId,
      userId, // Subproject roles (3 params) - total 6 params
    ]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching employee projects:", error);
    res.status(500).json({ error: "Failed to fetch employee projects" });
  }
});

// Get complete project details by project_id
router.get("/project-details/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log(`Fetching details for project ID: ${projectId}`);

    // Get main project details with all columns
    const projectQuery = `
      SELECT 
        p.*,
        -- Get names from tbl_admin for various roles
        pm.fullname AS project_manager_name,
        tl.fullname AS team_lead_name,
        at.fullname AS assign_to_name,
        vb.fullname AS verify_by_fullname,
        -- Revision project details
        rp.project_name AS revision_project_name,
        rp.urgency AS revision_urgency,
        rp.start_date AS revision_start_date,
        rp.end_date AS revision_end_date,
        rp.progress AS revision_progress
      FROM projects p
      LEFT JOIN tbl_admin pm ON p.project_managers_id = pm.user_id
      LEFT JOIN tbl_admin tl ON p.team_lead_id = tl.user_id
      LEFT JOIN tbl_admin at ON p.assign_to_id = at.user_id
      LEFT JOIN tbl_admin vb ON p.verify_by = vb.user_id
      LEFT JOIN projects rp ON p.revision_project_id = rp.project_id
      WHERE p.project_id = ?
    `;

    const [projectRows] = await db.query(projectQuery, [projectId]);

    if (projectRows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get all subprojects for this project
    const subprojectsQuery = `
      SELECT 
        sp.*,
        -- Get names from tbl_admin for subproject roles
        spm.fullname AS subproject_manager_name,
        stl.fullname AS subproject_team_lead_name,
        sat.fullname AS subproject_assign_to_name,
        svb.fullname AS subproject_verify_by_name
      FROM subprojects sp
      LEFT JOIN tbl_admin spm ON sp.project_managers_id = spm.user_id
      LEFT JOIN tbl_admin stl ON sp.team_lead_id = stl.user_id
      LEFT JOIN tbl_admin sat ON sp.assign_to_id = sat.user_id
      LEFT JOIN tbl_admin svb ON sp.verify_by = svb.user_id
      WHERE sp.project_id = ?
      ORDER BY sp.table_id DESC
    `;

    const [subprojectRows] = await db.query(subprojectsQuery, [projectId]);

    // Get all team members/contributors for this project
    const contributorsQuery = `
      SELECT DISTINCT
        a.user_id,
        a.fullname,
        a.email,
        a.user_role,
        a.p_team,
        a.dateofjoining,
        a.account_status,
        CASE
          WHEN a.user_role = 1 THEN 'Project Manager'
          WHEN a.user_role = 3 THEN 'Team Lead'
          ELSE 'Engineer'
        END AS role_display
      FROM tbl_admin a
      WHERE a.user_id IN (
        -- Project roles
        SELECT project_managers_id FROM projects WHERE project_id = ? AND project_managers_id IS NOT NULL
        UNION
        SELECT team_lead_id FROM projects WHERE project_id = ? AND team_lead_id IS NOT NULL
        UNION
        SELECT assign_to_id FROM projects WHERE project_id = ? AND assign_to_id IS NOT NULL
        UNION
        -- Subproject roles
        SELECT project_managers_id FROM subprojects WHERE project_id = ? AND project_managers_id IS NOT NULL
        UNION
        SELECT team_lead_id FROM subprojects WHERE project_id = ? AND team_lead_id IS NOT NULL
        UNION
        SELECT assign_to_id FROM subprojects WHERE project_id = ? AND assign_to_id IS NOT NULL
      )
      AND a.account_status = 1
      ORDER BY a.fullname
    `;

    const [contributorRows] = await db.query(contributorsQuery, [
      projectId,
      projectId,
      projectId, // Project roles
      projectId,
      projectId,
      projectId, // Subproject roles
    ]);

    // Get timeline events
    const timelineQuery = `
      SELECT 
        'project_created' AS event_type,
        'Project Created' AS event_name,
        start_date AS event_date,
        NULL AS end_date,
        NULL AS status
      FROM projects 
      WHERE project_id = ?
      
      UNION ALL
      
      SELECT 
        'project_completed' AS event_type,
        'Project Completed' AS event_name,
        NULL AS event_date,
        end_date AS end_date,
        CASE 
          WHEN end_date IS NOT NULL AND end_date <= CURDATE() THEN 'Completed'
          WHEN end_date IS NOT NULL AND end_date > CURDATE() THEN 'Scheduled'
          ELSE 'Not Set'
        END AS status
      FROM projects 
      WHERE project_id = ? AND end_date IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'subproject' AS event_type,
        CONCAT('Subproject: ', subproject_name) AS event_name,
        start_date AS event_date,
        sub_end_date AS end_date,
        subproject_status AS status
      FROM subprojects 
      WHERE project_id = ?
      
      UNION ALL
      
      SELECT 
        'deliverable' AS event_type,
        'Deliverable Mail Sent' AS event_name,
        NULL AS event_date,
        deliverable_mailDate AS end_date,
        CASE 
          WHEN deliverable_mailDate IS NOT NULL THEN 'Sent'
          ELSE 'Not Sent'
        END AS status
      FROM projects 
      WHERE project_id = ? AND deliverable_mailDate IS NOT NULL
      
      ORDER BY COALESCE(event_date, end_date) DESC
    `;

    const [timelineRows] = await db.query(timelineQuery, [
      projectId,
      projectId,
      projectId,
      projectId,
    ]);

    // Calculate summary statistics
    const subprojectStatusSummary = subprojectRows.reduce((acc, sp) => {
      const status = sp.subproject_status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const subprojectUrgencySummary = subprojectRows.reduce((acc, sp) => {
      const urgency = sp.urgency || "unknown";
      acc[urgency] = (acc[urgency] || 0) + 1;
      return acc;
    }, {});

    // Prepare response
    const response = {
      project: projectRows[0],
      subprojects: subprojectRows,
      contributors: contributorRows,
      timeline: timelineRows,
      summary: {
        total_subprojects: subprojectRows.length,
        total_contributors: contributorRows.length,
        subprojects_by_status: subprojectStatusSummary,
        subprojects_by_urgency: subprojectUrgencySummary,
        project_progress: projectRows[0].progress || 0,
        has_revision: !!projectRows[0].revision_project_id,
      },
    };

    console.log(`Successfully fetched details for project ${projectId}`);
    res.json(response);
  } catch (error) {
    console.error("Error fetching project details:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to fetch project details",
      details: error.message,
    });
  }
});

// Optional: Get minimal project info (lighter endpoint)
router.get("/project-minimal/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        project_id,
        project_name,
        urgency,
        p_team,
        progress,
        start_date,
        end_date,
        project_manager,
        team_lead,
        assign_to
      FROM projects 
      WHERE project_id = ?
    `,
      [projectId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching minimal project info:", error);
    res.status(500).json({ error: "Failed to fetch project info" });
  }
});

router.get("/customer-retentation", async (req, res) => {
  try {
    const [rows] = await db.query(getCustomerRetentionQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch the people" });
  }
});


module.exports = router;
//C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\routes\BuildingRoutes.js
