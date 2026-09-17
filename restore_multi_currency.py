import re

def modify_sales():
    with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Imports
    if 'useExchangeRate' not in code:
        code = code.replace('import { getCustomers } from "../api/customers";',
                            'import { getCustomers } from "../api/customers";\nimport { useExchangeRate } from "../contexts/ExchangeRateContext";')

    # 2. createEmptyForm
    if 'warranty_months: "",' not in code:
        code = code.replace('description: "",', 'description: "",\n    warranty_months: "",\n    currency: "USD",\n    exchange_rate_per_100: "150000",')

    # 3. exchangeRate hook
    if 'const { exchangeRate } = useExchangeRate();' not in code:
        code = code.replace('function openModal() {', 'const { exchangeRate } = useExchangeRate();\n\n  function openModal() {')

    # 4. openModal
    if 'newForm.currency = "USD";' not in code:
        code = code.replace('const defaultStorage = getStoredStorageId(storages);\n    setForm(createEmptyForm(defaultStorage));',
                            'const defaultStorage = getStoredStorageId(storages);\n    const newForm = createEmptyForm(defaultStorage);\n    newForm.currency = "USD";\n    newForm.exchange_rate_per_100 = Math.round(exchangeRate || 150000).toString();\n    setForm(newForm);')

    # 5. Math logic
    math_old = """  const totalPrice =
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
      : 0;"""
    
    math_new = """  const basePrice = Number(form.selling_price || 0);
  const qty = Number(form.quantity || 0);
  const isIqd = form.currency === "IQD";
  const rate = Number(form.exchange_rate_per_100 || 150000) / 100;
  
  const unitPriceConverted = isIqd ? basePrice * rate : basePrice;
  const totalPrice = unitPriceConverted * qty;
  
  const remainingDebt = Math.max(0, totalPrice - Number(form.down_payment || 0));
  const estimatedInstallment = Number(form.number_of_payments) > 0 ? remainingDebt / Number(form.number_of_payments) : 0;"""
    
    code = code.replace(math_old, math_new)

    # 6. salePayload
    payload_old = """        selling_price:
          Number(
            form.selling_price
          ),
        payment_type:
          form.payment_type,
        sale_date:
          form.sale_date,"""
    payload_new = """        selling_price: unitPriceConverted,
        payment_type: form.payment_type,
        sale_date: form.sale_date,
        currency: form.currency,
        exchange_rate_per_100: Number(form.exchange_rate_per_100),
        warranty_months: form.warranty_months ? Number(form.warranty_months) : null,"""
    code = code.replace(payload_old, payload_new)

    # 7. formatMoney to formatCurrency in table
    table_sell = """                        {formatMoney(
                          sale.selling_price
                        )}"""
    table_sell_new = """                        {formatCurrency(
                          sale.selling_price, sale.currency
                        )}"""
    code = code.replace(table_sell, table_sell_new)

    table_tot = """                          {formatMoney(
                            sale.total_price
                          )}"""
    table_tot_new = """                          {formatCurrency(
                            sale.total_price, sale.currency
                          )}"""
    code = code.replace(table_tot, table_tot_new)

    # 8. Sale Date & Currency inputs
    sale_date_old = """              <div className="form-field">
                <label>{t("sales.form.saleDate")}</label>
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
              </div>"""
    sale_date_new = """              <div className="form-grid">
                <div className="form-field">
                  <label>{t("sales.form.saleDate")}</label>
                  <input
                    required
                    type="date"
                    value={form.sale_date}
                    onChange={(event) => updateField("sale_date", event.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>{t("sales.form.currency", "Currency")}</label>
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
                  <label>{t("sales.form.exchangeRate", "Exchange Rate (100$ to X Dinar)")}</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.exchange_rate_per_100}
                    onChange={(event) => updateField("exchange_rate_per_100", event.target.value)}
                  />
                </div>
              )}"""
    code = code.replace(sale_date_old, sale_date_new)

    # 9. Sale Total Amount box
    total_box_old = """              <div className="sale-total-box">
                <span>
                  {t("sales.form.totalAmount")}
                </span>
                <strong>
                  {formatMoney(
                    totalPrice
                  )}
                </strong>
              </div>"""
    total_box_new = """              <div className="sale-total-box">
                <span>{t("sales.form.totalAmount")}</span>
                <strong>
                  {form.currency === "IQD" ? Math.round(totalPrice).toLocaleString() + " IQD" : formatCurrency(totalPrice, form.currency)}
                </strong>
              </div>"""
    code = code.replace(total_box_old, total_box_new)

    # 10. Warranty Months
    warranty_note_old = """                    <div className="form-field">
                      <label>{t("sales.form.descWarrantyNote")}</label>"""
    warranty_note_new = """                    <div className="form-field">
                      <label>{t("sales.form.warrantyMonths", "Warranty (Months)")}</label>
                      <input
                        type="number"
                        min="0"
                        value={form.warranty_months}
                        placeholder="e.g. 12"
                        onChange={(event) =>
                          updateField(
                            "warranty_months",
                            event.target.value
                          )
                        }
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("sales.form.descWarrantyNote")}</label>"""
    code = code.replace(warranty_note_old, warranty_note_new)

    # 11. Credit preview format Money
    prev_rem_old = """                        {formatMoney(
                          remainingDebt
                        )}"""
    prev_rem_new = """                        {formatCurrency(
                          remainingDebt, form.currency
                        )}"""
    code = code.replace(prev_rem_old, prev_rem_new)

    prev_est_old = """                        {formatMoney(
                          estimatedInstallment
                        )}"""
    prev_est_new = """                        {formatCurrency(
                          estimatedInstallment, form.currency
                        )}"""
    code = code.replace(prev_est_old, prev_est_new)

    # 12. formatMoney to formatCurrency
    fmt_old = """function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(Number(value ?? 0));
}"""
    fmt_new = """function formatCurrency(value, currency = "USD") {
  if (currency === "IQD") {
    return Math.round(Number(value ?? 0)).toLocaleString("en-US") + " IQD";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}"""
    code = code.replace(fmt_old, fmt_new)

    # Replace any leftover formatMoney with formatCurrency
    code = code.replace('formatMoney(', 'formatCurrency(')

    with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
        f.write(code)

def modify_credits():
    with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
        code = f.read()

    # Total outstanding
    total_old = """  const totalOutstanding =
    credits.reduce(
      (total, credit) =>
        total +
        Number(
          credit.remaining_debt ??
            0
        ),
      0
    );"""
    total_new = """  const totalOutstanding =
    credits.reduce((total, credit) => {
      let amount = Number(credit.remaining_debt ?? 0);
      if (credit.currency === "IQD") {
        const rate = Number(credit.exchange_rate_per_100 ?? 150000) / 100;
        amount = amount / rate;
      }
      return total + amount;
    }, 0);"""
    code = code.replace(total_old, total_new)

    # formatMoney in Credits
    fmt_old = """function formatMoney(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  ).format(
    Number(value ?? 0)
  );
}"""
    fmt_new = """function formatCurrency(value, currency = "USD") {
  if (currency === "IQD") {
    return Math.round(Number(value ?? 0)).toLocaleString("en-US") + " IQD";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value ?? 0));
}"""
    code = code.replace(fmt_old, fmt_new)
    
    code = code.replace('formatMoney(', 'formatCurrency(')

    # Update table to pass currency
    table_tot_old = """                          {formatCurrency(
                            total
                          )}"""
    table_tot_new = """                          {formatCurrency(
                            total, credit.currency
                          )}"""
    code = code.replace(table_tot_old, table_tot_new)

    table_rem_old = """                            {formatCurrency(
                              remaining
                            )}"""
    table_rem_new = """                            {formatCurrency(
                              remaining, credit.currency
                            )}"""
    code = code.replace(table_rem_old, table_rem_new)

    table_inst_old = """                          {formatCurrency(
                            credit.installment_amount
                          )}"""
    table_inst_new = """                          {formatCurrency(
                            credit.installment_amount, credit.currency
                          )}"""
    code = code.replace(table_inst_old, table_inst_new)

    # Also check if payment modal formats correctly
    # "Payment cannot be greater than..."
    
    with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
        f.write(code)

modify_sales()
modify_credits()
