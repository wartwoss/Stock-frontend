const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');

code = 'import { useTheme } from "../contexts/ThemeContext";\n' + code;

if (!code.includes('Palette,')) {
  code = code.replace(
    '  CheckCircle2,\n} from "lucide-react";',
    '  CheckCircle2,\n  Palette,\n} from "lucide-react";'
  );
}

if (!code.includes('const { theme, setTheme } = useTheme();')) {
  code = code.replace(
    '  const [error, setError] =',
    '  const { theme, setTheme } = useTheme();\n  const [error, setError] ='
  );
}

const themeSection = `
        {/* THEME SETTINGS */}
        <section className="settings-section">
          <div className="settings-section-header">
            <div className="settings-heading">
              <div className="settings-heading-icon">
                <Palette size={20} />
              </div>
              <div>
                <h3>Theme Settings</h3>
                <p>Customize the application's appearance.</p>
              </div>
            </div>
          </div>
          <div className="monitoring-form">
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label>Select Theme</label>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{ width: "100%", maxWidth: "300px", marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid #dfe2e7" }}
              >
                <option value="minimalism">Minimalism (Light Blue & Simple)</option>
                <option value="brutalism">Brutalism (Gray & Sharp Corners)</option>
              </select>
            </div>
          </div>
        </section>
`;

if (!code.includes('THEME SETTINGS')) {
  code = code.replace(
    `        {/* PAYMENT MONITORING */}`,
    themeSection + `\n        {/* PAYMENT MONITORING */}`
  );
}

fs.writeFileSync('src/pages/Settings.jsx', code);
