const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const purples = [
  "#6654d8", "#6754d9", "#6754df", "#6755da", "#6756d7", "#6855e0", "#6856d8", "#6857da", "#6955e9", "#6957d9", "#6b58e5", "#6c58d8", "#6c58ec", "#6e5cf5", "#6f5af1", "#6f5af3", "#6f5cf3", "#705cf1", "#705cf3", "#725cff", "#725df5", "#725fff", "#735fff", "#755ff7", "#755fff", "#7560f7", "#7562f6", "#7563f7", "#765ff7", "#765fff", "#7764eb", "#7865f8", "#7c69ff", "#8675fb", "#8b78ff", "#8c79ff", "#8d79ff", "#8d7cff", "#9a83ff", "#9a84ff", "#9b8aff", "#9d85ff", "#a084ff", "#c9c1ff", "#cac2ff", "#cbc4ff", "#cdc6ff", "#d8d2ff", "#d9d3ff", "#e7e4ff", "#e8e4ff", "#ebe8ff", "#ece9ff", "#f1eeff", "#f1efff", "#f4f2ff", "#f5f3ff", "#f6f4ff", "#f6f5ff", "#f7f5ff", "#faf9ff", "#fbfaff"
];

purples.forEach(p => {
  const regex = new RegExp(p, 'gi');
  code = code.replace(regex, 'var(--primary)');
});

fs.writeFileSync('src/index.css', code);
