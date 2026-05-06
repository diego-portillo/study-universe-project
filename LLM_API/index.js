import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-5.4-nano",
  input: "Tell me in one line what time is now in Paraguay.",
});

console.log(response.output_text);
