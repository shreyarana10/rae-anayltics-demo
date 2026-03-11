const express = require("express");
const router = express.Router();
const db = require("../dbtest");
const {
  getPotentialProjectPie,
  getPotentialSentPie,
  getAcceptedQuotationPie,
  getCancelledQuotationPie,
  getSalesByTeamPENQ,
  getSalesByTeamQS,
  getSalesByTeamAQ,
  getSalesByTeamCQ,
  getStateBreakdownPENQ,
  getStateBreakdownQS,
  getStateBreakdownAQ,
  getStateBreakdownCQ,
} = require("../queries/SalesQueries");

// ── Allowed teams (whitelist to prevent SQL injection via LIKE) ──
const VALID_TEAMS = ["building", "industrial", "it", "accounts"];

function getTeam(req, res) {
  const team = (req.query.team || "").toLowerCase().trim();
  if (!VALID_TEAMS.includes(team)) {
    res.status(400).json({
      error: `Invalid team. Must be one of: ${VALID_TEAMS.join(", ")}`,
    });
    return null;
  }
  return team;
}

// ── PIE ROUTES  (GET /api/sales/potential-project-pie?team=building) ──

router.get("/potential-project-pie", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getPotentialProjectPie(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch potential project pie data" });
  }
});

router.get("/potential-sent-pie", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getPotentialSentPie(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent quotation pie data" });
  }
});

router.get("/accepted-quotation-pie", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getAcceptedQuotationPie(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch accepted quotation pie data" });
  }
});

router.get("/cancelled-quotation-pie", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getCancelledQuotationPie(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to fetch cancelled quotation pie data" });
  }
});

// ── BAR CHART ROUTES  (GET /api/sales/team-penq?team=building) ──

router.get("/team-penq", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getSalesByTeamPENQ(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch PENQ bar data" });
  }
});

router.get("/team-qs", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getSalesByTeamQS(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch QS bar data" });
  }
});

router.get("/team-aq", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getSalesByTeamAQ(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch AQ bar data" });
  }
});

router.get("/team-cq", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getSalesByTeamCQ(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch CQ bar data" });
  }
});

// ── STATE BREAKDOWN ROUTES (GET /api/sales/state-penq?team=building) ──

router.get("/state-penq", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getStateBreakdownPENQ(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch state PENQ data" });
  }
});

router.get("/state-qs", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getStateBreakdownQS(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch state QS data" });
  }
});

router.get("/state-aq", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getStateBreakdownAQ(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch state AQ data" });
  }
});

router.get("/state-cq", async (req, res) => {
  const team = getTeam(req, res);
  if (!team) return;
  try {
    const [sql, params] = getStateBreakdownCQ(team);
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch state CQ data" });
  }
});

module.exports = router;
// C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\routes\SalesRoutes.js
