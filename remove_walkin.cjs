const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

// 1. Initial form state
code = code.replace(
  '    customer_mode: "none",',
  '    customer_mode: "existing",'
);

// 2. Remove the Walk-in button block
code = code.replace(
  `                  <div className="customer-mode">
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
                        Walk-in
                      </button>
                    )}`,
  `                  <div className="customer-mode">`
);

// 3. Remove the Walk-in explanation text and change the ternary to simple if/else
code = code.replace(
  `                {form.customer_mode === "none" ? (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        padding: "8px 12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "6px",
                      }}
                    >
                      Logged as an anonymous walk-in sale. Choose "Existing Customer" or "New Customer" to attach customer details for warranty tracking.
                    </div>
                  ) : form.customer_mode ===
                    "existing" ? (`,
  `                {form.customer_mode ===
                    "existing" ? (`
);

// 4. Update form validation
code = code.replace(
  `        if (
          form.customer_mode === "none"
        ) {
          setFormError(
            "A customer is required for credit agreements."
          );
          return;
        }`,
  ``
);

// Update error message for cash "existing"
code = code.replace(
  `          setFormError(
            "Please select a customer, or choose 'Walk-in' for an unregistered buyer."
          );`,
  `          setFormError(
            "Please select a customer."
          );`
);

// Update error message for cash "new"
code = code.replace(
  `          setFormError(
            "Customer name and phone number are required, or choose 'Walk-in'."
          );`,
  `          setFormError(
            "Customer name and phone number are required."
          );`
);

// 5. Update PaymentType switch logic
code = code.replace(
  `        if (name === "payment_type") {
          if (value === "credit" && next.customer_mode === "none") {
            next.customer_mode = "existing";
          }
        }`,
  ``
);

// 6. Update Customer Title info
code = code.replace(
  `                  {form.payment_type === "cash"
                    ? "Customer (Optional  For Warranty / Record)"
                    : "Customer (Required for Credit Agreement)"}`,
  `                  Customer (Required)`
);


fs.writeFileSync('src/pages/Sales.jsx', code);
