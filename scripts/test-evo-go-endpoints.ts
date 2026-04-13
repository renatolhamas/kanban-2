/**
 * Explore Evo GO API - Discover available endpoints
 * Usage: npx ts-node scripts/test-evo-go-endpoints.ts
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

// Common endpoint patterns for API management
const endpointsToTry = [
  // Documentation
  { path: '/docs', method: 'GET', desc: 'Swagger/OpenAPI docs' },
  { path: '/api-docs', method: 'GET', desc: 'API docs' },
  { path: '/swagger', method: 'GET', desc: 'Swagger UI' },
  { path: '/redoc', method: 'GET', desc: 'ReDoc documentation' },

  // Status/Health
  { path: '/health', method: 'GET', desc: 'Health check' },
  { path: '/status', method: 'GET', desc: 'Server status' },

  // Instance management
  { path: '/instance', method: 'GET', desc: 'List instances (alternative)' },
  { path: '/instance/all', method: 'GET', desc: 'List all instances' },
  { path: '/instance/connect', method: 'POST', desc: 'Connect instance' },
  { path: '/instance/start', method: 'POST', desc: 'Start instance' },
  { path: '/instance/qrcode', method: 'GET', desc: 'Get QR code (general)' },

  // Webhook management
  { path: '/webhook', method: 'GET', desc: 'List webhooks' },
  { path: '/webhook/register', method: 'POST', desc: 'Register webhook' },

  // Message API
  { path: '/message/send', method: 'POST', desc: 'Send message' },
];

async function testEndpoint(endpoint: string, method: string, description: string) {
  try {
    const url = `${baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Check if endpoint exists (not 404)
    if (response.status === 404) {
      return null; // Endpoint doesn't exist
    }

    return {
      endpoint,
      method,
      description,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return null;
  }
}

async function exploreAPI() {
  console.log('🔍 Evo GO API Endpoint Discovery');
  console.log('━'.repeat(60));
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log();

  const validEndpoints: any[] = [];

  // Test all endpoints in parallel
  const results = await Promise.all(
    endpointsToTry.map(({ path: p, method: m, desc }) => testEndpoint(p, m, desc))
  );

  // Collect valid endpoints
  results.forEach((result) => {
    if (result) {
      validEndpoints.push(result);
    }
  });

  if (validEndpoints.length === 0) {
    console.log('⚠️  No additional endpoints found');
    console.log('\n💡 The API might not expose documentation endpoints');
  } else {
    console.log(`✅ Found ${validEndpoints.length} valid endpoints:\n`);
    validEndpoints.forEach((ep) => {
      console.log(`   ${ep.method.padEnd(6)} ${ep.endpoint.padEnd(25)} - ${ep.description}`);
      console.log(`           Status: ${ep.status} ${ep.statusText}`);
    });
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n📋 Known endpoints (from Evo GO docs):');
  console.log('   POST   /instance/create          - Create new instance');
  console.log('   GET    /instance/all             - List all instances');
  console.log('   (More endpoints likely exist - check Evo GO dashboard)');
}

exploreAPI();
