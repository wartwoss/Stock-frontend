import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# PaymentBadge translation
content = content.replace("Credit\n      </span>", "{t(\"sales.form.credit\")}\n      </span>")
content = content.replace("Cash\n    </span>", "{t(\"sales.form.cash\")}\n    </span>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
