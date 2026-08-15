const db = require('../db');
db.query('ALTER TABLE therapist_profiles ADD COLUMN IF NOT EXISTS title VARCHAR(50);').then(() => {
  console.log('Column added successfully');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
