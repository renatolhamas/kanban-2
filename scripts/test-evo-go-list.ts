/**
 * Test Evo GO API - List all instances
 * Usage: npx ts-node scripts/test-evo-go-list.ts
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

async function testListInstances() {
  console.log('🧪 Testing Evo GO API - List Instances');
  console.log('━'.repeat(50));
  console.log(`📍 API Base URL: ${baseUrl}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log();

  try {
    console.log('📤 Sending request to: GET /instance/all');
    const response = await fetch(`${baseUrl}/instance/all`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
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
      console.log('✅ SUCCESS - API is responding correctly');
    } else {
      console.log(`⚠️  ERROR - HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('❌ FETCH ERROR:', error);
  }
}

testListInstances();
