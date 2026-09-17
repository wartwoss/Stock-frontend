import json
import sys

# English
with open('src/locales/en/translation.json', 'r', encoding='utf-8') as f:
    en = json.load(f)

if 'form' not in en['credits']:
    en['credits']['form'] = {}
en['credits']['form']['cancel'] = "Cancel"
en['credits']['form']['remaining'] = "Remaining"

with open('src/locales/en/translation.json', 'w', encoding='utf-8') as f:
    json.dump(en, f, indent=2, ensure_ascii=False)


# Kurdish
with open('src/locales/ku/translation.json', 'r', encoding='utf-8') as f:
    ku = json.load(f)

if 'form' not in ku['credits']:
    ku['credits']['form'] = {}
ku['credits']['form']['cancel'] = "پاشگەزبوونەوە"
ku['credits']['form']['remaining'] = "ماوە"

with open('src/locales/ku/translation.json', 'w', encoding='utf-8') as f:
    json.dump(ku, f, indent=2, ensure_ascii=False)


# Modify Credits.jsx
with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    credits_code = f.read()

# 1. formatCurrency selectedCredit.currency missing fix
old_fmt = """                    <strong>
                      {formatCurrency(
                        selectedCredit.remaining_debt
                      )}
                    </strong>"""
new_fmt = """                    <strong>
                      {formatCurrency(
                        selectedCredit.remaining_debt, selectedCredit.currency
                      )}
                    </strong>"""
credits_code = credits_code.replace(old_fmt, new_fmt)

# 2. Add t() to Remaining
old_rem = """                    <span>
                      Remaining
                    </span>"""
new_rem = """                    <span>
                      {t("credits.form.remaining")}
                    </span>"""
credits_code = credits_code.replace(old_rem, new_rem)

# Wait, check if there's any other "Remaining"
# I see one at line 727: title="Remaining Debt", wait, that is title={t("credits.outstandingDebt", "Remaining Debt")} maybe? 
# Wait, "Remaining Debt" in details modal is line 727.
# Let's fix that if not translated yet.
old_det_rem = 'title="Remaining Debt"'
new_det_rem = 'title={t("credits.outstandingDebt", "Remaining Debt")}'
credits_code = credits_code.replace(old_det_rem, new_det_rem)

old_det_tot = 'title="Total Amount"'
new_det_tot = 'title={t("credits.col.total", "Total Amount")}'
credits_code = credits_code.replace(old_det_tot, new_det_tot)

old_det_down = 'title="Down Payment"'
new_det_down = 'title={t("sales.form.downPayment", "Down Payment")}'
credits_code = credits_code.replace(old_det_down, new_det_down)

old_det_inst = 'title="Installment"'
new_det_inst = 'title={t("credits.col.installment", "Installment")}'
credits_code = credits_code.replace(old_det_inst, new_det_inst)

old_det_made = 'title="Payments Made"'
new_det_made = 'title={t("credits.col.progress", "Payments Made")}'
credits_code = credits_code.replace(old_det_made, new_det_made)

old_det_next = 'title="Next Due"'
new_det_next = 'title={t("credits.col.nextDue", "Next Due")}'
credits_code = credits_code.replace(old_det_next, new_det_next)


with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(credits_code)

print("Done fixing Remaining and cancel")
