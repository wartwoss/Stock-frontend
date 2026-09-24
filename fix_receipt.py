import re
with open('src/pages/Receipt.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('import { format } from "date-fns";', '')

code = code.replace(
    'format(new Date(dateStr), "PP")',
    'new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })'
)

with open('src/pages/Receipt.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
