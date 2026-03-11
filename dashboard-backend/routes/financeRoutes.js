const express = require("express");
const router = express.Router();
const db = require("../dbtest");
const { getCardSummaryQuery } = require("../queries/financeQueries");
const { getMonthlyTotalBarChartQuery } = require("../queries/financeQueries");
const { getYearlySalesPerformanceQuery } = require("../queries/financeQueries");
const { getMonthlyTeamPercentageQuery } = require("../queries/financeQueries");
const { getMonthlyTeamTotalsQuery } = require("../queries/financeQueries");
const { getMonthlyStateTotalsQuery } = require("../queries/financeQueries");
router.get("/card-summary", async (req, res) => {
  try {
    const [rows] = await db.query(getCardSummaryQuery);
    res.json(rows[0]); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly-total", async (req, res) => {
  try {
    const [rows] = await db.query(getMonthlyTotalBarChartQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monthly totals" });
  }
});

router.get("/yearly-total", async (req, res) => {
  try {
    const [rows] = await db.query(getYearlySalesPerformanceQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch yearly sales totals" });
  }
});
router.get("/monthly-team-percentage", async (req, res) => {
  try {
    const [rows] = await db.query(getMonthlyTeamPercentageQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch team percentage" });
  }
});

router.get("/monthly-team-query", async (req, res) => {
  try {
    const [rows] = await db.query(getMonthlyTeamTotalsQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch the sales total " });
  }
});


router.get("/state-sales-summary", async (req, res) => {
  try {
    const [rows] = await db.query(getMonthlyStateTotalsQuery);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch state sales summary" });
  }
});
module.exports = router;

//C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\routes\financeRoutes.js
