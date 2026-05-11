import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.responses.create({
  model: "gpt-5.4-nano",
  input: "Tell me a story in one paragraph about alan turing.",
  stream: true
});

for await (const event of response) {
  if (event.type === "response.output_text.delta") {
    process.stdout.write(event.delta);
  }
}

console.log();
