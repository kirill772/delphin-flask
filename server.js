// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// "База" пользователей в памяти (для примера)
const users = {}; // { telegramId: { username, token } }

// ===== Проверка статуса backend =====
app.get("/api/pending-status", (req, res) => {
  res.json({ message: "Backend работает!" });
});

// ===== Регистрация токена от клиента =====
app.post("/api/claim-token", (req, res) => {
  const { token, telegram_id, telegram_username } = req.body;

  if (!token || !telegram_id || !telegram_username) {
    return res.json({ success: false, error: "Неверные данные" });
  }

  // Сохраняем в "базу"
  users[telegram_id] = { username: telegram_username, token };
  console.log(`Привязка токена ${token} к TG ${telegram_username} (${telegram_id})`);

  return res.json({ success: true });
});

// ===== Проверка ник/пароля при входе =====
app.post("/api/login", (req, res) => {
  const { telegram_id, username, token } = req.body;

  const user = users[telegram_id];
  if (!user) return res.json({ success: false, error: "Пользователь не найден" });

  if (user.token === token && user.username === username) {
    return res.json({ success: true });
  }

  return res.json({ success: false, error: "Неверный ник или токен" });
});

// ===== Запуск сервера =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend запущен на порту ${PORT}`));
