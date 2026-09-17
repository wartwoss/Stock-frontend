import json
import re

# Add keys to translation.json
for lang, select_storage, search_place in [
    ('en', 'Select storage', 'Search appliance, customer or storage...'),
    ('ku', 'کۆگا هەڵبژێرە', 'گەڕان بۆ ئامێر، کڕیار یان کۆگا...')
]:
    with open(f'src/locales/{lang}/translation.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    d['sales']['form']['selectStorage'] = select_storage
    d['sales']['searchPlace'] = search_place
    
    with open(f'src/locales/{lang}/translation.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)


# Modify Sales.jsx
with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('<option value="">\n                        Select storage\n                      </option>',
                    '<option value="">\n                        {t("sales.form.selectStorage", "Select storage")}\n                      </option>')
code = code.replace('placeholder="Search appliance, customer or storage..."',
                    'placeholder={t("sales.searchPlace", "Search appliance, customer or storage...")}')
code = code.replace('Select storage', '{t("sales.form.selectStorage", "Select storage")}')

with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
