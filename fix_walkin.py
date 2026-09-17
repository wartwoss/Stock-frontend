import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("Walk-in Customer", "{t(\"sales.walkIn\")}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
