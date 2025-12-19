// Contoh TypeScript usage
import { auth, createClient, validateUrl, getPackageInfo, NVRCH } from 'nvrch';

// API Key dari environment
const API_KEY = process.env.NVRCH_API_KEY || 'your-api-key';

async function runExamples() {
  console.log('TypeScript Examples for NVRCH Package\n');
  
  // Example 1: Using auth() function
  console.log('1. Using auth() function:');
  const client1 = auth(API_KEY);
  
  try {
    const result = await client1.sendReaction(
      'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178',
      ['👍', '❤️']
    );
    
    console.log('✅ Success:', result.message);
    console.log('Bot:', result.data.botResponse);
    
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }
  
  // Example 2: Using createClient() with config
  console.log('\n2. Using createClient() with config:');
  const client2 = createClient({
    apiKey: API_KEY,
    timeout: 20000,
    delay: 1000
  });
  
  // Validate URL
  const url = 'https://whatsapp.com/channel/abc123/456';
  const isValid = validateUrl(url);
  console.log(`URL "${url}" is valid: ${isValid}`);
  
  // Example 3: Batch reactions with proper typing
  console.log('\n3. Batch reactions:');
  const reactions = [
    {
      url: 'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178',
      emojis: '👍'
    },
    {
      url: 'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/179',
      emojis: ['❤️', '🔥']
    }
  ];
  
  try {
    const results = await client2.sendBatchReactions(reactions, {
      delay: 2000
    });
    
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ${index + 1}. ✅ Success`);
      } else {
        console.log(`  ${index + 1}. ❌ Failed: ${result.error}`);
      }
    });
    
  } catch (error: any) {
    console.log('❌ Batch error:', error.message);
  }
  
  // Example 4: Direct class usage
  console.log('\n4. Direct class usage:');
  const directClient = new NVRCH(API_KEY);
  
  // Get config
  const config = directClient.getConfig();
  console.log('Client config:', config);
}

// Run examples
runExamples().catch(console.error);
