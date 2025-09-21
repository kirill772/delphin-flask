// server.js
const express = require("express");
require("dotenv").config(); // загружаем .env
const app = express();
app.use(express.json());

// ===== Backend API =====

// Проверка статуса сервера
app.get("/api/pending-status", (req, res) => {
  res.json({ message: "Backend работает!" });
});

// Привязка токена к Telegram-аккаунту
app.post("/api/claim-token", (req, res) => {
  const { token, telegram_id, telegram_username } = req.body;

  if (!token || !telegram_id || !telegram_username) {
    return res.json({ success: false, error: "Неверные данные" });
  }

  // TODO: здесь добавить проверку токена в базе данных и присвоение роли
  console.log(`Привязка токена ${token} к TG ${telegram_username} (${telegram_id})`);

  return res.json({ success: true });
});

// ===== Запуск Web Service =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend запущен на порту ${PORT}`);
});
