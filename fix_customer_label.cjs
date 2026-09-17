const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.jsx', 'utf8');

// Use regex to replace the complex block containing "Customer (Optional ... )" 
code = code.replace(
  /\{form\.payment_type === "cash"\s*\?\s*"Customer \(Optional[^\)]+\)"\s*:\s*"Customer \(Required for Credit Agreement\)"\}/,
  '"Customer (Required)"'
);

fs.writeFileSync('src/pages/Sales.jsx', code);
