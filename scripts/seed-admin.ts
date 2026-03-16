import pg from 'pg';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@themarketingreset.com';
const ADMIN_PASSWORD = 'MarketingReset2026!';
const ADMIN_NAME = 'Karli Rosario';

async function seed() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'admin', NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, updated_at = NOW()`,
      [ADMIN_EMAIL, passwordHash, ADMIN_NAME],
    );

    console.log('Admin user seeded successfully.');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log('Password: [as configured]');
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
