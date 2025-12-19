// Contoh penggunaan package nvrch dengan auth system

const { auth, createClient, validateUrl, getPackageInfo } = require('nvrch2');

// API Key (dari environment variable atau config)
const API_KEY = process.env.NVRCH_API_KEY || 'NvxReactChannel2';

async function main() {
  console.log('🚀 Contoh Penggunaan NVRCH dengan Auth System\n');
  
  // 1. Tampilkan info package
  console.log('📦 Package Info:');
  const info = getPackageInfo();
  console.log(info);
  console.log();
  
  // 2. Validasi URL
  console.log('🔗 Validasi URL:');
  const testUrl = 'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178';
  console.log(`URL: ${testUrl}`);
  console.log(`Valid: ${validateUrl(testUrl) ? '✅' : '❌'}`);
  console.log();
  
  // 3. Menggunakan auth() function (cara seperti Google APIs)
  console.log('🔐 Contoh 1: Menggunakan auth() function');
  const client1 = auth(API_KEY);
  
  try {
    const result = await client1.sendReaction(
      testUrl,
      ['👍', '❤️', '🔥'],
      { timeout: 15000 }
    );
    
    console.log('✅ Berhasil dengan auth()!');
    console.log('Pesan:', result.message);
    console.log('Bot:', result.data?.botResponse);
    console.log('Config:', client1.getConfig());
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.status) {
      console.log('Status:', error.status);
    }
  }
  console.log();
  
  // 4. Menggunakan createClient() function
  console.log('👤 Contoh 2: Menggunakan createClient() dengan config object');
  const client2 = createClient({
    apiKey: API_KEY,
    timeout: 20000,
    delay: 2000
  });
  
  try {
    // Kirim single reaction
    const result = await client2.sendReaction(
      testUrl,
      '🎉,🤩',
      { timeout: 10000 }
    );
    
    console.log('✅ Berhasil dengan createClient()!');
    console.log('Message:', result.message);
    
    // Update config
    console.log('Config sebelum update:', client2.getConfig());
    client2.setConfig({ timeout: 25000 });
    console.log('Config setelah update:', client2.getConfig());
    
  } catch (error) {
    console.log('❌ Error dengan createClient():', error.message);
  }
  console.log();
  
  // 5. Batch reactions
  console.log('🚀 Contoh 3: Batch Reactions');
  const reactions = [
    {
      url: testUrl,
      emojis: '👍'
    },
    {
      url: testUrl,
      emojis: ['❤️', '🔥']
    },
    {
      url: testUrl,
      emojis: '🎉'
    }
  ];
  
  const batchClient = auth({
    apiKey: API_KEY,
    delay: 1000
  });
  
  try {
    const results = await batchClient.sendBatchReactions(reactions, {
      delay: 1500
    });
    
    console.log(`📊 Hasil Batch (${results.length} reactions):`);
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ${index + 1}. ✅ Success: ${result.data.message}`);
      } else {
        console.log(`  ${index + 1}. ❌ Failed: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.log('❌ Batch error:', error.message);
  }
  console.log();
  
  // 6. Menggunakan class langsung
  console.log('🏗️  Contoh 4: Menggunakan NVRCH class langsung');
  const { NVRCH } = require('nvrch');
  
  const directClient = new NVRCH(API_KEY);
  
  try {
    const result = await directClient.sendReaction(testUrl, '⚡');
    console.log('✅ Berhasil dengan class langsung!');
    console.log('Bot:', result.data?.botResponse);
    
  } catch (error) {
    console.log('❌ Error dengan class langsung:', error.message);
  }
}

// Handle error
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
