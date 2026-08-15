const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "../src");
const ignoreDirs = [
  "node_modules",
  "coverage",
  "docs",
  "tests",
  "__tests__",
  ".postman",
  "assets",
  "dist",
  "build",
];

const hasFileLevelDoc = (content) => {
  const match = content.match(/\/\*\*[\s\S]*?@file[\s\S]*?\*\//);
  return match !== null && match.index < 500; // should be at the top
};

const countExportedFunctions = (content) => {
  const regex =
    /export\s+(?:(?:async\s+)?function\b|(?:const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|default\s+(?:(?:async\s+)?function|(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>))/g;
  let count = 0;
  while (regex.exec(content)) count++;
  // also check for module.exports
  if (content.includes("module.exports")) count++;
  return count;
};

const countFunctionLevelDocs = (content) => {
  const regex =
    /\/\*\*[\s\S]*?\*\/\s*export\s+(?:(?:async\s+)?function\b|(?:const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>|default\s+(?:(?:async\s+)?function|(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>))/g;
  let count = 0;
  while (regex.exec(content)) count++;
  return count;
};

// Regression tests
(function runSelfTests() {
  const testCode = `
    export const shouldNotCount = 5;
    export async function shouldCount1() {}
    export const shouldCount2 = async () => {}
    export const shouldCount3 = (x) => {}
    export default function shouldCount4() {}
    module.exports = {};
    
    export const multilineCount = (
      req,
      res
    ) => {}

    /** doc */
    export async function docCount1() {}
    
    /** doc */
    export const docCount2 = async () => {}
    
    /** doc */
    export const docCount3 = (req, res, next) => {}
  `;
  const ex = countExportedFunctions(testCode);
  const dc = countFunctionLevelDocs(testCode);
  if (ex !== 9 || dc !== 3) {
    console.error(
      `check-jsdoc.js regex regression test failed: expected 9 exports and 3 docs, got ${ex} exports and ${dc} docs.`,
    );
    process.exitCode = 1;
  }
})();

const results = {
  hasFileJSDoc: [],
  missingFileJSDoc: [],
  hasFunctionJSDoc: [],
  missingFunctionJSDoc: [],
};

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        scanDir(fullPath);
      }
    } else if (file.endsWith(".ts") && !file.endsWith(".test.ts")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const relativePath = path.relative(backendDir, fullPath);

      if (hasFileLevelDoc(content)) {
        results.hasFileJSDoc.push(relativePath);
      } else {
        results.missingFileJSDoc.push(relativePath);
      }

      const exported = countExportedFunctions(content);
      const docs = countFunctionLevelDocs(content);

      if (exported > 0) {
        if (docs >= exported) {
          results.hasFunctionJSDoc.push(relativePath);
        } else {
          results.missingFunctionJSDoc.push({
            file: relativePath,
            missing: exported - docs,
          });
        }
      } else if (
        relativePath.includes("model") ||
        relativePath.includes("schema")
      ) {
        // Special case for models, check for class or model export
        if (content.includes("model(")) {
          if (
            content.match(
              /\/\*\*[\s\S]*?\*\/\s*export\s+(?:const|let|var|default)\s+[a-zA-Z0-9_]+\s*=\s*.*?model\(/,
            )
          ) {
            results.hasFunctionJSDoc.push(relativePath);
          } else {
            results.missingFunctionJSDoc.push({
              file: relativePath,
              missing: 1,
            });
          }
        }
      }
    }
  }
}

scanDir(backendDir);
console.log(JSON.stringify(results, null, 2));
