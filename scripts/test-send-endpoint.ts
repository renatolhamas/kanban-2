import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.EVO_GO_API_KEY;
const baseUrl = process.env.EVOGO_API_URL || 'https://evogo.renatop.com.br';

async function testSend() {
  // We need a real instance token and a number to test
  // But for now, let's just check if the endpoint exists (HEAD or GET if supported)
  const endpoints = ['/message/sendText', '/message/send'];
  
  for (const ep of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${ep}`, {
        method: 'POST',
        headers: {
          'apikey': apiKey || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty body to see what error it gives
      });
      console.log(`Endpoint ${ep}: Status ${response.status}`);
      const body = await response.text();
      console.log(`Response: ${body.substring(0, 200)}`);
    } catch (err) {
      console.error(`Error testing ${ep}:`, err);
    }
  }
}

testSend();
