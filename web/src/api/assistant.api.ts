import { apiRequest } from "./client";

export interface AssistantStatus {
  available: boolean;
  provider: string;
}

let statusPromise: Promise<AssistantStatus> | null = null;

/** Whether an AI model answers chat on this server (cached for the session). */
export function getAssistantStatus(): Promise<AssistantStatus> {
  statusPromise ??= apiRequest<AssistantStatus>("/api/v1/assistant/status").catch(() => {
    statusPromise = null;
    return { available: false, provider: "template" };
  });
  return statusPromise;
}

export async function chat(
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const result = await apiRequest<{ reply: string; generated_by: string }>("/api/v1/assistant/chat", {
    method: "POST",
    body: { messages },
  });
  return result.reply;
}
