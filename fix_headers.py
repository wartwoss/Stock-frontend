import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the untranslated headers
content = content.replace("<th>Storage</th>", "<th>{t(\"sales.form.storage\")}</th>")
content = content.replace("<th>Quantity</th>", "<th>{t(\"sales.form.quantity\")}</th>")
content = content.replace("<th>Customer</th>", "<th>{t(\"sales.form.customer\")}</th>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
