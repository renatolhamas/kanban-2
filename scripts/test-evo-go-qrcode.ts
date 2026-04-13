/**
 * Test Evo GO API - Get QR Code for Instance
 * Usage: npx ts-node scripts/test-evo-go-qrcode.ts <instance-id>
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.EVO_GO_API_KEY;
const baseUrl = process.env.EVOGO_API_URL || 'https://evogo.renatop.com.br';

if (!apiKey) {
  console.error('❌ EVO_GO_API_KEY not set in .env.local');
  process.exit(1);
}

// Get instance ID from command line or use the one we just created
const instanceId = process.argv[2] || '5dcd7ce7-584c-4102-85e0-7d3523114d2c';

async function testGetQRCode() {
  console.log('🧪 Testing Evo GO API - Get QR Code');
  console.log('━'.repeat(50));
  console.log(`📍 API Base URL: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`📦 Instance ID: ${instanceId}`);
  console.log();

  // Try multiple possible endpoints for QR code
  const possibleEndpoints = [
    `/instance/${instanceId}/qrcode`,
    `/instance/${instanceId}`,
    `/instance/fetch/${instanceId}`,
    `/api/instance/${instanceId}/qrcode`,
  ];

  for (const endpoint of possibleEndpoints) {
    console.log(`\n🔗 Trying: GET ${endpoint}`);
    console.log('─'.repeat(50));

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          console.log('   Response:');
          if (json.data?.qrcode) {
            console.log(`   ✅ QR Code found! (${json.data.qrcode.length} chars)`);
          } else {
            console.log(JSON.stringify(json, null, 2));
          }
        } catch {
          console.log(`   Response: ${text.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

testGetQRCode();
