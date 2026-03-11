const getMonthlyTotalBarChartQuery = `
SELECT 
    DATE_FORMAT(service_date, '%Y-%m') AS service_month,
    SUM(amount) AS sumTotal
FROM csa_finance_invoiced
WHERE service_date >= DATE_FORMAT(
        DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01'
    )
  AND service_date < DATE_ADD(
        DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH
    )
  AND BINARY p_team LIKE '%it%'
GROUP BY DATE_FORMAT(service_date, '%Y-%m')
ORDER BY service_month;
`;

const getGreenUrgencyProjectsQuery = `
SELECT *
FROM projects
WHERE urgency = 'green'
  AND p_team LIKE '%it%'
  AND start_date >= '2023-01-01'
  AND start_date <= CURDATE()
ORDER BY start_date ASC;
`;
const getJoiningPeopleQuery = `
SELECT
    join_month,
    monthly_joins,
    SUM(monthly_joins) OVER (ORDER BY join_month) AS cumulative_joins
FROM (
    SELECT
        DATE_FORMAT(
            STR_TO_DATE(e.doj, '%Y-%m-%d'),
            '%Y-%m'
        ) AS join_month,
        COUNT(*) AS monthly_joins
    FROM csa_finance_employee_info e
    JOIN tbl_admin a
        ON e.tbl_admin_id = a.user_id
    WHERE STR_TO_DATE(e.doj, '%Y-%m-%d') >= '2023-01-01'
      AND a.p_team LIKE '%it%'
    GROUP BY join_month
) t
ORDER BY join_month;`;

const getClosedProjectQuery = `
SELECT 
    DATE_FORMAT(end_date, '%Y-%m') AS close_month,
    COUNT(*) AS total_closed_projects
FROM projects
WHERE p_team LIKE '%it%'
  AND end_date IS NOT NULL
  AND end_date >= '2023-01-01'
  AND end_date <= CURDATE()
GROUP BY YEAR(end_date), MONTH(end_date)
ORDER BY YEAR(end_date), MONTH(end_date);
`;

const getprojectPerClientQuery = `
SELECT 
    DATE_FORMAT(ci.service_date, '%Y-%m') AS project_month,
    ci.customer_name,
    c.contact_email,
    c.contact_phone_number,
    COUNT(DISTINCT ci.project_id) AS total_projects
FROM csa_finance_invoiced ci
LEFT JOIN contacts c
    ON LOWER(ci.customer_name) = LOWER(c.customer_name)
WHERE LOWER(ci.p_team) LIKE '%it%'
  AND ci.service_date >= '2023-01-01'
  AND ci.service_date <= CURDATE()
GROUP BY 
    DATE_FORMAT(ci.service_date, '%Y-%m'),
    ci.customer_name,
    c.contact_email,
    c.contact_phone_number
ORDER BY 
    project_month ASC,
    total_projects DESC;
`;

const getprojectPerMonthQuery = `
SELECT 
    DATE_FORMAT(service_date, '%Y-%m') AS project_month,
    COUNT(DISTINCT project_id) AS total_projects
FROM csa_finance_invoiced
WHERE LOWER(p_team) LIKE '%it%'
  AND service_date >= '2023-01-01'
  AND service_date <= CURDATE()
GROUP BY 
    DATE_FORMAT(service_date, '%Y-%m')
ORDER BY 
    project_month ASC;`;

const getamountPeopleperSalesQuery = `
    SELECT 
    DATE_FORMAT(service_date, '%Y-%m') AS invoice_month,
    SUM(amount) AS total_amount
FROM csa_finance_invoiced
WHERE LOWER(p_team) LIKE '%it%'
  AND service_date >= '2023-01-01'
  AND service_date <= CURDATE()
GROUP BY 
    YEAR(service_date), MONTH(service_date)
ORDER BY 
    YEAR(service_date), MONTH(service_date);
    `;

const getEmployeeEvolutionQuery = `
SELECT
    a.user_id,
    a.fullname,
    a.email,
    a.p_team,

    CASE
        WHEN a.Isadmin = 1 THEN 'Admin'
        WHEN a.user_role = 'Manager' THEN 'Project Manager'
        WHEN a.user_role = 'TL' THEN 'Team Lead'
        ELSE 'Engineer'
    END AS designation,

    COUNT(DISTINCT p.project_id) AS total_projects_worked,
    COUNT(DISTINCT sp.table_id)  AS total_subprojects_worked

FROM tbl_admin a

LEFT JOIN subprojects sp
    ON (
        sp.project_managers_id = a.user_id
        OR sp.team_lead_id = a.user_id
        OR sp.assign_to_id = a.user_id
    )

LEFT JOIN projects p
    ON p.project_id = sp.project_id

WHERE a.account_status = 1
  AND LOWER(a.p_team) LIKE '%it%'
  AND (
        LOWER(sp.p_team) LIKE '%it%'
        OR sp.p_team IS NULL
      )
  AND (
        LOWER(p.p_team) LIKE '%it%'
        OR p.p_team IS NULL
      )

GROUP BY
    a.user_id,
    a.fullname,
    a.email,
    a.p_team,
    designation

ORDER BY a.fullname;
`;

const getCustomerRetentionQuery = `
SELECT 
    c.customer_name AS client_name,
    p.project_name AS project_title,
    c.contact_phone_number,
    c.contact_email,
    p.p_team AS team,

    -- Expected project time
    p.EPT AS expected_project_hours,

    -- Actual hours from timesheet
    IFNULL(SUM(t.working_hours),0) AS actual_hours_taken,

    -- Difference between expected and actual
    (p.EPT - IFNULL(SUM(t.working_hours),0)) AS hours_difference,

    -- Employee hours
    GROUP_CONCAT(
        DISTINCT CONCAT(a.fullname,' (',t.working_hours,'h)')
        SEPARATOR ', '
    ) AS employee_hours,

    -- People working from project table
    GROUP_CONCAT(DISTINCT 
        TRIM(
            SUBSTRING_INDEX(SUBSTRING_INDEX(
                CONCAT_WS(',',
                    p.project_manager,
                    p.team_lead,
                    p.assign_to,
                    p.additional_engineers
                ), ',', numbers.n), ',', -1)
        )
        ORDER BY 
        TRIM(
            SUBSTRING_INDEX(SUBSTRING_INDEX(
                CONCAT_WS(',',
                    p.project_manager,
                    p.team_lead,
                    p.assign_to,
                    p.additional_engineers
                ), ',', numbers.n), ',', -1)
        )
        SEPARATOR ', '
    ) AS people_working,

    -- Total number of people
    (
        (CASE WHEN p.project_manager IS NOT NULL AND p.project_manager != '' THEN 1 ELSE 0 END) +
        (CASE WHEN p.team_lead IS NOT NULL AND p.team_lead != '' THEN 1 ELSE 0 END) +
        (CASE WHEN p.assign_to IS NOT NULL AND p.assign_to != '' THEN 1 ELSE 0 END) +
        (CASE WHEN p.additional_engineers IS NOT NULL AND p.additional_engineers != '' THEN 1 ELSE 0 END)
    ) AS total_people,

    COUNT(DISTINCT p.project_id) AS total_projects,

    SUM(f.price) AS total_amount,

    MAX(f.date) AS invoiced_date

FROM contacts c

JOIN projects p 
    ON c.contact_id = p.contact_id

LEFT JOIN csa_finance_readytobeinvoiced f
    ON p.project_id = f.project_id

LEFT JOIN timesheet t
    ON p.project_id = t.project_id_timesheet

LEFT JOIN tbl_admin a
    ON t.user_id = a.user_id

CROSS JOIN (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) numbers

WHERE p.p_team LIKE '%it%'
AND numbers.n <= (
    LENGTH(CONCAT_WS(',',
        p.project_manager,
        p.team_lead,
        p.assign_to,
        p.additional_engineers
    )) 
    - LENGTH(REPLACE(CONCAT_WS(',',
        p.project_manager,
        p.team_lead,
        p.assign_to,
        p.additional_engineers
    ), ',', '')) + 1
)

GROUP BY 
    c.customer_name,
    p.project_name,
    c.contact_phone_number,
    c.contact_email,
    p.p_team,
    p.project_manager,
    p.team_lead,
    p.assign_to,
    p.additional_engineers,
    p.EPT

ORDER BY c.customer_name;
`;
module.exports = {
  getMonthlyTotalBarChartQuery,
  getGreenUrgencyProjectsQuery,
  getJoiningPeopleQuery,
  getClosedProjectQuery,
  getprojectPerClientQuery,
  getprojectPerMonthQuery,
  getamountPeopleperSalesQuery,
  getEmployeeEvolutionQuery,
  getCustomerRetentionQuery,
};
//C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-backend\queries\itQueries.js
