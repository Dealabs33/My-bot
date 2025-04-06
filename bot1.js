const { Telegraf } = require("telegraf");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const TELEGRAM_BOT_TOKEN = "7566655981:AAEqqQ9paESh7hhJ2JQ5Gwzw2EWQO6bBGyQ";
const OPENROUTER_API_KEY = "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";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Detect graph input
function parseGraphInput(text) {
  try {
    const [xPart, yPart] = text.split(":").map(part => part.trim());
    if (!xPart.toLowerCase().startsWith("x") || !yPart.toLowerCase().startsWith("y")) return null;

    const xValues = xPart.split(",").slice(1).map(Number);
    const yValues = yPart.split(",").slice(1).map(Number);

    if (xValues.length !== yValues.length) return null;

    return { xValues, yValues };
  } catch {
    return null;
  }
}

bot.on("text", async (ctx) => {
  const userMessage = ctx.message.text;
  const graphData = parseGraphInput(userMessage);

  if (graphData) {
    const { xValues, yValues } = graphData;

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
      type: 'line',
      data: {
        labels: xValues,
        datasets: [{
          label: 'Graph Plot',
          data: yValues,
          borderColor: 'blue',
          fill: false
        }]
      }
    }))}`;

    return ctx.replyWithPhoto({ url: chartUrl }, { caption: "Here is your graph!" });
  }

  // Special response for "who made you"
  const lower = userMessage.toLowerCase();
  if (
    lower.includes("who made you") || lower.includes("your creator") ||
    lower.includes("who is your owner") || lower.includes("made you")
  ) {
    return ctx.reply("I was created and managed by *Dev Divine*.", { parse_mode: "Markdown" });
  }

  // AI response
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://yourdomain.com",
        "X-Title": "TelegramBot"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Hmm... couldn't understand that.";
    ctx.reply(reply);
  } catch (error) {
    console.error("Error:", error);
    ctx.reply("Something went wrong while talking to the AI.");
  }
});

bot.launch();
console.log("🤖 Telegram AI bot using OpenRouter is running...");