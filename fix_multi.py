import re

with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    sales = f.read()

sales = sales.replace('import {\n  getCustomers,\n  createCustomer,\n} from "../api/customers";',
                      'import {\n  getCustomers,\n  createCustomer,\n} from "../api/customers";\nimport { useExchangeRate } from "../contexts/ExchangeRateContext";')

# add useTranslation to Sales if missing (wait it is there already)

with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(sales)


with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    credits = f.read()

credits = credits.replace('formatCurrency(\n                        Math.min(\n                          Number(\n                            selectedCredit.installment_amount\n                          ),\n                          Number(\n                            selectedCredit.remaining_debt\n                          )\n                        )\n                      )',
                          'formatCurrency(\n                        Math.min(\n                          Number(\n                            selectedCredit.installment_amount\n                          ),\n                          Number(\n                            selectedCredit.remaining_debt\n                          )\n                        ), selectedCredit.currency\n                      )')

# Fix saving / Record Payment translation
credits = credits.replace('? "Recording..."\n                      : "Record Payment"',
                          '? t("credits.form.recording", "Recording...")\n                      : t("credits.form.recordPayment", "Record Payment")')

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(credits)

print("Fixed imports and remaining format calls")
