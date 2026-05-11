/**
 * Ensures vision inputs use the lowest detail tier (fewer image tokens).
 * @param {unknown[]} messages
 * @returns {unknown[]}
 */
export function applyLowDetailToImages(messages) {
  return messages.map((msg) => {
    if (!msg || typeof msg !== "object" || !Array.isArray(msg.content)) {
      return msg;
    }
    const content = msg.content.map((part) => {
      if (!part || typeof part !== "object" || part.type !== "image_url") {
        return part;
      }
      const url = part.image_url?.url;
      if (typeof url !== "string") return part;
      const allowed =
        url.startsWith("data:image/") ||
        url.startsWith("https://");
      if (!allowed) {
        throw new Error("image_url must be a data: or https: URL");
      }
      return {
        ...part,
        image_url: {
          ...part.image_url,
          detail: "low",
        },
      };
    });
    return { ...msg, content };
  });
}

export function messagesIncludeVision(messages) {
  return messages.some(
    (m) =>
      m &&
      typeof m === "object" &&
      Array.isArray(m.content) &&
      m.content.some((p) => p && p.type === "image_url")
  );
}
