import OpenAI from "openai";

const key = "Fill in with key";

const openai = new OpenAI({apiKey: key});

/* Helpter function to turn AI's output into number */
const processAnswerIndex = (text) => {
  text = text.replace(/\D/g, '');
  return parseInt(text, 10);
}

/* Generates the avatar's responses for their text bubble */
export async function getCompletion(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are an AI assistant for a productivity app designed to help individuals with ADHD stay focused and motivated during 
        work sessions. This app features three distinct persona-based assistants, each with a unique approach to encouragement and accountability. 
        Every user request will specify which persona to respond as. Your responses must strictly follow the assigned persona’s style, without adding any extra 
        commentary, emojis, or special text formatting. Respond only as the persona listed in the prompt, and respond as if you're talking directly to the user!
        The three personas are: Positive Percy: Always maintains a positive attitude, even in the most challenging
         moments. Encourages users with optimism and reassurance. Sassy Mary: Feisty and no-nonsense, Mary pushes users to stay on track with tough love, like a sergeant.
         Gentle Joey: Gentle and forgiving, Joey offers kind, understanding support and never applies pressure. When generating a response, 
         strictly embody the specified persona and deliver a response accordingly. Do not explain your role or acknowledge that you are an AI assistant—just respond 
         as the persona. All answers should be a BRIEF sentence or two. Make responses unique and not generic--have fun with the given persona!`},
      { role: "user", content: prompt },
    ],
    store: true,
  });
  return completion.choices[0].message.content;
}

/* Processes a user's answers and returns the interpretation */
export async function interpretAnswer(question, answer, options) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `You are an AI assistant for a productivity app designed to help individuals with ADHD stay focused and motivated during 
        work sessions. You will be given the question asked to the user, the answer the user gave us, and a zero-indexed list of options to interpret it. Answer with the only the
        numerical index of the option that best corresponds with the user's reply, eg. '0' or '2'`},
      { role: "user", content: "Question: " + question + ", User answer: " + answer + ", Options: " + options },
    ],
    store: true,
  });
  return processAnswerIndex(completion.choices[0].message.content);
}