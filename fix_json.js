const fs = require('fs');
const file = 'Docs/Business_Orbit_Community_Member_Spotlight_Responses.json';
if (fs.existsSync(file)) {
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const cleaned = data.map(record => {
    // 1. Normalize Instagram key
    if ("Instagram Profile URL\n" in record) {
      record["Instagram Profile URL"] = record["Instagram Profile URL\n"];
      delete record["Instagram Profile URL\n"];
    }

    // 4. Clean URL fields (get first valid link if multiple)
    for (let key of ["LinkedIn Profile URL", "Instagram Profile URL"]) {
      if (record[key] && typeof record[key] === 'string') {
        const match = record[key].match(/https?:\/\/[^\s]+/);
        if (match) record[key] = match[0];
      }
    }

    // 4. Resolve Email vs Email Address
    const email = record["Email"] || record["Email Address"] || null;
    record["Email"] = email;
    delete record["Email Address"];

    // 4. Split Company & Designation
    const compDesig = record["Company & Designation"] || "";
    const parts = compDesig.split(/[-|]/);
    record["Company"] = parts[0] ? parts[0].trim() : null;
    record["Designation"] = parts.length > 1 ? parts[1].trim() : null;
    delete record["Company & Designation"];

    // 2. Remove sensitive fields
    delete record["Timestamp"];
    delete record["Email"];
    delete record["Phone Number"];
    delete record["Tell us about yourself"]; // Detailed bio
    
    return record;
  });
  
  fs.writeFileSync(file, JSON.stringify(cleaned, null, 2), 'utf8');
}
