import { useState, useEffect } from "react";

export function useStepTypewriter() {
  const words = ["Drink water", "Morning run", "Read 30 mins", "Meditate"];
  const cats = ["Health", "Health", "Study", "Mind"];
  const catMap = { Health: 0, Study: 1, Work: 2, Mind: 3 };
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[wi];
    let timeout;
    if (!del && ci < word.length) {
      timeout = setTimeout(() => setCi((c) => c + 1), 80);
    } else if (!del && ci === word.length) {
      timeout = setTimeout(() => setDel(true), 1200);
    } else if (del && ci > 0) {
      timeout = setTimeout(() => setCi((c) => c - 1), 45);
    } else {
      setDel(false);
      setWi((i) => (i + 1) % words.length);
    }
    setText(word.slice(0, ci));
    return () => clearTimeout(timeout);
  }, [ci, del, wi]);

  return { text, activeIdx: catMap[cats[wi]] };
}
