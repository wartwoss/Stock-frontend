const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.jsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

// Import useTheme
code = code.replace(
  'import { getSettings, updateSettings } from "../api/settings";',
  'import { getSettings, updateSettings } from "../api/settings";\nimport { useTheme } from "../contexts/ThemeContext";\nimport { Palette } from "lucide-react";'
);

// Extract useTheme inside component
code = code.replace(
  '  const [error, setError] =',
  '  const { theme, setTheme } = useTheme();\n  const [error, setError] ='
);

// Inject Theme Options section before Monitoring Section
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
                style={{ width: "100%", maxWidth: "300px", marginTop: "8px" }}
              >
                <option value="minimalism">Minimalism (Light Blue & Simple)</option>
                <option value="brutalism">Brutalism (Gray & Sharp Corners)</option>
              </select>
            </div>
          </div>
        </section>
`;

code = code.replace(
  `        {/* MONITORING SETTINGS */}`,
  themeSection + `\n        {/* MONITORING SETTINGS */}`
);

fs.writeFileSync('src/pages/Settings.jsx', code);
