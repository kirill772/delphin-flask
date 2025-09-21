const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.TG_BOT_TOKEN);

bot.start(async (ctx) => {
  const token = ctx.startPayload;
  const tgId = ctx.from.id;
  const tgUsername = ctx.from.username;

  if (!token) return ctx.reply("Запусти меня через ссылку из лаунчера!");

  try {
    const r = await axios.post(process.env.BACKEND_URL + "/api/claim-token", {
      token,
      telegram_id: tgId,
      telegram_username: tgUsername
    });
    if (r.data.success) {
      ctx.reply("✅ Аккаунт привязан! Можешь вернуться в игру.");
    } else {
      ctx.reply("⚠️ Ошибка: " + JSON.stringify(r.data));
    }
  } catch (e) {
    ctx.reply("❌ Ошибка при запросе к серверу");
  }
});

bot.launch();
