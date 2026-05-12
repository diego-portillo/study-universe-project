type TextPart = {
  type: "text";
  text: string;
};

type ImageUrlPart = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
};

type MessageContent = string | Array<TextPart | ImageUrlPart>;

export type Message = {
  role: "system" | "user" | "assistant";
  content: MessageContent;
};

export function applyLowDetailToImages(
  messages: Message[]
): Message[] {
  return messages.map((msg) => {
    if (!Array.isArray(msg.content)) {
      return msg;
    }

    const content = msg.content.map((part) => {
      if (part.type !== "image_url") {
        return part;
      }

      const url = part.image_url?.url;

      if (typeof url !== "string") {
        return part;
      }

      const allowed =
        url.startsWith("data:image/") ||
        url.startsWith("https://");

      if (!allowed) {
        throw new Error(
          "image_url must be a data: or https: URL"
        );
      }

      return {
        ...part,
        image_url: {
          ...part.image_url,
          detail: "low",
        },
      };
    });

    return {
      ...msg,
      content,
    };
  });
}

export function messagesIncludeVision(
  messages: Message[]
): boolean {
  return messages.some(
    (message) =>
      Array.isArray(message.content) &&
      message.content.some(
        (part) => part.type === "image_url"
      )
  );
}