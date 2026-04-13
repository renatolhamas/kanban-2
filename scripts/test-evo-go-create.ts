/**
 * Test Evo GO API - Create Instance
 * Usage: npx ts-node scripts/test-evo-go-create.ts
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

async function testCreateInstance() {
  console.log('🧪 Testing Evo GO API - Create Instance');
  console.log('━'.repeat(50));
  console.log(`📍 API Base URL: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log();

  const tenantId = 'test-tenant-' + Date.now();
  const requestBody = {
    name: `kanban-instance-${tenantId.substring(0, 8)}`,
    token: apiKey, // Using API key as token (as per current implementation)
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
    } catch {
      // If not JSON, just print raw
      console.log(text);
    }

    console.log('━'.repeat(50));
    console.log();

    if (response.ok) {
      console.log('✅ SUCCESS - Instance created');
    } else {
      console.log(`⚠️  ERROR - HTTP ${response.status}`);
      console.log('💡 NEXT STEPS:');
      console.log('   1. Check if Evo GO server is running');
      console.log('   2. Verify API key is correct in .env.local');
      console.log('   3. Check if the API expects different request format');
    }
  } catch (error) {
    console.error('❌ FETCH ERROR:', error);
  }
}

testCreateInstance();
