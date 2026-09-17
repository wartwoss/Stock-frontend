const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Replace backgrounds
code = code.replace(/background: #f4f6fb;/g, 'background: var(--bg-main);');
code = code.replace(/background: white;/g, 'background: var(--bg-surface);');
code = code.replace(/background: #ffffff;/g, 'background: var(--bg-surface);');
code = code.replace(/background: #f8f9fc;/g, 'background: var(--bg-hover);');

// Replace text colors
code = code.replace(/color: #18212f;/g, 'color: var(--text-main);');
code = code.replace(/color: #303744;/g, 'color: var(--text-main);');
code = code.replace(/color: #383f4b;/g, 'color: var(--text-main);');
code = code.replace(/color: #414854;/g, 'color: var(--text-main);');
code = code.replace(/color: #343b47;/g, 'color: var(--text-main);');

code = code.replace(/color: #969ca7;/g, 'color: var(--text-muted);');
code = code.replace(/color: #999faa;/g, 'color: var(--text-muted);');
code = code.replace(/color: #a0a5ae;/g, 'color: var(--text-muted);');
code = code.replace(/color: #878d98;/g, 'color: var(--text-muted);');
code = code.replace(/color: #6b7280;/g, 'color: var(--text-muted);');

fs.writeFileSync('src/index.css', code);
