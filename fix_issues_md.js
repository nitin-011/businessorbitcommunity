const fs = require('fs');
const files = ['Confirmed-Issues.md', 'Docs/issues-audit.md'];
const dateStr = new Date().toISOString().split('T')[0];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Label as historical snapshot
  if (!content.includes('historical snapshot')) {
    content = content.replace(/# Codebase Audit(.*?)\n/, `# Codebase Audit$1\n\n> **Note:** This document is a historical snapshot of the audit scope (dated ${dateStr}). Issues marked as resolved have been fixed.\n`);
  }
  
  // Add Status and Last verified to specific issues
  const issuesToResolve = ['SEC-003', 'SEC-005', 'DEP-003', 'CQ-001', 'CFG-003', 'DEP-005', 'UX-001', 'DEP-007', 'DEP-008', 'DEP-009'];
  for (const issue of issuesToResolve) {
    const sectionRegex = new RegExp(`(### ${issue} (?:.|\\n)*?(?=\\n### |$))`, 'g');
    content = content.replace(sectionRegex, (match) => {
      if (match.includes("- **Status:**") || match.includes("- **Last verified:**")) return match;
      const primaryRegex = new RegExp(`(### ${issue} .*?\\n- \\*\\*Category:\\*\\* .*?\\n- \\*\\*Location:\\*\\* .*?\\n)`);
      if (primaryRegex.test(match)) {
        return match.replace(primaryRegex, `$1- **Status:** Resolved\n- **Last verified:** ${dateStr}\n`);
      } else if (file === 'Docs/issues-audit.md') {
        const fallbackRegex = new RegExp(`(### ${issue} .*?\\n)`);
        return match.replace(fallbackRegex, `$1- **Status:** Resolved\n- **Last verified:** ${dateStr}\n`);
      }
      return match;
    });
  }

  // Docs/issues-audit.md specific updates
  if (file === 'Docs/issues-audit.md') {
    content = content.replace(/27 issues total/g, '26 issues total');
    content = content.replace(/26 issues total.*?and 5 Critical/g, '26 issues total and 4 Critical');
    
    // Update legacy location references
    content = content.replace(/backend\/server\.js/g, 'backend/src/server.ts');
    content = content.replace(/backend\/config\/db\.js/g, 'backend/src/config/database.ts');
    content = content.replace(/frontend\/src\//g, 'frontend/app/');

    // DEP-004 remove node_modules absence finding
    if (content.includes('DEP-004')) {
      content = content.replace(/- \*\*Reasoning:\*\* `node_modules` is completely absent.*?lockfile/gs, '- **Reasoning:** Check lockfile consistency plus npm ci or CI installation failures');
    }
  }

  fs.writeFileSync(file, content, 'utf8');
}
