import base64
import re

kurdish_text = base64.b64decode('2b7bjti02KfZhtqv2KfbjCDYptin2YbbjA==').decode('utf-8')

with open('src/pages/Receipt.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_header = r'''      <div className="receipt-header">\s*<h1>\{t\("sidebar\.appSubtitle", "Management System"\)\}</h1>\s*<p className="receipt-title">\s*\{isSale \? t\("receipt\.saleReceipt", "Sale Receipt"\) : t\("receipt\.paymentReceipt", "Payment Receipt"\)\}\s*</p>\s*</div>'''

new_header = f'''      <div className="receipt-header">\n        <h1>{kurdish_text}</h1>\n        <p className="receipt-phone" style={{{{ fontSize: "1.1em", fontWeight: "bold", margin: "5px 0" }}}}>0770 156 3081</p>\n        <p className="receipt-title" style={{{{ marginTop: "10px" }}}}>\n          {{isSale ? t("receipt.saleReceipt", "Sale Receipt") : t("receipt.paymentReceipt", "Payment Receipt")}}\n        </p>\n      </div>'''

content = re.sub(old_header, new_header, content)

with open('src/pages/Receipt.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/index.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Increase base font size from 15px/16px to 18px and container width
css_content = re.sub(r'\.receipt-container \{\n\s*max-width: 600px;', r'.receipt-container {\n    max-width: 400px;', css_content)
css_content = re.sub(r'(\.receipt-container \{[^\}]+?font-family:[^\}]+?);', r'\1;\n    font-size: 18px;', css_content)
css_content = re.sub(r'\.receipt-header h1 \{\n\s*margin: 0 0 5px 0;\n\s*font-size: 24px;\n\}', r'.receipt-header h1 {\n    margin: 0 0 5px 0;\n    font-size: 28px;\n}', css_content)
css_content = re.sub(r'\.receipt-title \{\n\s*margin: 0;\n\s*color: #6b7280;\n\s*font-size: 16px;', r'.receipt-title {\n    margin: 0;\n    color: #6b7280;\n    font-size: 18px;', css_content)
css_content = re.sub(r'\.meta-row \{\n\s*display: flex;\n\s*justify-content: space-between;\n\s*font-size: 15px;\n\}', r'.meta-row {\n    display: flex;\n    justify-content: space-between;\n    font-size: 18px;\n}', css_content)
css_content = re.sub(r'\.receipt-total \{\n\s*display: flex;\n\s*justify-content: space-between;\n\s*align-items: center;\n\s*font-size: 20px;', r'.receipt-total {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    font-size: 24px;', css_content)

# Print media query
css_content = re.sub(r'@media print \{\n\s*body \{\n\s*background: white;\n\s*\}\n\s*\.no-print \{\n\s*display: none !important;\n\s*\}\n\s*\.receipt-container \{\n\s*box-shadow: none;\n\s*margin: 0;\n\s*padding: 20px;\n\s*max-width: 100%;\n\s*\}', r'@media print {\n    body {\n      background: white;\n    }\n    .no-print {\n      display: none !important;\n    }\n    .receipt-container {\n      box-shadow: none;\n      margin: 0 auto;\n      padding: 20px;\n      max-width: 400px;\n    }', css_content)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Done")