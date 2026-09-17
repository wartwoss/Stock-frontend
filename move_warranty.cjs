const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.jsx', 'utf8');

// Normalize CRLF to LF
code = code.replace(/\r\n/g, '\n');

// 1. Remove the Warranty input from its current location inside customer mode
code = code.replace(
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
                      <label>Description / Warranty Note</label>`,
  `                    <div className="form-field">
                      <label>Description / Warranty Note</label>`
);

// 2. Insert the Warranty input RIGHT BEFORE the sale-total-box
code = code.replace(
  `              <div className="sale-total-box">`,
  `              <div className="form-field">
                <label>Warranty (Months)</label>
                <input
                  type="number"
                  min="0"
                  value={form.warranty_months}
                  placeholder="e.g. 12"
                  onChange={(event) => updateField("warranty_months", event.target.value)}
                />
              </div>
              <div className="sale-total-box">`
);

fs.writeFileSync('src/pages/Sales.jsx', code);
