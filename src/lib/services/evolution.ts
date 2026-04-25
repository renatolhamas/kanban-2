const EVOGO_API_BASE = process.env.EVOGO_API_URL || "https://evogo.renatop.com.br";

export interface SendMessageResponse {
  key: {
    id: string;
    remoteJid: string;
    fromMe: boolean;
  };
  message: {
    conversation: string;
  };
  messageTimestamp: number;
  status: string;
}

/**
 * Service to handle Evolution GO API interactions
 */
export const evolutionService = {
  /**
   * Send a text message via Evolution GO
   */
  async sendText(
    instanceToken: string,
    remoteJid: string,
    text: string
  ): Promise<SendMessageResponse> {
    if (!instanceToken) {
      throw new Error('Evolution instance token is missing');
    }

    // Ensure remoteJid is in the correct format (digits + @s.whatsapp.net)
    const cleanNumber = remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '');
    const jid = `${cleanNumber}@s.whatsapp.net`;

    console.log(`[EvolutionService] Attempting to send message to ${jid}`);

    try {
      const payload = {
        number: jid,
        text: text,
        delay: 0
        // linkPreview is not supported in this version of Evolution GO Swagger
      };

      console.log(`[EvolutionService] Request Headers: { Content-Type: application/json, apikey: ${instanceToken.substring(0, 4)}**** }`);
      console.log(`[EvolutionService] Request Payload:`, JSON.stringify(payload));

      const response = await fetch(`${EVOGO_API_BASE}/send/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': instanceToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData;
        const rawBody = await response.text();
        console.error(`[EvolutionService] sendText failed with status ${response.status}. Raw body:`, rawBody);
        
        try {
          errorData = JSON.parse(rawBody);
        } catch (e) {
          errorData = { message: rawBody || `HTTP Error ${response.status}` };
        }
        
        // Return a cleaner error message if possible
        const errorMessage = errorData.message || errorData.error || `Failed to send message (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[EvolutionService] sendText exception:', error);
      throw error;
    }
  },

  /**
   * Get message status from Evolution GO
   * POST /message/status
   */
  async getMessageStatus(
    instanceToken: string,
    messageId: string
  ): Promise<{ status: number }> {
    try {
      const response = await fetch(`${EVOGO_API_BASE}/message/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': instanceToken,
        },
        body: JSON.stringify({ id: messageId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch message status (Status: ${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('[EvolutionService] getMessageStatus exception:', error);
      throw error;
    }
  }
};

