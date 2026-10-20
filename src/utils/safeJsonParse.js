// Gemini responses often contain raw LaTeX (e.g. \frac, \sqrt, \times) inside
// JSON string values. Those backslashes aren't valid JSON escape sequences,
// so a plain JSON.parse throws "Bad escaped character". This strips markdown
// code fences and, if parsing fails, escapes stray backslashes before retrying.
export function safeJsonParse(rawText) {
  const cleaned = String(rawText).replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const repaired = cleaned.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");
    try {
      return JSON.parse(repaired);
    } catch (e2) {
      throw e;
    }
  }
}
