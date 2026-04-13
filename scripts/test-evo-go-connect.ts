/**
 * Test Evo GO API - Connect/Start Instance (to generate QR code)
 * Usage: npx ts-node scripts/test-evo-go-connect.ts <instance-id>
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

async function testConnectInstance() {
  console.log('🧪 Testing Evo GO API - Connect Instance');
  console.log('━'.repeat(60));
  console.log(`📍 API Base URL: ${baseUrl}`);
  console.log(`📦 Instance ID: ${instanceId}`);
  console.log();

  const possiblePayloads = [
    { instance: instanceId },
    { instanceId: instanceId },
    { id: instanceId },
    { instance_id: instanceId },
  ];

  for (const payload of possiblePayloads) {
    console.log(`\n📤 Trying payload:`, JSON.stringify(payload));
    console.log('─'.repeat(60));

    try {
      const response = await fetch(`${baseUrl}/instance/connect`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        console.log('   Response:');
        if (json.data?.qrcode) {
          console.log(`   ✅ QR Code found! (${json.data.qrcode.length} chars)`);
          console.log('   Instance:', json.data);
        } else if (json.error) {
          console.log(`   Error: ${json.error}`);
        } else {
          console.log(JSON.stringify(json, null, 2));
        }
      } catch {
        console.log(`   Response: ${text.substring(0, 150)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

testConnectInstance();
