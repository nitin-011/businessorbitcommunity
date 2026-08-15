const fs = require('fs');

// 1. Docs/TESTING.md
let testing = fs.readFileSync('Docs/TESTING.md', 'utf8');

// Phase 4
testing = testing.replace(
  /This tests the end-to-end checkout flow using PhonePe Production credentials.*?(?=## Phase 5)/s,
  `This tests the checkout flow. Use a PhonePe-supported sandbox or mocked payment provider by default. Do not use production credentials or real transactions for routine checkout tests. Production live-payment testing is moved to a separately approved runbook with explicit charge amounts and refund controls.\n\n`
);

// Phase 1 (autogen password logging)
testing = testing.replace(
  /Check your terminal running the backend\. You should see a log of the generated password.*?hashed password\./s,
  `Use a disposable local fixture and controlled test inbox (or fixture) to verify password delivery. The new user should exist in the \`communitymembers\` collection with a \`role\` of \`student\` and a hashed password.`
);

// Prerequisites (env)
testing = testing.replace(
  /PHONEPE_ENV=PRODUCTION.*?PHONEPE_SALT_INDEX=1/s,
  `PHONEPE_ENV=SANDBOX
PHONEPE_MERCHANT_ID=sandbox_merchant_id
PHONEPE_SALT_KEY=sandbox_salt_key
PHONEPE_SALT_INDEX=1

*(Note: Inject real secrets securely through your local environment configuration. Exposed credentials must never be committed and should be rotated if exposed.)*`
);
testing = testing.replace(/JWT_SECRET=your_jwt_secret_here/, 'JWT_SECRET=sandbox_jwt_secret');
fs.writeFileSync('Docs/TESTING.md', testing);

// 2. Docs/TESTING_CHECKOUT.md
let checkout = fs.readFileSync('Docs/TESTING_CHECKOUT.md', 'utf8');
checkout = checkout.replace(
  /Instead of testing with the full price, we will temporarily hardcode the backend to charge exactly \*\*₹1\*\*.*?\(Don't forget to restart your backend after making this change!\)/s,
  `Use the payment provider's supported test environment for ₹1 testing, or explicitly reject test pricing whenever \`PHONEPE_ENV\` is PRODUCTION. Production checkout pricing cannot be changed by this test procedure.`
);
checkout = checkout.replace(
  /Revert the Amount: Go back to `backend\/src\/modules\/community\/card.controller.ts`.*?Refund the Test:/s,
  `Refund the Test:`
);
fs.writeFileSync('Docs/TESTING_CHECKOUT.md', checkout);

// 3. Docs/design_guidelines.json
let design = fs.readFileSync('Docs/design_guidelines.json', 'utf8');
design = design.replace(/"file_type": "jsx\/js"/, '"file_type": "jsx/js/tsx"');
fs.writeFileSync('Docs/design_guidelines.json', design);

// 4. Docs/overview.md
let overview = fs.readFileSync('Docs/overview.md', 'utf8');
overview = overview.replace(/\|-- design_guidelines\.json/, '|-- Docs/\n|   |-- design_guidelines.json');
// Remove internal access and contributor history section if present
overview = overview.replace(/## Internal Access & Contributor History.*?##/s, '##');
overview = overview.replace(/frontend\/app\/\(site\)\/layout\.tsx provides Navbar, Footer.*?for public routes/s, 'frontend/app/(site)/layout.tsx provides Navbar, Footer, and CookieBanner for public routes');
fs.writeFileSync('Docs/overview.md', overview);

// 5. docker-compose.yml
let docker = fs.readFileSync('docker-compose.yml', 'utf8');
docker = docker.replace(/# - MONGO_URL=\$\{MONGO_URL\}/, '- MONGO_URL=${MONGO_URL}');
fs.writeFileSync('docker-compose.yml', docker);

// 6. backend/.dockerignore and frontend/.dockerignore
for (const file of ['backend/.dockerignore', 'frontend/.dockerignore']) {
  if (fs.existsSync(file)) {
    let ignore = fs.readFileSync(file, 'utf8');
    ignore = ignore.replace(/\.env$/, '.env*');
    ignore = ignore.replace(/\.env\.local$/, ''); // since .env* covers it
    fs.writeFileSync(file, ignore);
  }
}
