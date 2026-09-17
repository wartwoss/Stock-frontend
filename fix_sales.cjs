const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.jsx', 'utf8');

// Normalize CRLF to LF
code = code.replace(/\r\n/g, '\n');

// 1. Add ExchangeRateContext import
code = code.replace(
  'from "../api/credits";',
  'from "../api/credits";\nimport { useExchangeRate } from "../contexts/ExchangeRateContext";'
);

// 2. Add fields to createEmptyForm
code = code.replace(
  '      description: "",\n      down_payment: "0",',
  '      description: "",\n      warranty_months: "",\n      down_payment: "0",\n      currency: "USD",\n      exchange_rate_per_100: "150000",'
);

// 3. Update variables inside Sales function
code = code.replace(
  `  const totalPrice =
    Number(form.selling_price || 0) *
    Number(form.quantity || 0);
  const remainingDebt =
    Math.max(
      0,
      totalPrice -
        Number(
          form.down_payment || 0
        )
    );
  const estimatedInstallment =
    Number(form.number_of_payments) > 0
      ? remainingDebt /
        Number(
          form.number_of_payments
        )
      : 0;`,
  `  const basePrice = Number(form.selling_price || 0);
  const qty = Number(form.quantity || 0);
  const isIqd = form.currency === "IQD";
  const rate = Number(form.exchange_rate_per_100 || 150000) / 100;
  const unitPriceConverted = isIqd ? basePrice * rate : basePrice;
  const totalPrice = unitPriceConverted * qty;
  const remainingDebt = Math.max(0, totalPrice - Number(form.down_payment || 0));
  const estimatedInstallment = Number(form.number_of_payments) > 0 ? remainingDebt / Number(form.number_of_payments) : 0;`
);

// 4. Add useExchangeRate hook
code = code.replace(
  `      search,
      typeFilter,
    ]);
  function openModal() {`,
  `      search,
      typeFilter,
    ]);
  const { exchangeRate } = useExchangeRate();
  function openModal() {`
);

// 5. Update openModal
code = code.replace(
  '    setForm(createEmptyForm(defaultStorage));',
  '    const newForm = createEmptyForm(defaultStorage);\n    newForm.exchange_rate_per_100 = Math.round(exchangeRate || 150000).toString();\n    setForm(newForm);'
);

// 6. Update salePayload
code = code.replace(
  `        selling_price:
          Number(
            form.selling_price
          ),`,
  `        selling_price: unitPriceConverted,`
);
code = code.replace(
  `        sale_date:
          form.sale_date,
      };`,
  `        sale_date: form.sale_date,\n        currency: form.currency,\n        exchange_rate_per_100: Number(form.exchange_rate_per_100),\n        warranty_months: form.warranty_months ? Number(form.warranty_months) : null,\n      };`
);

// 7. Update formatMoney to formatCurrency
code = code.replace(
  `function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(Number(value ?? 0));
}`,
  `function formatCurrency(value, currency = "USD") {
  if (currency === "IQD") {
    return Math.round(Number(value ?? 0)).toLocaleString("en-US") + " IQD";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}`
);

// Replace formatMoney calls
code = code.replaceAll('formatMoney(', 'formatCurrency(');

// 8. Update JSX display table (adding currency args to formatCurrency)
code = code.replace(
  `                        {formatCurrency(
                          sale.selling_price
                        )}`,
  `                        {formatCurrency(sale.selling_price, sale.currency)}`
);
code = code.replace(
  `                          {formatCurrency(
                            sale.total_price
                          )}`,
  `                          {formatCurrency(sale.total_price, sale.currency)}`
);

// 9. Update Sale Date, Currency, Exchange Rate UI
code = code.replace(
  `              <div className="form-field">
                <label>
                  Sale Date
                </label>
                <input
                  required
                  type="date"
                  value={
                    form.sale_date
                  }
                  onChange={(event) =>
                    updateField(
                      "sale_date",
                      event.target.value
                    )
                  }
                />
              </div>`,
  `              <div className="form-grid">
                <div className="form-field">
                  <label>Sale Date</label>
                  <input
                    required
                    type="date"
                    value={form.sale_date}
                    onChange={(event) => updateField("sale_date", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Currency</label>
                  <select
                    value={form.currency}
                    onChange={(event) => updateField("currency", event.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (Dinar)</option>
                  </select>
                </div>
              </div>
              {form.currency === "IQD" && (
                <div className="form-field">
                  <label>Exchange Rate (100$ to X Dinar)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.exchange_rate_per_100}
                    onChange={(event) => updateField("exchange_rate_per_100", event.target.value)}
                  />
                </div>
              )}`
);

// 10. Update Total Sale Amount display
code = code.replace(
  `              <div className="sale-total-box">
                <span>
                  Total Sale Amount
                </span>
                <strong>
                  {formatCurrency(
                    totalPrice
                  )}
                </strong>
              </div>`,
  `              <div className="sale-total-box">
                <span>Total Sale Amount</span>
                <strong>
                  {form.currency === "IQD" ? Math.round(totalPrice).toLocaleString("en-US") + " IQD" : formatCurrency(totalPrice, form.currency)}
                </strong>
              </div>`
);

// 11. Add Warranty input in UI
code = code.replace(
  `                    <div className="form-field">
                      <label>
                        Description / Warranty Note
                      </label>
                      <input
                        value={
                          form.description
                        }`,
  `                    <div className="form-field">
                      <label>Warranty (Months)</label>
                      <input
                        type="number"
                        min="0"
                        value={form.warranty_months}
                        placeholder="e.g. 12"
                        onChange={(event) => updateField("warranty_months", event.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Description / Warranty Note</label>
                      <input
                        value={form.description}`
);

// 12. Fix remainingDebt and estimatedInstallment formatCurrency
code = code.replace(
  `                        {formatCurrency(
                          remainingDebt
                        )}`,
  `                        {formatCurrency(remainingDebt, form.currency)}`
);
code = code.replace(
  `                        {formatCurrency(
                          estimatedInstallment
                        )}`,
  `                        {formatCurrency(estimatedInstallment, form.currency)}`
);

// 13. Add Warranty to Table Header
code = code.replace(
  `                  <th>Total</th>
                  <th>Payment</th>`,
  `                  <th>Total</th>
                  <th>Payment</th>
                  <th>Warranty</th>`
);

// 14. Add Warranty to Table Body
code = code.replace(
  `                      <td>
                        <PaymentBadge
                          type={
                            sale.payment_type
                          }
                        />
                      </td>
                      <td>`,
  `                      <td>
                        <PaymentBadge
                          type={
                            sale.payment_type
                          }
                        />
                      </td>
                      <td>
                        {sale.warranty_months ? \`\${sale.warranty_months} Mo\` : "-"}
                      </td>
                      <td>`
);

fs.writeFileSync('src/pages/Sales.jsx', code);
