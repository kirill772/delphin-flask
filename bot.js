// bot.js
const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

bot.start(async (ctx) => {
  const token = ctx.startPayload; // payload из ссылки лаунчера
  const tgId = ctx.from.id;
  const tgUsername = ctx.from.username;

  if (!token) return ctx.reply("Запусти меня через ссылку из лаунчера!");

  try {
    const r = await axios.post(`${process.env.BACKEND_URL}/api/claim-token`, {
      token,
      telegram_id: tgId,
      telegram_username: tgUsername,
    });

    if (r.data.success) {
      ctx.reply(`✅ Аккаунт ${tgUsername} успешно зарегистрирован! Можешь запускать Minecraft.`);
    } else {
      ctx.reply("⚠️ Ошибка при регистрации: " + JSON.stringify(r.data));
    }
  } catch (e) {
    ctx.reply("❌ Ошибка при запросе к серверу");
  }
});

// Проверка статуса backend
bot.command("status", async (ctx) => {
  try {
    const r = await axios.get(`${process.env.BACKEND_URL}/api/pending-status`);
    ctx.reply(`Backend ответил: ${JSON.stringify(r.data)}`);
  } catch (err) {
    ctx.reply(`Ошибка при обращении к backend: ${err.message}`);
  }
});

bot.launch().then(() => console.log("Telegram Bot запущен"));
