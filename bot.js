// bot.js
const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

if (!process.env.TG_BOT_TOKEN || !process.env.BACKEND_URL) {
  console.error("Ошибка: не указаны TG_BOT_TOKEN или BACKEND_URL в .env!");
  process.exit(1);
}

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

// ===== Команда /start =====
bot.start(async (ctx) => {
  const token = ctx.startPayload; // payload из ссылки лаунчера
  const tgId = ctx.from.id;
  const tgUsername = ctx.from.username;

  if (!token) {
    return ctx.reply("Запусти меня через ссылку из лаунчера!");
  }

  try {
    const r = await axios.post(`${process.env.BACKEND_URL}/api/claim-token`, {
      token,
      telegram_id: tgId,
      telegram_username: tgUsername
    });

    if (r.data.success) {
      ctx.reply("✅ Аккаунт привязан! Можешь вернуться в игру.");
    } else {
      ctx.reply("⚠️ Ошибка при привязке: " + JSON.stringify(r.data));
    }
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Ошибка при запросе к серверу");
  }
});

// ===== Команда /status =====
bot.command("status", async (ctx) => {
  try {
    const r = await axios.get(`${process.env.BACKEND_URL}/api/pending-status`);
    ctx.reply(`Backend ответил: ${JSON.stringify(r.data)}`);
  } catch (err) {
    ctx.reply(`Ошибка при обращении к backend: ${err.message}`);
  }
});

// ===== Запуск бота =====
bot.launch().then(() => console.log("Telegram Bot запущен"));

// Graceful shutdown для Render
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
