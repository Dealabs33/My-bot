require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const fetch = require("node-fetch");

const bot = new Telegraf(process.env.BOT_TOKEN);

async function getAIReply(message) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";
}

bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text;
  const reply = await getAIReply(userMessage);
  ctx.reply(reply);
});

bot.launch();

const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(process.env.PORT || 3000);

setInterval(() => {
  fetch("https://your-render-app-name.onrender.com/");
}, 5 * 60 * 1000);