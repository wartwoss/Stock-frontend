with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Summary card titles
code = code.replace('title="Total Credits"', 'title={t("credits.totalCredits")}')
code = code.replace('title="Outstanding Debt"', 'title={t("credits.outstandingDebt")}')
code = code.replace('title="Upcoming"', 'title={t("credits.upcoming")}')
code = code.replace('title="Overdue"', 'title={t("credits.overdue")}')

# 2. Tabs
code = code.replace('label="All"', 'label={t("credits.tabs.all")}')
code = code.replace('label="Active"', 'label={t("credits.tabs.active")}')
code = code.replace('label="Upcoming"', 'label={t("credits.tabs.upcoming")}')
code = code.replace('label="Overdue"', 'label={t("credits.tabs.overdue")}')
code = code.replace('label="Completed"', 'label={t("credits.tabs.completed")}')

# 3. Table headers
table_header_old = """                <tr>
                  <th>{t("credits.customer")}</th>
                  <th>{t("credits.appliance")}</th>
                  <th>Total</th>
                  <th>{t("credits.remaining")}</th>
                  <th>Installment</th>
                  <th>{t("credits.progress")}</th>
                  <th>Next Due</th>
                  <th>{t("credits.status")}</th>
                  <th>{t("credits.actions")}</th>
                </tr>"""

table_header_new = """                <tr>
                  <th>{t("credits.col.customer")}</th>
                  <th>{t("credits.col.appliance")}</th>
                  <th>{t("credits.col.total")}</th>
                  <th>{t("credits.col.remaining")}</th>
                  <th>{t("credits.col.installment")}</th>
                  <th>{t("credits.col.progress")}</th>
                  <th>{t("credits.col.nextDue")}</th>
                  <th>{t("credits.col.status")}</th>
                  <th>{t("credits.col.actions")}</th>
                </tr>"""

assert table_header_old in code, 'Old table header not found'
code = code.replace(table_header_old, table_header_new)

# 4. CreditStatus function
old_status = """function CreditStatus({
  credit,
}) {
  const remaining =
    Number(
      credit.remaining_debt ??
        0
    );
  let status =
    credit.status ?? "active";
  if (remaining <= 0) {
    status = "completed";
  }
  return (
    <span
      className={`credit-status ${status}`}
    >
      {status === "completed"
        ? "Completed"
        : status === "overdue"
          ? "Overdue"
          : "Active"}
    </span>
  );
}"""

new_status = """function CreditStatus({
  credit,
}) {
  const { t } = useTranslation();
  const remaining =
    Number(
      credit.remaining_debt ??
        0
    );
  let status =
    credit.status ?? "active";
  if (remaining <= 0) {
    status = "completed";
  }
  return (
    <span
      className={`credit-status ${status}`}
    >
      {t(`credits.status.${status}`, status)}
    </span>
  );
}"""

assert old_status in code, 'Old CreditStatus not found'
code = code.replace(old_status, new_status)

# 5. Pay button
code = code.replace("Pay\n                               </button>", '{t("credits.pay")}\n                               </button>')

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Credits.jsx updated successfully')
