import re
with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace("setSales([success, ...sales]);\n        closeModal();", "setSales([success, ...sales]);\n        closeModal();\n        window.open(`/receipt/sale/${success.id}`, '_blank');")

code = re.sub(r'<th>\{t\("sales\.col\.date", "Date"\)\}</th>\s*</tr>', '<th>{t("sales.col.date", "Date")}</th>\n                    <th></th>\n                  </tr>', code)

code = re.sub(
    r'(<td>\s*\{formatDate\(\s*sale\.sale_date\s*\)\}\s*</td>\s*)</tr>',
    r'\1<td>\n                          <button\n                            onClick={() => window.open(`/receipt/sale/${sale.id}`, "_blank")}\n                            className="secondary-button"\n                            style={{ padding: "4px 8px", fontSize: "12px" }}\n                          >\n                            {t("receipt.print", "Print")}\n                          </button>\n                        </td>\n                      </tr>',
    code
)

with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
