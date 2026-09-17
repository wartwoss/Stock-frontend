import re
with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()
code = code.replace('<h3>No sales yet</h3>', '<h3>{t("sales.noSales", "No sales yet")}</h3>')
code = re.sub(r'<p>\s*Record your first sale\.\s*</p>', '<p>{t("sales.noSalesDesc", "Record your first sale.")}</p>', code)
with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
