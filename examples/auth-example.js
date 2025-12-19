// Contoh penggunaan auth dengan berbagai cara

const { auth, createClient } = require('nvrch');

// Cara 1: API Key langsung dari string
console.log('🔐 Cara 1: API Key string langsung');
const client1 = auth('NvxReactChannel2');
console.log('Client 1 created');
console.log('Config:', client1.getConfig());
console.log();

// Cara 2: API Key dari environment variable
console.log('🌍 Cara 2: API Key dari environment');
const API_KEY = process.env.NVRCH_API_KEY || 'NvxReactChannel2';
const client2 = auth(API_KEY);
console.log('Client 2 created with API Key from env');
console.log();

// Cara 3: Menggunakan config object
console.log('⚙️  Cara 3: Config object lengkap');
const client3 = auth({
  apiKey: 'NvxReactChannel2',
  timeout: 15000, // 15 detik timeout
  delay: 2000     // 2 detik delay untuk batch
});
console.log('Client 3 created with full config');
console.log('Config:', client3.getConfig());
console.log();

// Cara 4: createClient (alias dari auth)
console.log('🏭 Cara 4: Menggunakan createClient()');
const client4 = createClient('NvxReactChannel2');
console.log('Client 4 created with createClient()');
console.log();

// Update config dinamis
console.log('🔄 Update config dinamis');
console.log('Config sebelum update:', client1.getConfig());
client1.setConfig({ timeout: 25000 });
console.log('Config setelah update timeout:', client1.getConfig());
console.log();

// Contoh penggunaan dengan berbagai skenario
const testUrl = 'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178';

async function testAllClients() {
  console.log('🧪 Testing all clients...\n');
  
  const clients = [
    { name: 'Client 1 (String API Key)', client: client1 },
    { name: 'Client 2 (Env API Key)', client: client2 },
    { name: 'Client 3 (Config Object)', client: client3 },
    { name: 'Client 4 (createClient)', client: client4 }
  ];
  
  for (const { name, client } of clients) {
    console.log(`Testing ${name}...`);
    
    try {
      // Coba kirim reaksi (dikomentari untuk keamanan)
      // const result = await client.sendReaction(testUrl, '👍');
      // console.log(`  ✅ ${name}: Success - ${result.message}`);
      console.log(`  ⚠️  ${name}: Skipped actual API call for demo`);
      
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
    }
    
    console.log(`  Config:`, client.getConfig());
    console.log();
  }
}

testAllClients().catch(console.error);
