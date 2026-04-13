/**
 * Test Evo GO API - Create Instance with Unique Token
 * Usage: npx ts-node scripts/test-evo-go-create-unique.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.EVO_GO_API_KEY;
const baseUrl = process.env.EVOGO_API_URL || 'https://evogo.renatop.com.br';

if (!apiKey) {
  console.error('❌ EVO_GO_API_KEY not set in .env.local');
  process.exit(1);
}

async function testCreateInstanceWithUniqueToken() {
  console.log('🧪 Testing Evo GO API - Create Instance with Unique Token');
  console.log('━'.repeat(50));
  console.log(`📍 API Base URL: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log();

  const tenantId = 'test-tenant-' + Date.now();
  const uniqueToken = randomUUID(); // Generate unique UUID for token field

  const requestBody = {
    name: `kanban-instance-${tenantId.substring(0, 8)}`,
    token: uniqueToken, // Use unique token instead of API key
  };

  console.log('📤 Request Details:');
  console.log(`   URL: POST ${baseUrl}/instance/create`);
  console.log(`   Headers: { apikey: ${apiKey.substring(0, 20)}..., Content-Type: application/json }`);
  console.log(`   Body:`, JSON.stringify(requestBody, null, 2));
  console.log();

  try {
    const response = await fetch(`${baseUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);

    const text = await response.text();
    console.log(`\n📄 Response Body (${text.length} bytes):`);
    console.log('━'.repeat(50));

    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log(JSON.stringify(json, null, 2));

      if (json.data?.qrcode) {
        console.log('\n✅ QR Code received!');
        console.log(`   Instance ID: ${json.data.id}`);
        console.log(`   QR Code length: ${json.data.qrcode.length} characters`);
      }
    } catch {
      // If not JSON, just print raw
      console.log(text);
    }

    console.log('━'.repeat(50));
    console.log();

    if (response.ok) {
      console.log('✅ SUCCESS - Instance created with unique token');
    } else {
      console.log(`⚠️  ERROR - HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('❌ FETCH ERROR:', error);
  }
}

testCreateInstanceWithUniqueToken();
