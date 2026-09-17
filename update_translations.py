import json
import os

en_path = "src/locales/en/translation.json"
ku_path = "src/locales/ku/translation.json"

with open(en_path, "r", encoding="utf-8") as f:
    en_data = json.load(f)

with open(ku_path, "r", encoding="utf-8") as f:
    ku_data = json.load(f)

# Add keys to english
en_data["sales"]["form"]["recordNewSale"] = "Record a new product sale."
en_data["sales"]["installmentDetails"] = "Installment Details"

# Add keys to kurdish
ku_data["sales"]["form"]["recordNewSale"] = "فرۆشتنێکی نوێی بەرهەم تۆمار بکە."
ku_data["sales"]["installmentDetails"] = "وردەکارییەکانی قست"

with open(en_path, "w", encoding="utf-8") as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

with open(ku_path, "w", encoding="utf-8") as f:
    json.dump(ku_data, f, ensure_ascii=False, indent=2)
