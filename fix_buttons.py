import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Cancel\n                </button>", "{t(\"common.cancel\")}\n                </button>")
content = content.replace('"Processing..."', '{t("sales.form.processing")}')
content = content.replace('"Complete Sale"', '{t("sales.form.completeSale")}')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
