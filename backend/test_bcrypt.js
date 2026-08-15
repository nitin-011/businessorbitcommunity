const bcrypt = require('bcrypt');

async function test() {
  const hash = '$2b$10$o7nLbh1KtB/mTi18BUcKleFMnfIm1WIPmnfqLC46a84ixXfeb3AG2';
  const match = await bcrypt.compare('BusinessOrbit@2026', hash);
  console.log('Match with bcrypt:', match);
}

test();
