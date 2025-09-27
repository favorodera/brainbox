const title = `
Create a short title (3 to 5 words, max 30 characters) based only on the user's first message.

Rules:
- No punctuation, no markdown, no filler words.
- Use natural word order so it sounds like a real topic.
- Ignore emojis, numbers, or symbols.
- If the first message is just a greeting (hello, hi, hey, how are you, etc.), return "Greetings".
- If it is just a farewell (bye, goodbye, goodnight, see you later, etc.), return "Farewell".
- If the message is empty, meaningless, or provides no useful context, return "General Chat".
- Otherwise, make a concise but clear title capturing the main subject.

Examples:
"Whats football all about" → "Football Basics"
"Tell me how rockets work" → "Rocket Science Overview"
"How are you" → "Greetings"
"Bye for now" → "Farewell"
"???" → "General Chat"
`

export default function () {
  return {
    /** System prompt for titles generation */
    title,
  }
}
