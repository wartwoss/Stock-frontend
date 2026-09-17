const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.jsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

// Remove Storage cell
code = code.replace(
  `                      <td>
                        <div className="storage-cell">
                          <Warehouse
                            size={14}
                          />
                          {sale.storage
                            ?.name ||
                            "-"}
                        </div>
                      </td>\n`,
  ''
);

// Move Warranty cell
code = code.replace(
  `                      <td>
                        <PaymentBadge
                          type={
                            sale.payment_type
                          }
                        />
                      </td>
                      <td>
                        {sale.warranty_months ? \`\${sale.warranty_months} Mo\` : "-"}
                      </td>`,
  `                      <td>
                        <PaymentBadge
                          type={
                            sale.payment_type
                          }
                        />
                      </td>`
);

code = code.replace(
  `                      <td>
                        {formatDate(
                          sale.sale_date
                        )}
                      </td>
                    </tr>`,
  `                      <td>
                        {formatDate(
                          sale.sale_date
                        )}
                      </td>
                      <td>
                        {sale.warranty_months ? \`\${sale.warranty_months} Mo\` : "-"}
                      </td>
                    </tr>`
);

fs.writeFileSync('src/pages/Sales.jsx', code);
