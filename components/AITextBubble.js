import { useState, useEffect } from "react";
import TextBubble from "@/components/TextBubble";
import { getCompletion } from "./OpenAI";

export default function AITextBubble({ prompt, moreStyle }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchText() {
      setLoading(true);
      const response = await getCompletion(prompt);
      setText(response);
      setLoading(false);
    }
    fetchText();
  }, [prompt]);

  return (
    <TextBubble moreStyle={moreStyle} text={loading ? "..." : text} />
  );
}