import re

with open('src/pages/Sales.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Appliance
code = code.replace('<label>\n                  Appliance\n                </label>', '<label>{t("sales.form.appliance", "Appliance")}</label>')
code = code.replace('placeholder="Select appliance"', 'placeholder={t("sales.form.selectAppliance", "Select appliance")}')
code = code.replace('placeholder="Search appliances..."', 'placeholder={t("sales.form.searchAppliances", "Search appliances...")}')

# 2. Storage
code = code.replace('<label>\n                  Storage\n                </label>', '<label>{t("sales.form.storage", "Storage")}</label>')

# 3. Quantity
code = code.replace('<label>\n                  Quantity\n                </label>', '<label>{t("sales.form.quantity", "Quantity")}</label>')

# 4. Selling Price
code = code.replace('<label>\n                  Selling Price\n                </label>', '<label>{t("sales.form.sellingPrice", "Selling Price")}</label>')

# 5. Sale Date + Currency + Exchange Rate
old_sale_date = """              <div className="form-field">
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
              </div>"""
new_sale_date = """              <div className="form-grid">
                <div className="form-field">
                  <label>{t("sales.form.saleDate", "Sale Date")}</label>
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
code = code.replace(old_sale_date, new_sale_date)

# 6. Total Amount Box
old_total_box = """              <div className="sale-total-box">
                <span>
                  Total Sale Amount
                </span>
                <strong>
                  {formatCurrency(
                    totalPrice, form.currency
                  )}
                </strong>
              </div>"""
new_total_box = """              <div className="sale-total-box">
                <span>{t("sales.form.totalAmount", "Total Sale Amount")}</span>
                <strong>
                  {form.currency === "IQD" ? Math.round(totalPrice).toLocaleString() + " IQD" : formatCurrency(totalPrice, form.currency)}
                </strong>
              </div>"""
# Wait, I might have `formatMoney` or `formatCurrency` there depending on what worked.
# Let's use regex for it.
import re
code = re.sub(
    r'<div className="sale-total-box">.*?</div>',
    new_total_box,
    code,
    flags=re.DOTALL
)

# 7. Payment Type
code = code.replace('<label>\n                  Payment Type\n                </label>', '<label>{t("sales.form.paymentType", "Payment Type")}</label>')
code = code.replace('<strong>\n                        Cash\n                      </strong>', '<strong>{t("sales.form.cash", "Cash")}</strong>')
code = code.replace('<span>\n                        Paid immediately\n                      </span>', '<span>{t("sales.form.paidImmediately", "Paid immediately")}</span>')
code = code.replace('<strong>\n                        Credit\n                      </strong>', '<strong>{t("sales.form.credit", "Credit")}</strong>')
code = code.replace('<span>\n                        Installments\n                      </span>', '<span>{t("sales.form.installments", "Installments")}</span>')

# 8. Customer mode + walk-in removal
old_customer_section = """              {/* CUSTOMER SECTION */}
              <div className="credit-sale-section">
                <div className="credit-section-title">
                  <UserRound
                    size={18}
                  />
                  {form.payment_type === "cash"
                    ? "Customer (Optional ?" For Warranty / Record)"
                    : "Customer (Required for Credit Agreement)"}
                </div>
                <div className="customer-mode">
                  {form.payment_type === "cash" && (
                    <button
                      type="button"
                      className={
                        form.customer_mode === "none"
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        updateField(
                          "customer_mode",
                          "none"
                        )
                      }
                    >
                      Walk-in (No customer)
                    </button>
                  )}
                  <button
                    type="button"
                    className={
                      form.customer_mode ===
                      "existing"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      updateField(
                        "customer_mode",
                        "existing"
                      )
                    }
                  >
                    Existing Customer
                  </button>
                  <button
                    type="button"
                    className={
                      form.customer_mode === "new"
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      updateField(
                        "customer_mode",
                        "new"
                      )
                    }
                  >
                    New Customer
                  </button>
                </div>"""

new_customer_section = """              {/* CUSTOMER SECTION */}
              <div className="credit-sale-section">
                <div className="credit-section-title">
                  <UserRound size={18} />
                  {t("sales.form.customerRequired", "Customer (Required)")}
                </div>
                <div className="customer-mode">
                  <button
                    type="button"
                    className={form.customer_mode === "existing" ? "active" : ""}
                    onClick={() => updateField("customer_mode", "existing")}
                  >
                    {t("sales.form.existingCustomer", "Existing Customer")}
                  </button>
                  <button
                    type="button"
                    className={form.customer_mode === "new" ? "active" : ""}
                    onClick={() => updateField("customer_mode", "new")}
                  >
                    {t("sales.form.newCustomer", "New Customer")}
                  </button>
                </div>"""
# Fix the regex or replace:
code = re.sub(
    r'\{/\* CUSTOMER SECTION \*/\}.*?<div className="customer-mode">.*?</div>',
    new_customer_section,
    code,
    flags=re.DOTALL
)

# 9. Customer mode condition fix:
# It used to be {form.customer_mode !== "none" && (
# We must replace that with {true && ( since walk-in is removed, or we just leave it if customer_mode can only be new/existing.
code = code.replace('{form.customer_mode !== "none" && (', '{true && (')

code = code.replace('<label>\n                        Customer\n                      </label>', '<label>{t("sales.form.customer", "Customer")}</label>')
code = code.replace('placeholder="Select customer"', 'placeholder={t("sales.form.selectCustomer", "Select customer")}')

code = code.replace('<label>\n                          Customer Name\n                        </label>', '<label>{t("sales.form.customerName", "Customer Name")}</label>')
code = code.replace('placeholder="Ahmad Ali"', 'placeholder={t("sales.form.namePlaceholder", "Ahmad Ali")}')

code = code.replace('<label>\n                          Phone Number\n                        </label>', '<label>{t("sales.form.phoneNumber", "Phone Number")}</label>')
code = code.replace('placeholder="0770..."', 'placeholder={t("sales.form.phonePlaceholder", "0770...")}')

# 10. Warranty Months + Description
old_desc = """                    <div className="form-field">
                      <label>
                        Description / Warranty Note
                      </label>
                      <input
                        value={
                          form.description
                        }
                        placeholder="Optional warranty or customer note"
                        onChange={(event) =>
                          updateField(
                            "description",
                            event.target
                              .value
                          )
                        }
                      />
                    </div>"""
new_desc = """                    <div className="form-field">
                      <label>{t("sales.form.warrantyMonths", "Warranty (Months)")}</label>
                      <input
                        type="number"
                        min="0"
                        value={form.warranty_months}
                        placeholder={t("sales.form.eg12", "e.g. 12")}
                        onChange={(event) => updateField("warranty_months", event.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>{t("sales.form.descWarrantyNote", "Description / Warranty Note")}</label>
                      <input
                        value={form.description}
                        placeholder={t("sales.form.optionalNotePlaceholder", "Optional warranty or customer note")}
                        onChange={(event) => updateField("description", event.target.value)}
                      />
                    </div>"""
code = code.replace(old_desc, new_desc)

# 11. Credit Details
code = code.replace('Installment Details\n                  </div>', '{t("sales.installmentDetails", "Installment Details")}\n                  </div>')
code = code.replace('<label>\n                        Down Payment\n                      </label>', '<label>{t("sales.form.downPayment", "Down Payment")}</label>')
code = code.replace('<label>\n                        Number of Payments\n                      </label>', '<label>{t("sales.form.numberOfPayments", "Number of Payments")}</label>')
code = code.replace('<label>\n                      First Due Date\n                    </label>', '<label>{t("sales.form.firstDueDate", "First Due Date")}</label>')
code = code.replace('<span>\n                        Remaining Debt\n                      </span>', '<span>{t("sales.form.remainingDebt", "Remaining Debt")}</span>')
code = code.replace('<span>\n                        Estimated Installment\n                      </span>', '<span>{t("sales.form.estimatedInstallment", "Estimated Installment")}</span>')

# 12. Modal Buttons
code = code.replace('Cancel\n                </button>', '{t("common.cancel", "Cancel")}\n                </button>')
code = code.replace('? "Processing..."\n                    : "Complete Sale"', '? t("sales.form.processing", "Processing...")\n                    : t("sales.form.completeSale", "Complete Sale")')


with open('src/pages/Sales.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("done")
