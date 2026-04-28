/**
 * Frontend API wrapper for message operations
 */

export interface SendMessagePayload {
  conversationId: string;
  text: string;
  id?: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId: string;
  evolutionMessageId?: string;
  error?: string;
}

/**
 * Sends a message to the backend API
 */
export async function apiSendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  const response = await fetch('/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Error sending message (Status: ${response.status})`);
  }

  return data as SendMessageResponse;
}
