import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('? {t("sales.form.processing")}', '? t("sales.form.processing")')
content = content.replace(': {t("sales.form.completeSale")}', ': t("sales.form.completeSale")')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
