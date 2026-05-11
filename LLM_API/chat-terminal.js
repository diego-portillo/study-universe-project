import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const messages = [
  { role: "system", content: "You are an ai asistant" },
];

const rl = readline.createInterface({ input, output });

console.log(
  "Interactive chat. Type a message and press Enter. Type exit or quit to stop.\n"
);

try {
  while (true) {
    const line = await rl.question("You: ");
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^(exit|quit)$/i.test(trimmed)) break;

    messages.push({ role: "user", content: trimmed });

    const response = await client.chat.completions.create({
      model: "gpt-5",
      messages,
    });

    const assistantMessage = response.choices[0].message;
    const text = assistantMessage.content ?? "";
    console.log(`Assistant: ${text}\n`);

    messages.push(assistantMessage);
  }
} finally {
  rl.close();
}
