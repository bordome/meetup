require("dotenv/config");

const { Bot } = require("grammy");

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.MINI_APP_URL || "http://localhost:5000";

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN not set in .env");
  process.exit(1);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to Meetup! 👋", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Open Meetup", web_app: { url: appUrl } }],
        [{ text: "Counter", web_app: { url: `${appUrl}` } }],
      ],
    },
  });
});

bot.command("help", (ctx) => {
  ctx.reply("Commands:\n/start — open the Mini App\n/counter — show count\n/menu — set menu button");
});

bot.command("counter", async (ctx) => {
  try {
    const res = await fetch(`${appUrl}/api/counter`);
    const { count } = await res.json();
    ctx.reply(`Counter: ${count}`);
  } catch {
    ctx.reply("Could not reach the app. Is `npm start` running?");
  }
});

bot.command("menu", async (ctx) => {
  try {
    await bot.api.setChatMenuButton({
      menu_button: { type: "web_app", text: "Meetup", web_app: { url: appUrl } },
    });
    ctx.reply(`Menu button set to ${appUrl}`);
  } catch (e) {
    ctx.reply(`Failed: ${e.message}`);
  }
});

bot.catch((err) => {
  console.error("Bot error:", err.message);
});

bot.start({
  onStart: () => {
    console.log(`Bot @${bot.botInfo.username} running (polling)`);
    console.log(`Mini App URL: ${appUrl}`);
    console.log("Commands: /start /help /counter /menu");
  },
});
