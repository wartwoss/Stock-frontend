import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Select appliance
content = content.replace('"Select appliance"', '{t("sales.form.selectAppliance")}')
content = content.replace('<h2>Select Appliance</h2>', '<h2>{t("sales.form.selectAppliance")}</h2>')
content = content.replace('"Search appliances..."', '{t("sales.form.searchAppliances")}')

# Select customer
content = content.replace('"Select customer"', '{t("sales.form.selectCustomer")}')
content = content.replace('<h2>Select Customer</h2>', '<h2>{t("sales.form.selectCustomer")}</h2>')
content = content.replace('"Search customers..."', '{t("sales.form.searchCustomers")}')

# Also wait, is "Search appliance, customer or storage..." translated?
content = content.replace('"Search appliance, customer or storage..."', '{t("common.searchPlace")}')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
