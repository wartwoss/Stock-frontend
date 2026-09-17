import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('|| {t("sales.form.selectCustomer")}', '|| t("sales.form.selectCustomer")')
content = content.replace(': {t("sales.form.selectCustomer")}', ': t("sales.form.selectCustomer")')
content = content.replace('|| {t("sales.form.selectAppliance")}', '|| t("sales.form.selectAppliance")')
content = content.replace(': {t("sales.form.selectAppliance")}', ': t("sales.form.selectAppliance")')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
