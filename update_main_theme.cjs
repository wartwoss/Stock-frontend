const fs = require('fs');
let code = fs.readFileSync('src/main.jsx', 'utf8');

code = code.replace(
  'import { AuthProvider } from "./contexts/AuthContext";',
  'import { AuthProvider } from "./contexts/AuthContext";\nimport { ThemeProvider } from "./contexts/ThemeContext";'
);

code = code.replace(
  '    <ErrorBoundary>\n      <AuthProvider>\n        <ExchangeRateProvider>',
  '    <ErrorBoundary>\n      <ThemeProvider>\n        <AuthProvider>\n          <ExchangeRateProvider>'
);

code = code.replace(
  '        </ExchangeRateProvider>\n      </AuthProvider>\n    </ErrorBoundary>',
  '          </ExchangeRateProvider>\n        </AuthProvider>\n      </ThemeProvider>\n    </ErrorBoundary>'
);

fs.writeFileSync('src/main.jsx', code);
