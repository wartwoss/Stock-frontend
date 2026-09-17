const fs = require('fs');

function applyPatches(path, patches) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');
  for (const [from, to] of patches) {
    if (typeof from === 'string') {
      code = code.split(from).join(to);
    } else if (from instanceof RegExp) {
      code = code.replace(from, to);
    }
  }
  fs.writeFileSync(path, code, 'utf8');
}

// FROM inject_all.cjs
applyPatches('src/pages/Sales.jsx', [
  ['<p>Record and manage your sales.</p>', '<p>{t("common.subtitleSales")}</p>'],
  ['placeholder="Search sales..."', 'placeholder={t("common.searchPlace")}'],
  ['{filteredSales.length} sales', '{filteredSales.length} {t("common.resultCount")}'],
  ['Loading sales...', '{t("sales.loading")}'],
  ['<p>Record your first sale.</p>', '<p>{t("sales.noSalesDesc")}</p>'],
  ['>Try Again<', '>{t("common.tryAgain")}<'],
  ['>Walk-in Customer<', '>{t("sales.walkIn")}<'],
  ['>Selling Price<', '>{t("sales.sellingPrice")}<'],
  ['>Paid immediately<', '>{t("sales.paidImmediately")}<'],
  ['>Installments<', '>{t("sales.installments")}<'],
  ['>Installment Details<', '>{t("sales.installmentDetails")}<'],
  ['>Estimated Installment<', '>{t("sales.estimatedInstallment")}<'],
  ['>Cancel<', '>{t("common.cancel")}<']
]);

applyPatches('src/pages/Credits.jsx', [
  ['<h2>Credits</h2>', '<h2>{t("credits.title")}</h2>'],
  ['<p>Manage outstanding debt and installments.</p>', '<p>{t("common.subtitleCredits")}</p>'],
  ['placeholder="Search credits..."', 'placeholder={t("common.searchPlace")}'],
  ['{filteredCredits.length} credit accounts', '{filteredCredits.length} {t("common.resultCount")}'],
  ['Loading credits...', '{t("credits.loading")}'],
  ['>Try Again<', '>{t("common.tryAgain")}<'],
  ['<p>No credit accounts found.</p>', '<p>{t("credits.noCreditsDesc")}</p>'],
  ['>Customer<', '>{t("credits.customer")}<'],
  ['>Appliance<', '>{t("credits.appliance")}<'],
  ['>Total Debt<', '>{t("credits.totalDebt")}<'],
  ['>Paid<', '>{t("credits.paid")}<'],
  ['>Remaining<', '>{t("credits.remaining")}<'],
  ['>Progress<', '>{t("credits.progress")}<'],
  ['>Status<', '>{t("credits.status")}<'],
  ['>Actions<', '>{t("credits.actions")}<'],
  ['>View Details<', '>{t("credits.viewDetails")}<'],
  ['>Record Payment<', '>{t("credits.recordPayment")}<'],
  ['>Payment Details<', '>{t("credits.paymentDetails")}<'],
  ['>Paid Off<', '>{t("credits.paidOff")}<'],
  ['>Active<', '>{t("credits.active")}<']
]);

// FROM patch_sales.cjs
let salesCode = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
salesCode = salesCode.replace(/title="Total Sales"/g, 'title={t("sales.metrics.totalSales")}');
salesCode = salesCode.replace(/title="Units Sold"/g, 'title={t("sales.metrics.unitsSold")}');
salesCode = salesCode.replace(/title="Cash Sales"/g, 'title={t("sales.metrics.cashSales")}');
salesCode = salesCode.replace(/title="Credit Sales"/g, 'title={t("sales.metrics.creditSales")}');
salesCode = salesCode.replace(/Record cash and installment\\s+sales/g, '{t("sales.subtitle2")}');
salesCode = salesCode.replace(/Record cash and installment sales/g, '{t("sales.subtitle2")}');
salesCode = salesCode.replace(/>\\s*New Sale\\s*</g, '>{t("sales.newSale")}<');
fs.writeFileSync('src/pages/Sales.jsx', salesCode, 'utf8');

// FROM patch_sales_modal.cjs
salesCode = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
salesCode = salesCode.replace(/>\\s*Select customer\\s*</g, '>{t("sales.form.selectCustomer")}<');
salesCode = salesCode.replace(/>\\s*Customer Name\\s*</g, '>{t("sales.form.customerName")}<');
salesCode = salesCode.replace(/>\\s*Phone Number\\s*</g, '>{t("sales.form.phoneNumber")}<');
salesCode = salesCode.replace(/placeholder="e\.g\. 0750 123 4567"/g, 'placeholder={t("sales.form.phonePlaceholder")}');
salesCode = salesCode.replace(/>\\s*Number of Payments\\s*</g, '>{t("sales.form.numberOfPayments")}<');
salesCode = salesCode.replace(/>\\s*Next Payment Date\\s*</g, '>{t("sales.form.nextPaymentDate")}<');
salesCode = salesCode.replace(/>\\s*Complete Sale\\s*</g, '>{t("sales.form.completeSale")}<');
fs.writeFileSync('src/pages/Sales.jsx', salesCode, 'utf8');

// FROM patch_sales_remaining.cjs
salesCode = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
salesCode = salesCode.replace(/>\\s*Appliance\\s*</g, '>{t("sales.form.appliance")}<');
salesCode = salesCode.replace(/>\\s*Select appliance\\s*</g, '>{t("sales.form.selectAppliance")}<');
salesCode = salesCode.replace(/>\\s*Storage\\s*</g, '>{t("sales.form.storage")}<');
salesCode = salesCode.replace(/>\\s*Select storage\\s*</g, '>{t("sales.form.selectStorage")}<');
salesCode = salesCode.replace(/>\\s*Quantity\\s*</g, '>{t("sales.form.quantity")}<');
salesCode = salesCode.replace(/>\\s*Customer\\s*</g, '>{t("sales.form.customer")}<');
fs.writeFileSync('src/pages/Sales.jsx', salesCode, 'utf8');

// FROM patch_sales_remaining_labels.cjs
salesCode = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
salesCode = salesCode.replace(/>\\s*Search customers\.\.\.\\s*</g, '>{t("sales.form.searchCustomers")}<');
salesCode = salesCode.replace(/>\\s*Create new\\s*</g, '>{t("sales.form.createNew")}<');
salesCode = salesCode.replace(/>\\s*Payment Type\\s*</g, '>{t("sales.form.paymentType")}<');
salesCode = salesCode.replace(/>\\s*Warranty \\(Months\\)\\s*</g, '>{t("sales.form.warranty")}<');
salesCode = salesCode.replace(/>\\s*Down Payment\\s*</g, '>{t("sales.form.downPayment")}<');
salesCode = salesCode.replace(/>\\s*Creating\.\.\.\\s*</g, '>{t("sales.form.creating")}<');
fs.writeFileSync('src/pages/Sales.jsx', salesCode, 'utf8');

// FROM patch_credits_modal.cjs
let credCode = fs.readFileSync('src/pages/Credits.jsx', 'utf8');
credCode = credCode.replace(/<h2>\\s*Record Payment\\s*<\\/h2>/g, '<h2>{t("credits.form.recordPayment")}</h2>');
credCode = credCode.replace(/>\\s*Expected\\s*</g, '>{t("credits.form.expected")}<');
credCode = credCode.replace(/>\\s*Payment Amount\\s*</g, '>{t("credits.form.paymentAmount")}<');
credCode = credCode.replace(/>\\s*Payment Date\\s*</g, '>{t("credits.form.paymentDate")}<');
credCode = credCode.replace(/>\\s*Cancel\\s*<\\/button>/g, '>{t("credits.form.cancel")}</button>');
credCode = credCode.replace(/>\\s*Record Payment\\s*<\\/button>/g, '>{t("credits.form.recordPayment")}</button>');
credCode = credCode.replace(/>\\s*Recording\.\.\.\\s*<\\/button>/g, '>{t("credits.form.recording")}</button>');
fs.writeFileSync('src/pages/Credits.jsx', credCode, 'utf8');

// FIX PaymentBadge bug in Sales.jsx (t is not defined)
salesCode = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
salesCode = salesCode.replace(
  /function PaymentBadge\\(\\{\\s*type,\\s*\\}\\) \\{/,
  'function PaymentBadge({\n  type,\n}) {\n  const { t } = useTranslation();'
);
fs.writeFileSync('src/pages/Sales.jsx', salesCode, 'utf8');

// APPLY RECENT FIXES (warranty default 12, hide first_due_date)
salesCode = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
salesCode = salesCode.replace(
  'warranty_months: 0,',
  'warranty_months: 12,'
);
// getNextMonth helper and first_due_date hidden
salesCode = salesCode.replace(
  'function getToday() {',
  'function getNextMonth() {\\n  const d = new Date();\\n  d.setMonth(d.getMonth() + 1);\\n  return d.toISOString().split("T")[0];\\n}\\nfunction getToday() {'
);
salesCode = salesCode.replace(
  'first_due_date: getToday(),',
  'first_due_date: getNextMonth(),'
);
// Remove first_due_date from JSX
const dateInputRegex = /<div className="form-group">[\\s\\S]*?{t\\("sales\.form\.nextPaymentDate"\\)}[\\s\\S]*?first_due_date[\\s\\S]*?<\\/div>/;
salesCode = salesCode.replace(dateInputRegex, '');
fs.writeFileSync('src/pages/Sales.jsx', salesCode, 'utf8');

// APPLY RECENT FIXES (Credits.jsx string)
credCode = fs.readFileSync('src/pages/Credits.jsx', 'utf8');
credCode = credCode.replace(
  /<h2>\\s*Credit Accounts\\s*<\\/h2>/g,
  '<h2>{t("credits.title")}</h2>'
);
credCode = credCode.replace(
  /Track installment agreements,\\s*outstanding debt and due\\s*payments\\./g,
  '{t("credits.subtitle")}'
);
fs.writeFileSync('src/pages/Credits.jsx', credCode, 'utf8');
console.log("Restoration complete.");
