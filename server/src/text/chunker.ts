export function chunkText(text: string, chunkWords = 250, overlapWords = 30) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  if (words.length <= chunkWords) return [text];

  const chunks: string[] = [];
  const step = chunkWords - overlapWords;
  for (let i = 0; i < words.length; i += step) {
    const end = Math.min(i + chunkWords, words.length);
    chunks.push(words.slice(i, end).join(" "));
    if (end === words.length) break;
  }
  return chunks;
}

