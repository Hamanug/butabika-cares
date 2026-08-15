const db = require('../db');
db.query(`
  SELECT 
    u.id, 
    u.role,
    u.email,
    tp.title,
    COALESCE(p.first_name, 'New') AS first_name, 
    COALESCE(p.last_name, 'Therapist') AS last_name, 
    COALESCE(tp.specialization, 'Pending Assignment') as occupation, 
    tp.profile_picture,
    tp.bio
  FROM users u
  LEFT JOIN profiles p ON u.id = p.user_id
  LEFT JOIN therapist_profiles tp ON u.id = tp.user_id
  WHERE u.role = 'therapist'
  ORDER BY last_name ASC LIMIT 1
`).then(res => { console.log(res.rows[0]); process.exit(0); });
