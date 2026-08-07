const fs = require('fs');
const code = fs.readFileSync('app/business/page.tsx', 'utf8');
const babel = require('@babel/core');
try {
  babel.parse(code, { filename: 'page.tsx', presets: ['@babel/preset-react', '@babel/preset-typescript'] });
  console.log("Parsed successfully");
} catch(e) {
  console.log(e.message);
}
