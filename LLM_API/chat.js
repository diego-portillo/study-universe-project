import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let messages = [
    {   role: "system", content: "You are an ai asistant"    },
    {   role: "user", content: "What's the capital city of Paraguay"    }
]

const response1 = await client.chat.completions.create({
    model: "gpt-5",
    messages,
});

console.log(response1.choices[0].message.content);

messages = messages.concat([response1.choices[0].message]);
messages.push({ role: "user", content: "and whats the population?" });

const response2 = await client.chat.completions.create({
    model: "gpt-5",
    messages,
});

console.log(response2.choices[0].message.content);