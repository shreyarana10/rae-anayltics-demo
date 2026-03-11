
const getCardSummaryQuery = `
SELECT 
    -- Current month values (for displaying the dollar amount)
    SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%building%'
         AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND service_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        THEN amount ELSE 0 END) AS building_current,

    SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%industrial%'
         AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND service_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        THEN amount ELSE 0 END) AS industrial_current,

    SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%it%'
         AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
         AND service_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        THEN amount ELSE 0 END) AS it_current,

    -- Growth % calculated directly in SQL
    CASE
        WHEN SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%building%'
                  AND service_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                  AND service_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                 THEN amount ELSE 0 END) = 0 THEN NULL
        ELSE ROUND(
            SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%building%'
                  AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                  AND service_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
                 THEN amount ELSE 0 END)
            / SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%building%'
                  AND service_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                  AND service_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                 THEN amount ELSE 0 END)
            * 100 - 100, 2)
    END AS building_growth_pct,

    CASE
        WHEN SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%industrial%'
                  AND service_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                  AND service_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                 THEN amount ELSE 0 END) = 0 THEN NULL
        ELSE ROUND(
            SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%industrial%'
                  AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                  AND service_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
                 THEN amount ELSE 0 END)
            / SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%industrial%'
                  AND service_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                  AND service_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                 THEN amount ELSE 0 END)
            * 100 - 100, 2)
    END AS industrial_growth_pct,

    CASE
        WHEN SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%it%'
                  AND service_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                  AND service_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                 THEN amount ELSE 0 END) = 0 THEN NULL
        ELSE ROUND(
            SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%it%'
                  AND service_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                  AND service_date <  DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
                 THEN amount ELSE 0 END)
            / SUM(CASE WHEN LOWER(TRIM(p_team)) LIKE '%it%'
                  AND service_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                  AND service_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                 THEN amount ELSE 0 END)
            * 100 - 100, 2)
    END AS it_growth_pct

FROM csa_finance_invoiced;
`;

const getMonthlyTotalBarChartQuery = `
SELECT 
    DATE_FORMAT(service_date, '%Y-%m') AS service_month,

    SUM(
        CASE 
            WHEN BINARY p_team LIKE '%Building%'
              OR BINARY p_team LIKE '%Industrial%'
              OR BINARY p_team LIKE '%IT%'
            THEN amount
            ELSE 0
        END
    ) AS sumTotal

FROM csa_finance_invoiced
WHERE service_date >= DATE_FORMAT(
        DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01'
    )
  AND service_date < DATE_ADD(
        DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH
    )

GROUP BY DATE_FORMAT(service_date, '%Y-%m')
ORDER BY service_month;
`;

const getYearlySalesPerformanceQuery = `
SELECT 
    DATE_FORMAT(service_date, '%Y-%m') AS service_month,
    SUM(
        CASE 
            WHEN BINARY p_team LIKE '%Building%'
              OR BINARY p_team LIKE '%Industrial%'
              OR BINARY p_team LIKE '%IT%'
            THEN amount
            ELSE 0
        END
    ) AS sumTotal
FROM csa_finance_invoiced
WHERE service_date >= '2023-07-01'
  AND service_date < DATE_ADD(
        DATE_FORMAT(CURDATE(), '%Y-%m-01'),
        INTERVAL 1 MONTH
    )
GROUP BY DATE_FORMAT(service_date, '%Y-%m')
ORDER BY service_month;
`;
const getMonthlyTeamPercentageQuery = `
SELECT
    DATE_FORMAT(service_date, '%Y-%m') AS service_month,

    -- Amount per team
    SUM(CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END) AS building,
    SUM(CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END) AS industrial,
    SUM(CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END) AS it,

    -- Subtotal
    SUM(
        CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END +
        CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END +
        CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END
    ) AS subtotal,

    -- Percentage per team
    ROUND(
        SUM(CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END) * 100 /
        SUM(
            CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END +
            CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END +
            CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END
        ), 2
    ) AS building_percentage,

    ROUND(
        SUM(CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END) * 100 /
        SUM(
            CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END +
            CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END +
            CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END
        ), 2
    ) AS industrial_percentage,

    ROUND(
        SUM(CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END) * 100 /
        SUM(
            CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END +
            CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END +
            CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END
        ), 2
    ) AS it_percentage

FROM csa_finance_invoiced
WHERE service_date >= '2023-01-01'
  AND service_date <= CURDATE()
GROUP BY service_month
ORDER BY service_month;
`;


const getMonthlyTeamTotalsQuery = `
SELECT
    DATE_FORMAT(service_date, '%Y-%m') AS service_month,
    SUM(CASE WHEN LOWER(p_team) LIKE '%building%' THEN amount ELSE 0 END) AS building_total,
    SUM(CASE WHEN LOWER(p_team) LIKE '%industrial%' THEN amount ELSE 0 END) AS industrial_total,
    SUM(CASE WHEN LOWER(p_team) LIKE '%it%' THEN amount ELSE 0 END) AS it_total
FROM csa_finance_invoiced
WHERE service_date >= '2023-01-01'  -- adjust start date if needed
GROUP BY service_month
ORDER BY service_month;
`;

const getMonthlyStateTotalsQuery = `
SELECT
    p.state,
    SUM(f.amount) AS total_amount
FROM
    csa_finance_invoiced f
JOIN
    projects p ON f.project_id = p.project_id
WHERE
    f.service_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
    AND f.service_date < DATE_FORMAT(CURDATE(), '%Y-%m-01')
    AND LOWER(TRIM(p.state)) LIKE '%%'  -- replace %% dynamically with desired state filter
GROUP BY
    p.state
ORDER BY
    total_amount DESC;
`;
module.exports = {
  getCardSummaryQuery,
  getMonthlyTotalBarChartQuery,
  getYearlySalesPerformanceQuery,
  getMonthlyTeamPercentageQuery,
  getMonthlyTeamTotalsQuery,
  getMonthlyStateTotalsQuery,
};
