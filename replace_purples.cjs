const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Colors to replace with var(--primary)
const primaryRegex = /#7560f5|#6754db|#8575fa|#705cf0|#7663e9|#705cf2/gi;
code = code.replace(primaryRegex, 'var(--primary)');

// Colors to replace with var(--primary-light)
const primaryLightRegex = /#f2efff|#f0edff|#e1ddfc/gi;
code = code.replace(primaryLightRegex, 'var(--primary-light)');

// Sidebar specific background (it was currently white)
// Let's not touch backgrounds globally, let's fix the theme file instead.

fs.writeFileSync('src/index.css', code);
