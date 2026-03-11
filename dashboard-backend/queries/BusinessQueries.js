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
  AND BINARY p_team LIKE '%Accounts%'
GROUP BY DATE_FORMAT(service_date, '%Y-%m')
ORDER BY service_month;
`;

const getGreenUrgencyProjectsQuery = `
SELECT *
FROM projects
WHERE urgency = 'green'
  AND p_team LIKE '%Accounts%'
  AND start_date >= '2023-01-01'
  AND start_date <= CURDATE()
ORDER BY start_date ASC;
`;

const getJoiningPeopleQuery = `
SELECT 
    DATE_FORMAT(e.doj, '%Y-%m') AS join_month,
    COUNT(e.Employee_id) AS people_joined       
FROM csa_finance_employee_info e
INNER JOIN tbl_admin a 
    ON e.tbl_admin_id = a.user_id
WHERE a.p_team = 'Accounts'
  AND e.doj >= '2023-01-01'
GROUP BY DATE_FORMAT(e.doj, '%Y-%m')
ORDER BY join_month ASC;
`;

const getClosedProjectQuery = `
SELECT 
    DATE_FORMAT(end_date, '%Y-%m') AS close_month,
    COUNT(*) AS total_closed_projects
FROM projects
WHERE p_team LIKE '%Accounts%'
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
WHERE LOWER(ci.p_team) LIKE '%accounts%'
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
WHERE LOWER(p_team) LIKE '%accounts%'
  AND service_date >= '2023-01-01'
  AND service_date <= CURDATE()
GROUP BY 
    DATE_FORMAT(service_date, '%Y-%m')
ORDER BY 
    project_month ASC;
`;

const getamountPeopleperSalesQuery = `
SELECT 
    DATE_FORMAT(service_date, '%Y-%m') AS invoice_month,
    SUM(amount) AS total_amount
FROM csa_finance_invoiced
WHERE LOWER(p_team) LIKE '%accounts%'
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
  AND LOWER(a.p_team) LIKE '%account%'
  AND (
        LOWER(sp.p_team) LIKE '%account%'
        OR sp.p_team IS NULL
      )
  AND (
        LOWER(p.p_team) LIKE '%account%'
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

module.exports = {
  getMonthlyTotalBarChartQuery,
  getGreenUrgencyProjectsQuery,
  getJoiningPeopleQuery,
  getClosedProjectQuery,
  getprojectPerClientQuery,
  getprojectPerMonthQuery,
  getamountPeopleperSalesQuery,
  getEmployeeEvolutionQuery,
};
