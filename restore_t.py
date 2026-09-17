import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = "import { useTranslation } from 'react-i18next';\n" + content
content = content.replace("function Sales() {", "function Sales() {\n  const { t } = useTranslation();")
content = content.replace("function PaymentBadge({\n  type,\n}) {", "function PaymentBadge({\n  type,\n}) {\n  const { t } = useTranslation();")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
