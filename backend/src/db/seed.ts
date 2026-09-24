import bcrypt from 'bcryptjs';
import { pool } from './pool';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running the admin seed command.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
  }

  const firstName = process.env.ADMIN_FIRST_NAME?.trim() || 'Platform';
  const lastName = process.env.ADMIN_LAST_NAME?.trim() || 'Administrator';
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
  await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, subscription_tier, is_active)
     VALUES ($1, $2, $3, $4, 'admin', 'free', true)
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       role = 'admin',
       is_active = true,
       updated_at = NOW()`,
    [email, passwordHash, firstName, lastName]
  );
  console.log(`Admin account initialized for ${email}.`);
}

seedAdmin()
  .catch((error) => {
    console.error('Admin seed failed:', error.message || error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
