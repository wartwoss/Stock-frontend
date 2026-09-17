import re

file_path = "src/pages/Sales.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update createEmptyForm customer_mode to "existing"
content = re.sub(
    r'customer_mode: "none",',
    r'customer_mode: "existing",',
    content
)

# 2. Table Headers
content = content.replace("<th>Sale</th>", "<th>{t(\"sales.col.sale\")}</th>")
content = content.replace("<th>Unit Price</th>", "<th>{t(\"sales.col.unitPrice\")}</th>")
content = content.replace("<th>Total</th>", "<th>{t(\"sales.col.total\")}</th>")
content = content.replace("<th>Payment</th>", "<th>{t(\"sales.col.payment\")}</th>")
content = content.replace("<th>Date</th>", "<th>{t(\"sales.col.date\")}</th>")

# 3. New Sale Box - Subtitle
content = content.replace("Record a new product\n                  sale.", "{t(\"sales.form.recordNewSale\")}")

# 4. Cash payment options text
content = content.replace("Paid immediately", "{t(\"sales.form.paidImmediately\")}")
content = content.replace("<strong>\n                        Cash\n                      </strong>", "<strong>\n                        {t(\"sales.form.cash\")}\n                      </strong>")

# 5. Credit payment options text
content = content.replace("<span>\n                        Installments\n                      </span>", "<span>\n                        {t(\"sales.form.installments\")}\n                      </span>")
content = content.replace("<strong>\n                        Credit\n                      </strong>", "<strong>\n                        {t(\"sales.form.credit\")}\n                      </strong>")

# 6. Customer Section Title
content = re.sub(
    r'\{form\.payment_type === "cash"\s*\?\s*"Customer \(Optional — For Warranty / Record\)"\s*:\s*"Customer \(Required for Credit Agreement\)"\}',
    r'{t("sales.form.customerRequired")}',
    content
)

# 7. Customer Mode Buttons
content = re.sub(
    r'\{form\.payment_type === "cash" && \([\s\S]*?Walk-in \(No customer\)[\s\S]*?<\/button>\s*\)\}',
    r'',
    content
)

content = content.replace(">Existing Customer<", ">{t(\"sales.form.existingCustomer\")}<")
content = content.replace(">New Customer<", ">{t(\"sales.form.newCustomer\")}<")
content = content.replace("Existing Customer", "{t(\"sales.form.existingCustomer\")}")
content = content.replace("New Customer", "{t(\"sales.form.newCustomer\")}")

# 8. Remove the text below customer mode
content = re.sub(
    r'\{form\.customer_mode === "none" \? \([\s\S]*?warranty tracking\.\s*<\/div>\s*\)\s*:\s*form\.customer_mode ===\s*"existing" \? \(',
    r'{form.customer_mode === "existing" ? (',
    content
)

# 9. Selling Price Label
content = re.sub(
    r'<label>\s*Selling Price\s*<\/label>',
    r'<label>{t("sales.form.sellingPrice")}</label>',
    content
)

# 10. Sale Date Label
content = re.sub(
    r'<label>\s*Sale Date\s*<\/label>',
    r'<label>{t("sales.form.saleDate")}</label>',
    content
)

# 11. Total Sale Amount
content = re.sub(
    r'<span>\s*Total Sale Amount\s*<\/span>',
    r'<span>{t("sales.form.totalAmount")}</span>',
    content
)

# 12. Description / Warranty Note
content = re.sub(
    r'<label>\s*Description / Warranty Note\s*<\/label>',
    r'<label>{t("sales.form.descWarrantyNote")}</label>',
    content
)

content = content.replace('"Optional warranty or customer note"', '{t("sales.form.optionalNotePlaceholder")}')

# 13. Installment Details
content = content.replace("Installment Details\n                  </div>", "{t(\"sales.installmentDetails\")}\n                  </div>")

# 14. First Due Date
content = re.sub(
    r'<label>\s*First Due Date\s*<\/label>',
    r'<label>{t("sales.form.firstDueDate")}</label>',
    content
)

# 15. Remaining Debt
content = re.sub(
    r'<span>\s*Remaining Debt\s*<\/span>',
    r'<span>{t("sales.form.remainingDebt")}</span>',
    content
)

# 16. Estimated Installment
content = re.sub(
    r'<span>\s*Estimated Installment\s*<\/span>',
    r'<span>{t("sales.form.estimatedInstallment")}</span>',
    content
)

# 17. Update Cash payment validation error messages
content = content.replace(
    '"Please select a customer, or choose \'Walk-in\' for an unregistered buyer."',
    't("sales.form.selectCustomer")'
)
content = content.replace(
    '"Customer name and phone number are required, or choose \'Walk-in\'."',
    't("sales.form.customerRequiredError")'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
