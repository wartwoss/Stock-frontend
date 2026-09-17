import re

with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
if 'useTranslation' not in code:
    code = code.replace('import { useExchangeRate } from "../contexts/ExchangeRateContext";',
                        'import { useExchangeRate } from "../contexts/ExchangeRateContext";\nimport { useTranslation } from "react-i18next";')

# 2. Add useTranslation hook inside Sales function
if 'const { t } = useTranslation();' not in code:
    code = code.replace('function Sales() {', 'function Sales() {\n  const { t } = useTranslation();')

# 3. New Sale buttons
code = code.replace('New Sale\n          </button>', '{t("sales.newSale", "New Sale")}\n          </button>')
code = code.replace('New Sale\n              </button>', '{t("sales.newSale", "New Sale")}\n              </button>')
code = code.replace('<h2>New Sale</h2>', '<h2>{t("sales.newSale", "New Sale")}</h2>')
code = code.replace('<p>\n                    Record a new product\n                    sale.\n                  </p>',
                    '<p>{t("sales.form.recordNewSale", "Record a new product sale.")}</p>')

# 4. Summary boxes
code = code.replace('title="Total Sales"', 'title={t("sales.metrics.totalSales", "Total Sales")}')
code = code.replace('title="Units Sold"', 'title={t("sales.metrics.unitsSold", "Units Sold")}')
code = code.replace('title="Cash Sales"', 'title={t("sales.metrics.cashSales", "Cash Sales")}')
code = code.replace('title="Credit Sales"', 'title={t("sales.metrics.creditSales", "Credit Sales")}')

# 5. Table headers
old_th = """              <thead>
                <tr>
                  <th>Sale</th>
                  <th>Storage</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Customer</th>
                  <th>Date</th>
                </tr>
              </thead>"""
new_th = """              <thead>
                <tr>
                  <th>{t("sales.col.sale", "Sale")}</th>
                  <th>{t("sales.col.storage", "Storage")}</th>
                  <th>{t("sales.col.quantity", "Quantity")}</th>
                  <th>{t("sales.col.unitPrice", "Unit Price")}</th>
                  <th>{t("sales.col.total", "Total")}</th>
                  <th>{t("sales.col.payment", "Payment")}</th>
                  <th>{t("sales.col.customer", "Customer")}</th>
                  <th>{t("sales.col.date", "Date")}</th>
                </tr>
              </thead>"""
code = code.replace(old_th, new_th)

with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("Sales.jsx translated successfully")
