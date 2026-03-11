// ============================================================
// Each function accepts a `team` string (e.g. "building", "industrial", "it", "accounts")
// and returns a parameterised [sql, params] pair for use with db.query(sql, params)
// Usage: const [sql, params] = getPotentialProjectPie("building");
//        const [rows] = await db.query(sql, params);
// ============================================================

// ── PIE QUERIES (current month only) ────────────────────────

const getPotentialProjectPie = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM potential_project
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
`,
  [`%${team}%`],
];

const getPotentialSentPie = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM potential_project_sent_quotation
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
`,
  [`%${team}%`],
];

const getAcceptedQuotationPie = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM accepted_quotations
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
`,
  [`%${team}%`],
];

const getCancelledQuotationPie = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM cancelled_quotations
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
`,
  [`%${team}%`],
];

// ── BAR CHART QUERIES (all months grouped) ──────────────────

const getSalesByTeamPENQ = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM potential_project
  WHERE team LIKE ?
  GROUP BY DATE_FORMAT(quote_sent_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

const getSalesByTeamQS = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM potential_project_sent_quotation
  WHERE team LIKE ?
  GROUP BY DATE_FORMAT(quote_sent_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

const getSalesByTeamAQ = (team) => [
  `
  SELECT
    DATE_FORMAT(accepted_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM accepted_quotations
  WHERE team LIKE ?
  GROUP BY DATE_FORMAT(accepted_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

const getSalesByTeamCQ = (team) => [
  `
  SELECT
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM cancelled_quotations
  WHERE team LIKE ?
  GROUP BY DATE_FORMAT(quote_sent_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

// ── STATE BREAKDOWN QUERIES (current month, grouped by state) ──

const getStateBreakdownPENQ = (team) => [
  `
  SELECT
    state,
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM potential_project
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
  GROUP BY state, DATE_FORMAT(quote_sent_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

const getStateBreakdownQS = (team) => [
  `
  SELECT
    state,
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM potential_project_sent_quotation
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
  GROUP BY state, DATE_FORMAT(quote_sent_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

const getStateBreakdownAQ = (team) => [
  `
  SELECT
    state,
    DATE_FORMAT(accepted_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM accepted_quotations
  WHERE team LIKE ?
    AND MONTH(accepted_date) = MONTH(CURDATE())
    AND YEAR(accepted_date)  = YEAR(CURDATE())
  GROUP BY state, DATE_FORMAT(accepted_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

const getStateBreakdownCQ = (team) => [
  `
  SELECT
    state,
    DATE_FORMAT(quote_sent_date,'%Y-%m') AS month,
    SUM(CASE WHEN hunter = 1 THEN estimate_amount ELSE 0 END) AS hunter_amount,
    SUM(CASE WHEN gather = 1 THEN estimate_amount ELSE 0 END) AS gather_amount,
    SUM(estimate_amount) AS total_amount
  FROM cancelled_quotations
  WHERE team LIKE ?
    AND MONTH(quote_sent_date) = MONTH(CURDATE())
    AND YEAR(quote_sent_date)  = YEAR(CURDATE())
  GROUP BY state, DATE_FORMAT(quote_sent_date,'%Y-%m')
  ORDER BY month
`,
  [`%${team}%`],
];

module.exports = {
  // pie
  getPotentialProjectPie,
  getPotentialSentPie,
  getAcceptedQuotationPie,
  getCancelledQuotationPie,
  // bar charts
  getSalesByTeamPENQ,
  getSalesByTeamQS,
  getSalesByTeamAQ,
  getSalesByTeamCQ,
  // state breakdown (current month)
  getStateBreakdownPENQ,
  getStateBreakdownQS,
  getStateBreakdownAQ,
  getStateBreakdownCQ,
};
// C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\queries\SalesQueries.js
