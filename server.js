// server.js
const express = require("express");
const { Telegraf } = require("telegraf");
require("dotenv").config(); // если используешь .env локально

const app = express();
app.use(express.json());

// ===== Backend API =====
app.get("/api/pending-status", (req, res) => {
  res.json({ message: "Backend работает!" });
});

// Здесь можно добавить остальные API endpoints для вашего Minecraft-клиента
// Например, регистрация, проверка ролей, список пользователей и т.д.

// ===== Telegram Bot =====
if (!process.env.TG_BOT_TOKEN) {
  console.error("Ошибка: не указан TG_BOT_TOKEN в переменных окружения!");
  process.exit(1);
}

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

// Пример команды /start
bot.start((ctx) => {
  ctx.reply("Привет! Я бот, связанный с вашим Minecraft-клиентом.");
});

// Пример команды /status, которая проверяет backend
bot.command("status", async (ctx) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/pending-status`);
    const data = await response.json();
    ctx.reply(`Backend ответил: ${JSON.stringify(data)}`);
  } catch (err) {
    ctx.reply(`Ошибка при обращении к backend: ${err.message}`);
  }
});

// Запуск бота через polling
bot.launch().then(() => console.log("Telegram Bot запущен"));

// ===== Запуск Web Service для Render =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend + Bot запущен на порту ${PORT}`);
});

// ===== Безопасность для Render =====
// Обрабатываем graceful shutdown (при рестартах Render)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
