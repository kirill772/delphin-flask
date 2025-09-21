const express = require('express');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const BOT_USERNAME = process.env.BOT_USERNAME || 'MyBot';
const PENDING_TTL_MIN = 10;

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

// Создать pending link
app.post('/api/create-pending', async (req, res) => {
  const mc_name = req.body.mc_name || null;
  const token = uuidv4();
  const token_hash = sha256(token);
  const short = Math.floor(100000 + Math.random()*900000).toString();
  const expires_at = new Date(Date.now() + PENDING_TTL_MIN*60000);

  await pool.query(
    `INSERT INTO pending_links(token_hash, token_short, mc_name, expires_at)
     VALUES($1,$2,$3,$4)`,
    [token_hash, short, mc_name, expires_at]
  );

  const deeplink = `https://t.me/$DelphinKey_bot?start=$8244205278:AAHlpb6WTZursm2U246DKebqsou1Za-PoJY`;
  res.json({ token, short, deeplink, expires_at });
});

// Проверка статуса
app.get('/api/pending-status', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'no token' });
  const token_hash = sha256(token);

  const { rows } = await pool.query(
    'SELECT claimed, claimed_by_telegram_id FROM pending_links WHERE token_hash=$1',
    [token_hash]
  );

  if (!rows.length) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
