import re
with open('src/pages/Credits.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

old_block = """                        <div
                          className="credit-payment-row"
                          key={
                            payment.id
                          }
                        >
                          <div className="payment-history-icon">
                            <Banknote
                              size={16}
                            />
                          </div>
                          <div>
                            <strong>
                              {formatCurrency(
                                payment.amount
                              )}
                            </strong>
                            <span>
                              Payment #
                              {payment.id}
                            </span>
                          </div>
                          <div className="payment-history-date">
                            <CalendarDays
                              size={13}
                            />
                            {formatDate(
                              payment.payment_date
                            )}
                          </div>
                        </div>"""

new_block = """                        <div
                          className="credit-payment-row"
                          key={payment.id}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="payment-history-icon">
                              <Banknote size={16} />
                            </div>
                            <div>
                              <strong>{formatCurrency(payment.amount)}</strong>
                              <span>Payment #{payment.id}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="payment-history-date">
                              <CalendarDays size={13} />
                              {formatDate(payment.payment_date)}
                            </div>
                            <button
                              className="secondary-button"
                              style={{ padding: "4px 8px", fontSize: "12px", height: "fit-content" }}
                              onClick={(e) => { e.stopPropagation(); window.open(`/receipt/payment/${payment.id}`, "_blank"); }}
                            >
                              {t("receipt.print", "Print")}
                            </button>
                          </div>
                        </div>"""

code = code.replace(old_block, new_block)

with open('src/pages/Credits.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("done")
