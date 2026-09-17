import re
with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'<label>\s*Appliance\s*</label>', '<label>{t("sales.form.appliance", "Appliance")}</label>', code)
code = re.sub(r'<label>\s*Storage\s*</label>', '<label>{t("sales.form.storage", "Storage")}</label>', code)
code = re.sub(r'<label>\s*Quantity\s*</label>', '<label>{t("sales.form.quantity", "Quantity")}</label>', code)
code = re.sub(r'<label>\s*Selling Price\s*</label>', '<label>{t("sales.form.sellingPrice", "Selling Price")}</label>', code)

# Note: "Select appliance" string replaces might mess up the conditional if we replace literal string vs expression.
# The original code was: `? appliances.find(...)?.name || "Select appliance" : "Select appliance"`
code = code.replace('"Select appliance"', 't("sales.form.selectAppliance", "Select appliance")')
code = code.replace('<h2>Select Appliance</h2>', '<h2>{t("sales.form.selectAppliance", "Select appliance")}</h2>')

with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
