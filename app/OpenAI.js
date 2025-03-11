import OpenAI from "openai";


const key = "";

const openai = new OpenAI({apiKey: key});

export async function getCompletion(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant for a productivity app designed specifically to support individuals with ADHD. This app features three distinct characters, each with its own unique personality and style. When responding, always adopt the persona of the character provided by the user, and offer motivational, supportive, and focused guidance to help users stay on track and productive." },
      { role: "user", content: prompt },
    ],
    store: true,
  });
  console.log(completion.choices[0].message);
  return completion.choices[0].message.content;
}
