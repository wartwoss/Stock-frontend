import re
with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'<p>\s*Record a new product\s*sale\.\s*</p>', '<p>{t("sales.form.recordNewSale", "Record a new product sale.")}</p>', code)

with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
