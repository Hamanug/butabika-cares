const fs = require('fs');

const files = [
  'src/pages/Therapists.jsx',
  'src/pages/SleepHygiene.jsx',
  'src/pages/StressManagement.jsx',
  'src/pages/Screenings.jsx',
  'src/pages/Grounding.jsx',
  'src/pages/CognitiveReframing.jsx',
  'src/pages/BodyScan.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/components/VideoRoomModal.jsx'
];

files.forEach(file => {
  const filePath = require('path').join('c:/Users/User/Documents/butabika/frontend', file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping ' + file);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Simple string replacements for alert
  content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
    if (p1.toLowerCase().includes('success')) {
      return `toast.success(${p1})`;
    }
    return `toast.error(${p1})`;
  });

  if (content !== originalContent) {
    if (!content.includes('import toast from')) {
      // Find the last import statement and add import toast right after it
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + 'import toast from \'react-hot-toast\';\n' + content.slice(endOfLine + 1);
      } else {
        content = 'import toast from \'react-hot-toast\';\n' + content;
      }
    }
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + file);
  }
});
