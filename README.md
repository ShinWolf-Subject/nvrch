<div align="center">

<p><strong>nvch-reactor</strong></p>

<img src="https://res.cloudinary.com/dxaiqnppk/image/upload/v1766089205/20251219_012542_ua7sti.png" width="300" alt="Cover Banner" />

</div>

---

Kirim reaction ke saluran WhatsApp sebanyak 1.2k+ dengan mudah menggunakan NvRCH2

## 📦 Instalasi

```bash
npm install nvch-reactor
```

## 🚀 Quick Start

### Menggunakan fungsi `auth()` (Rekomendasi)

```javascript
const { auth } = require('nvch-reactor');

// Inisialisasi client dengan API Key
const client = auth('your-api-key');

async function sendReaction() {
  try {
    const result = await client.sendReaction(
      'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178',
      '👍,❤️,🔥'
    );
    
    console.log('✅ Berhasil:', result.message);
    console.log('🤖 Bot:', result.data.botResponse);
    console.log('🎭 Emoji dikirim:', result.details.reacts);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.status) console.log('Status:', error.status);
  }
}

sendReaction();
```

## 📚 Contoh Penggunaan Lanjutan

<details>
<summary><strong>🔧 Menggunakan createClient() dengan Konfigurasi Lengkap</strong></summary>

```javascript
const { createClient } = require('nvch-reactor');

// Dengan konfigurasi lengkap
const client = createClient({
  apiKey: 'your-api-key',
  timeout: 20000, // 20 detik
  delay: 1000     // 1 detik untuk batch
});

// Kirim reaksi dengan timeout custom
await client.sendReaction(
  'https://whatsapp.com/channel/CHANNEL_ID/POST_ID',
  ['🎉', '🤩'],
  { timeout: 15000 }
);
```
</details>

<details>
<summary><strong>🔄 Batch Reactions - Kirim Multiple Reactions Sekaligus</strong></summary>

```javascript
const { auth } = require('nvch-reactor');

const client = auth('your-api-key');

const reactions = [
  {
    url: 'https://whatsapp.com/channel/CHANNEL_ID/178',
    emojis: '👍'
  },
  {
    url: 'https://whatsapp.com/channel/CHANNEL_ID/179',
    emojis: ['❤️', '🔥']
  },
  {
    url: 'https://whatsapp.com/channel/CHANNEL_ID/180',
    emojis: '🎉,🤩'
  }
];

async function sendBatch() {
  try {
    const results = await client.sendBatchReactions(reactions, {
      delay: 2000,    // Delay 2 detik antar request
      timeout: 30000  // Timeout per request
    });
    
    console.log(`📊 Total: ${results.length} reactions`);
    
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`✅ ${index + 1}. Success: ${result.data.message}`);
      } else {
        console.log(`❌ ${index + 1}. Failed: ${result.error}`);
      }
    });
    
  } catch (error) {
    console.error('Batch error:', error.message);
  }
}

sendBatch();
```
</details>

<details>
<summary><strong>🛠️ Menggunakan Class NVRCH Langsung</strong></summary>

```javascript
const { NVRCH } = require('nvch-reactor');

// Instantiasi langsung
const client = new NVRCH('your-api-key');

// Dapatkan konfigurasi
console.log('Config:', client.getConfig());

// Update konfigurasi dinamis
client.setConfig({ timeout: 25000 });

// Validasi URL
const isValid = client.validateUrl('https://whatsapp.com/channel/...');
console.log('URL valid?', isValid);
```
</details>

<details>
<summary><strong>🔗 Validasi URL WhatsApp Channel</strong></summary>

```javascript
const { validateUrl } = require('nvch-reactor');

const urls = [
  'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178',  // ✅ Valid
  'https://invalid-url.com/test',                               // ❌ Invalid
  'https://whatsapp.com/not-channel/123'                        // ❌ Invalid
];

urls.forEach(url => {
  const isValid = validateUrl(url);
  console.log(`${isValid ? '✅' : '❌'} ${url}`);
});
```
</details>

<details>
<summary><strong>🔁 Error Handling & Auto Retry</strong></summary>

```javascript
const { auth } = require('nvch-reactor');

async function sendReactionWithRetry(url, emojis, retries = 3) {
  const client = auth('your-api-key');
  
  for (let i = 0; i < retries; i++) {
    try {
      const result = await client.sendReaction(url, emojis, { timeout: 15000 });
      return { success: true, attempt: i + 1, data: result };
      
    } catch (error) {
      console.log(`❌ Attempt ${i + 1} failed: ${error.message}`);
      
      // Jangan retry untuk error tertentu
      if (error.message.includes('tidak valid') || error.status === 401) {
        return { success: false, error: error.message, final: true };
      }
      
      // Exponential backoff delay
      if (i < retries - 1) {
        const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return { success: false, error: 'Semua percobaan gagal' };
}

// Contoh penggunaan
(async () => {
  const result = await sendReactionWithRetry(
    'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178',
    '👍'
  );
  
  console.log(result.success ? '✅ Berhasil' : '❌ Gagal');
  if (result.data) console.log('Data:', result.data);
})();
```
</details>

<details>
<summary><strong>📊 Monitoring & Logging System</strong></summary>

```javascript
const { auth, getPackageInfo } = require('nvch-reactor');
const fs = require('fs').promises;

class ReactionLogger {
  constructor(apiKey, logFile = 'reactions.log') {
    this.client = auth(apiKey);
    this.logFile = logFile;
  }
  
  async sendAndLog(url, emojis) {
    const startTime = Date.now();
    
    try {
      const result = await this.client.sendReaction(url, emojis);
      const duration = Date.now() - startTime;
      
      await this.log({
        timestamp: new Date().toISOString(),
        status: 'success',
        url,
        emojis,
        duration: `${duration}ms`,
        message: result.message
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await this.log({
        timestamp: new Date().toISOString(),
        status: 'error',
        url,
        emojis,
        duration: `${duration}ms`,
        error: error.message,
        statusCode: error.status
      });
      
      throw error;
    }
  }
  
  async log(data) {
    const logEntry = JSON.stringify(data) + '\n';
    await fs.appendFile(this.logFile, logEntry, 'utf8');
    console.log('📝 Logged:', data);
  }
  
  async getStats() {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const logs = content.trim().split('\n').map(line => JSON.parse(line));
      
      return {
        total: logs.length,
        success: logs.filter(l => l.status === 'success').length,
        failed: logs.filter(l => l.status === 'error').length,
        avgDuration: logs.reduce((sum, l) => sum + parseInt(l.duration), 0) / logs.length
      };
    } catch (error) {
      return { error: 'Log file not found' };
    }
  }
}

// Penggunaan
(async () => {
  const logger = new ReactionLogger('your-api-key');
  
  await logger.sendAndLog(
    'https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178',
    '🚀,💯'
  );
  
  const stats = await logger.getStats();
  console.log('📈 Stats:', stats);
})();
```
</details>

<details>
<summary><strong>🎯 Advanced Configuration & Factory Pattern</strong></summary>

```javascript
const { createClient, getPackageInfo } = require('nvch-reactor');

// Factory pattern untuk multiple clients
function createReactionClient(config) {
  const client = createClient(config);
  
  return {
    // Wrapper sederhana
    send: (url, emojis) => client.sendReaction(url, emojis),
    validate: (url) => client.validateUrl(url),
    
    // Informasi client
    getStats: () => ({
      config: client.getConfig(),
      apiInfo: getPackageInfo()
    }),
    
    // Batch dengan auto-retry dan better error handling
    async sendBatchWithRetry(reactions, options = {}) {
      const maxRetries = options.maxRetries || 3;
      const results = [];
      
      for (const [index, reaction] of reactions.entries()) {
        let lastError;
        let success = false;
        
        console.log(`🔄 Processing ${index + 1}/${reactions.length}`);
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            const result = await client.sendReaction(
              reaction.url,
              reaction.emojis,
              { timeout: options.timeout || 20000 }
            );
            
            results.push({ 
              ...reaction, 
              success: true, 
              data: result,
              attempts: attempt + 1 
            });
            
            success = true;
            break;
            
          } catch (error) {
            lastError = error;
            console.log(`  ⚠️  Attempt ${attempt + 1} failed: ${error.message}`);
            
            // Jangan retry untuk error yang tidak bisa diperbaiki
            if (error.status === 401 || error.status === 403) {
              break;
            }
            
            if (attempt < maxRetries - 1) {
              const backoff = 1000 * Math.pow(2, attempt);
              await new Promise(resolve => setTimeout(resolve, backoff));
            }
          }
        }
        
        if (!success) {
          results.push({ 
            ...reaction, 
            success: false, 
            error: lastError?.message || 'Unknown error',
            statusCode: lastError?.status 
          });
        }
        
        // Delay antar request dalam batch
        if (options.delay && index < reactions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
      }
      
      return results;
    }
  };
}

// Penggunaan
(async () => {
  const advancedClient = createReactionClient({
    apiKey: 'your-api-key',
    timeout: 30000
  });
  
  const results = await advancedClient.sendBatchWithRetry(
    [
      { url: 'https://whatsapp.com/channel/.../178', emojis: '👍' },
      { url: 'https://whatsapp.com/channel/.../179', emojis: '❤️,🔥' }
    ],
    { delay: 1000, maxRetries: 2 }
  );
  
  console.log('\n📊 Summary:');
  console.log(`✅ Success: ${results.filter(r => r.success).length}`);
  console.log(`❌ Failed: ${results.filter(r => !r.success).length}`);
})();
```
</details>

<details>
<summary><strong>🌐 Integrasi dengan Express.js REST API</strong></summary>

```javascript
const express = require('express');
const { auth, validateUrl } = require('nvch-reactor');

const app = express();
app.use(express.json());

// Middleware untuk validasi API Key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false,
      error: 'API Key diperlukan. Gunakan header X-API-Key atau query parameter apiKey' 
    });
  }
  
  try {
    req.reactionClient = auth(apiKey);
    next();
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'API Key tidak valid' 
    });
  }
};

// Middleware untuk validasi request body
const validateReactionRequest = (req, res, next) => {
  const { url, emojis } = req.body;
  
  if (!url || !emojis) {
    return res.status(400).json({
      success: false,
      error: 'Field "url" dan "emojis" wajib diisi'
    });
  }
  
  if (!validateUrl(url)) {
    return res.status(400).json({
      success: false,
      error: 'Format URL tidak valid. Gunakan format: https://whatsapp.com/channel/{CHANNEL_ID}/{POST_ID}'
    });
  }
  
  next();
};

// Route: Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Route: Kirim reaksi tunggal
app.post('/api/send', validateApiKey, validateReactionRequest, async (req, res) => {
  try {
    const { url, emojis, timeout } = req.body;
    
    const result = await req.reactionClient.sendReaction(
      url, 
      emojis,
      timeout ? { timeout } : undefined
    );
    
    res.json({
      success: true,
      message: 'Reaksi berhasil dikirim',
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
      statusCode: error.status,
      timestamp: new Date().toISOString()
    });
  }
});

// Route: Batch reactions
app.post('/api/batch', validateApiKey, async (req, res) => {
  try {
    const { reactions, delay = 1000, timeout } = req.body;
    
    if (!Array.isArray(reactions) || reactions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Field "reactions" harus berupa array yang tidak kosong'
      });
    }
    
    // Validasi setiap reaction
    for (const reaction of reactions) {
      if (!reaction.url || !reaction.emojis) {
        return res.status(400).json({
          success: false,
          error: 'Setiap reaction harus memiliki "url" dan "emojis"'
        });
      }
    }
    
    const results = await req.reactionClient.sendBatchReactions(
      reactions, 
      { delay, timeout }
    );
    
    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
    
    res.json({
      success: true,
      message: 'Batch reactions selesai',
      summary,
      data: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route: Validasi URL
app.post('/api/validate', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'Field "url" wajib diisi'
    });
  }
  
  const isValid = validateUrl(url);
  
  res.json({
    success: true,
    valid: isValid,
    url,
    message: isValid ? 'URL valid' : 'URL tidak valid'
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📖 API Documentation:`);
  console.log(`   GET  /api/health         - Health check`);
  console.log(`   POST /api/send           - Kirim reaksi tunggal`);
  console.log(`   POST /api/batch          - Batch reactions`);
  console.log(`   POST /api/validate       - Validasi URL`);
});
```

**Contoh Request dengan cURL:**

```bash
# Kirim reaksi tunggal
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "url": "https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178",
    "emojis": "👍,❤️"
  }'

# Batch reactions
curl -X POST http://localhost:3000/api/batch \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "reactions": [
      {"url": "https://whatsapp.com/channel/.../178", "emojis": "👍"},
      {"url": "https://whatsapp.com/channel/.../179", "emojis": "❤️"}
    ],
    "delay": 1000
  }'
```
</details>

<details>
<summary><strong>📝 Unit Testing dengan Jest</strong></summary>

```javascript
// test/nvch-reactor.test.js
const nvchReactor = require('nvch-reactor');

// Mock module
jest.mock('nvch-reactor');

describe('NVCH Reactor Tests', () => {
  let mockClient;
  
  beforeEach(() => {
    // Setup mock client
    mockClient = {
      sendReaction: jest.fn(),
      sendBatchReactions: jest.fn(),
      validateUrl: jest.fn(),
      getConfig: jest.fn()
    };
    
    nvchReactor.auth.mockReturnValue(mockClient);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('auth() should create client instance', () => {
    const client = nvchReactor.auth('test-api-key');
    expect(nvchReactor.auth).toHaveBeenCalledWith('test-api-key');
    expect(client).toBeDefined();
  });
  
  test('sendReaction() should send reaction successfully', async () => {
    mockClient.sendReaction.mockResolvedValue({
      success: true,
      message: 'Reaction sent successfully',
      data: { botResponse: 'Success' },
      details: { reacts: '👍' }
    });
    
    const result = await mockClient.sendReaction(
      'https://whatsapp.com/channel/test/123',
      '👍'
    );
    
    expect(result.success).toBe(true);
    expect(result.data.botResponse).toBe('Success');
    expect(mockClient.sendReaction).toHaveBeenCalledWith(
      'https://whatsapp.com/channel/test/123',
      '👍'
    );
  });
  
  test('sendReaction() should handle errors', async () => {
    mockClient.sendReaction.mockRejectedValue(
      new Error('API request failed')
    );
    
    await expect(
      mockClient.sendReaction('invalid-url', '👍')
    ).rejects.toThrow('API request failed');
  });
  
  test('sendBatchReactions() should process multiple reactions', async () => {
    mockClient.sendBatchReactions.mockResolvedValue([
      { success: true, data: { message: 'Success 1' } },
      { success: true, data: { message: 'Success 2' } },
      { success: false, error: 'Failed' }
    ]);
    
    const reactions = [
      { url: 'https://whatsapp.com/channel/test/1', emojis: '👍' },
      { url: 'https://whatsapp.com/channel/test/2', emojis: '❤️' },
      { url: 'https://whatsapp.com/channel/test/3', emojis: '🔥' }
    ];
    
    const results = await mockClient.sendBatchReactions(reactions);
    
    expect(results).toHaveLength(3);
    expect(results.filter(r => r.success)).toHaveLength(2);
    expect(results.filter(r => !r.success)).toHaveLength(1);
  });
  
  test('validateUrl() should validate URL format', () => {
    nvchReactor.validateUrl.mockImplementation((url) => {
      return url.includes('whatsapp.com/channel/');
    });
    
    expect(nvchReactor.validateUrl('https://whatsapp.com/channel/test/123')).toBe(true);
    expect(nvchReactor.validateUrl('https://invalid.com/test')).toBe(false);
  });
});
```

**Jalankan test:**
```bash
npm test
```
</details>

<details>
<summary><strong>⚡ Rate Limiting & Queue Management</strong></summary>

```javascript
const { auth } = require('nvch-reactor');

class RateLimitedClient {
  constructor(apiKey, requestsPerMinute = 30) {
    this.client = auth(apiKey);
    this.requestsPerMinute = requestsPerMinute;
    this.queue = [];
    this.processing = false;
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000;
  }
  
  async addToQueue(url, emojis) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, emojis, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      // Reset counter jika sudah 1 menit
      if (Date.now() >= this.resetTime) {
        this.requestCount = 0;
        this.resetTime = Date.now() + 60000;
      }
      
      // Tunggu jika sudah mencapai limit
      if (this.requestCount >= this.requestsPerMinute) {
        const waitTime = this.resetTime - Date.now();
        console.log(`⏳ Rate limit reached. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.resetTime = Date.now() + 60000;
      }
      
      const task = this.queue.shift();
      
      try {
        const result = await this.client.sendReaction(task.url, task.emojis);
        this.requestCount++;
        task.resolve(result);
      } catch (error) {
        task.reject(error);
      }
      
      // Delay kecil antar request
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processing = false;
  }
  
  getStats() {
    return {
      queueLength: this.queue.length,
      requestCount: this.requestCount,
      limit: this.requestsPerMinute,
      resetIn: Math.max(0, this.resetTime - Date.now())
    };
  }
}

// Penggunaan
(async () => {
  const rateLimitedClient = new RateLimitedClient('your-api-key', 30);
  
  // Kirim banyak request sekaligus
  const promises = [];
  for (let i = 1; i <= 50; i++) {
    promises.push(
      rateLimitedClient.addToQueue(
        `https://whatsapp.com/channel/test/${i}`,
        '👍'
      )
    );
  }
  
  // Monitor progress
  const interval = setInterval(() => {
    const stats = rateLimitedClient.getStats();
    console.log(`📊 Queue: ${stats.queueLength}, Sent: ${stats.requestCount}/${stats.limit}`);
    
    if (stats.queueLength === 0 && stats.requestCount > 0) {
      clearInterval(interval);
    }
  }, 1000);
  
  await Promise.all(promises);
  console.log('✅ Semua request selesai!');
})();
```
</details>

## 📖 API Reference

### Methods

#### `auth(apiKey)`
Membuat client instance dengan API Key.

**Parameters:**
- `apiKey` (string) - API Key untuk autentikasi

**Returns:** Client instance dengan methods lengkap

---

#### `createClient(config)`
Membuat client dengan konfigurasi lengkap.

**Parameters:**
- `config` (object)
  - `apiKey` (string) - API Key
  - `timeout` (number, optional) - Request timeout dalam ms (default: 20000)
  - `delay` (number, optional) - Delay untuk batch requests dalam ms (default: 1000)

**Returns:** Client instance

---

#### `client.sendReaction(url, emojis, options)`
Mengirim reaksi tunggal ke post WhatsApp Channel.

**Parameters:**
- `url` (string) - URL WhatsApp Channel post
- `emojis` (string | array) - Emoji atau array emoji untuk dikirim
- `options` (object, optional)
  - `timeout` (number) - Custom timeout untuk request ini

**Returns:** Promise dengan result object

**Example:**
```javascript
await client.sendReaction(
  'https://whatsapp.com/channel/ID/POST',
  '👍,❤️'
);
```

---

#### `client.sendBatchReactions(reactions, options)`
Mengirim multiple reactions sekaligus.

**Parameters:**
- `reactions` (array) - Array of reaction objects
  - `url` (string) - WhatsApp Channel URL
  - `emojis` (string | array) - Emoji untuk dikirim
- `options` (object, optional)
  - `delay` (number) - Delay antar request dalam ms
  - `timeout` (number) - Timeout per request dalam ms

**Returns:** Promise dengan array of results

---

#### `validateUrl(url)`
Validasi format URL WhatsApp Channel.

**Parameters:**
- `url` (string) - URL untuk divalidasi

**Returns:** Boolean (true jika valid)

---

#### `getPackageInfo()`
Mendapatkan informasi package NVCH Reactor.

**Returns:** Object dengan name dan version

---

#### `client.getConfig()`
Mendapatkan konfigurasi client saat ini.

**Returns:** Object konfigurasi

---

#### `client.setConfig(config)`
Update konfigurasi client.

**Parameters:**
- `config` (object) - Konfigurasi baru (partial update)

## 🔗 Format URL yang Valid

```
https://whatsapp.com/channel/{CHANNEL_ID}/{POST_ID}
```

**Contoh:**
```
https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178
```

## 🎯 Format Emoji

Emoji dapat dikirim dalam berbagai format:

```javascript
// String dengan comma separator
'👍,❤️,🔥'

// Array of strings
['👍', '❤️', '🔥']

// Single emoji
'👍'
```

## ⚠️ Error Handling

Library ini akan throw error dalam kondisi berikut:

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| Invalid URL | - | Format URL tidak sesuai |
| API Error | 4xx/5xx | Error dari API server |
| Timeout | - | Request melebihi timeout |
| Network Error | - | Masalah koneksi jaringan |

**Best Practice:**
```javascript
try {
  const result = await client.sendReaction(url, emojis);
  // Handle success
} catch (error) {
  if (error.status === 401) {
    console.error('API Key tidak valid');
  } else if (error.message.includes('timeout')) {
    console.error('Request timeout, coba lagi');
  } else {
    console.error('Error:', error.message);
  }
}
```

## 🔒 Keamanan

- ⚠️ **Jangan** commit API Key ke repository
- ✅ Gunakan environment variables untuk menyimpan API Key
- ✅ Gunakan `.env` file untuk development
- ✅ Implementasi rate limiting untuk production

**Contoh menggunakan environment variables:**

```javascript
// .env
NVCH_REACTOR_API_KEY=your-api-key-here

// app.js
require('dotenv').config();
const { auth } = require('nvch-reactor');

const client = auth(process.env.NVCH_REACTOR_API_KEY);
```

## 💡 Tips & Best Practices

### 1. **Gunakan Batch untuk Multiple Requests**
Lebih efisien menggunakan `sendBatchReactions()` daripada multiple `sendReaction()` calls.

```javascript
// ❌ Tidak efisien
for (const url of urls) {
  await client.sendReaction(url, '👍');
}

// ✅ Lebih baik
await client.sendBatchReactions(
  urls.map(url => ({ url, emojis: '👍' })),
  { delay: 1000 }
);
```

### 2. **Implementasi Retry Logic**
Selalu implement retry untuk handling network issues atau temporary failures.

### 3. **Set Timeout yang Reasonable**
Default timeout adalah 20 detik, sesuaikan dengan kebutuhan:
- Fast operations: 10-15 detik
- Batch operations: 30-60 detik

### 4. **Monitor & Log**
Implement logging untuk tracking success/failure rate dan debugging.

### 5. **Rate Limiting**
Hormati rate limits untuk menghindari API blocking.

## 📊 Response Format

### Success Response

```javascript
{
  success: true,
  message: "Reaction sent successfully",
  data: {
    botResponse: "...",
    // ... data lainnya
  },
  details: {
    reacts: "👍,❤️"
  }
}
```

### Error Response

```javascript
{
  success: false,
  message: "Error message",
  status: 400,
  error: "Detailed error information"
}
```

## 🎓 Use Cases

<details>
<summary><strong>📱 Bot WhatsApp Auto React</strong></summary>

```javascript
const { auth } = require('nvch-reactor');
const client = auth(process.env.API_KEY);

// Auto react ke semua post baru di channel
class AutoReactBot {
  constructor(channelId, emojis) {
    this.channelId = channelId;
    this.emojis = emojis;
    this.processedPosts = new Set();
  }
  
  async checkNewPosts() {
    // Implementasi untuk mendapatkan post terbaru
    // (ini contoh, sesuaikan dengan cara Anda mendapat post ID)
    const newPosts = await this.getNewPosts();
    
    for (const postId of newPosts) {
      if (!this.processedPosts.has(postId)) {
        try {
          const url = `https://whatsapp.com/channel/${this.channelId}/${postId}`;
          await client.sendReaction(url, this.emojis);
          this.processedPosts.add(postId);
          console.log(`✅ Reacted to post ${postId}`);
        } catch (error) {
          console.error(`❌ Failed to react to post ${postId}:`, error.message);
        }
      }
    }
  }
  
  start(intervalMinutes = 5) {
    console.log(`🤖 Bot started. Checking every ${intervalMinutes} minutes...`);
    this.checkNewPosts(); // Run immediately
    setInterval(() => this.checkNewPosts(), intervalMinutes * 60000);
  }
}

// Penggunaan
const bot = new AutoReactBot('0029VbAzDjIBFLgbEyadQb3y', '👍,❤️');
bot.start(5); // Check setiap 5 menit
```
</details>

<details>
<summary><strong>📈 Analytics & Reporting</strong></summary>

```javascript
const { auth } = require('nvch-reactor');
const fs = require('fs').promises;

class ReactionAnalytics {
  constructor(apiKey) {
    this.client = auth(apiKey);
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      byEmoji: {},
      byHour: Array(24).fill(0),
      errors: []
    };
  }
  
  async sendWithTracking(url, emojis) {
    const hour = new Date().getHours();
    const startTime = Date.now();
    
    try {
      const result = await this.client.sendReaction(url, emojis);
      
      this.stats.total++;
      this.stats.success++;
      this.stats.byHour[hour]++;
      
      // Track per emoji
      const emojiList = Array.isArray(emojis) ? emojis : emojis.split(',');
      emojiList.forEach(emoji => {
        this.stats.byEmoji[emoji.trim()] = (this.stats.byEmoji[emoji.trim()] || 0) + 1;
      });
      
      return { success: true, duration: Date.now() - startTime, data: result };
      
    } catch (error) {
      this.stats.total++;
      this.stats.failed++;
      this.stats.errors.push({
        timestamp: new Date().toISOString(),
        url,
        emojis,
        error: error.message
      });
      
      return { success: false, duration: Date.now() - startTime, error: error.message };
    }
  }
  
  getReport() {
    const successRate = ((this.stats.success / this.stats.total) * 100).toFixed(2);
    
    return {
      summary: {
        total: this.stats.total,
        success: this.stats.success,
        failed: this.stats.failed,
        successRate: `${successRate}%`
      },
      topEmojis: Object.entries(this.stats.byEmoji)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
      peakHours: this.stats.byHour
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
      recentErrors: this.stats.errors.slice(-5)
    };
  }
  
  async exportReport(filename = 'reaction-report.json') {
    const report = this.getReport();
    await fs.writeFile(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Report exported to ${filename}`);
  }
}

// Penggunaan
(async () => {
  const analytics = new ReactionAnalytics(process.env.API_KEY);
  
  // Send reactions dengan tracking
  await analytics.sendWithTracking('https://whatsapp.com/channel/.../178', '👍');
  await analytics.sendWithTracking('https://whatsapp.com/channel/.../179', '❤️');
  
  // Lihat report
  console.log('📊 Report:', analytics.getReport());
  
  // Export ke file
  await analytics.exportReport();
})();
```
</details>

<details>
<summary><strong>🔄 Scheduled Reactions (Cron Job)</strong></summary>

```javascript
const { auth } = require('nvrch2');
const cron = require('node-cron');

const client = auth(process.env.API_KEY);

// Konfigurasi scheduled reactions
const scheduledReactions = [
  {
    name: 'Morning Boost',
    cron: '0 8 * * *', // Setiap hari jam 8 pagi
    reactions: [
      { url: 'https://whatsapp.com/channel/.../178', emojis: '☀️,💪' },
      { url: 'https://whatsapp.com/channel/.../179', emojis: '🌅' }
    ]
  },
  {
    name: 'Evening Support',
    cron: '0 20 * * *', // Setiap hari jam 8 malam
    reactions: [
      { url: 'https://whatsapp.com/channel/.../180', emojis: '🌙,⭐' }
    ]
  }
];

// Setup cron jobs
scheduledReactions.forEach(schedule => {
  cron.schedule(schedule.cron, async () => {
    console.log(`⏰ Running: ${schedule.name}`);
    
    try {
      const results = await client.sendBatchReactions(schedule.reactions, {
        delay: 1000
      });
      
      const success = results.filter(r => r.success).length;
      console.log(`✅ ${schedule.name}: ${success}/${results.length} succeeded`);
      
    } catch (error) {
      console.error(`❌ ${schedule.name} failed:`, error.message);
    }
  });
  
  console.log(`📅 Scheduled: ${schedule.name} (${schedule.cron})`);
});

console.log('🚀 Scheduler started. Press Ctrl+C to stop.');
```

**Install dependencies:**
```bash
npm install node-cron
```
</details>

<details>
<summary><strong>🎮 Interactive CLI Tool</strong></summary>

```javascript
#!/usr/bin/env node
const { auth, validateUrl } = require('nvch-reactor');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, resolve);
});

async function main() {
  console.log('🚀 NVCH Reactor Interactive CLI\n');
  
  // Get API Key
  const apiKey = await question('Enter your API Key: ');
  
  if (!apiKey) {
    console.log('❌ API Key is required!');
    rl.close();
    return;
  }
  
  const client = auth(apiKey);
  console.log('✅ Client initialized\n');
  
  while (true) {
    console.log('\n📋 Options:');
    console.log('1. Send single reaction');
    console.log('2. Send batch reactions');
    console.log('3. Validate URL');
    console.log('4. Exit');
    
    const choice = await question('\nSelect option (1-4): ');
    
    switch (choice.trim()) {
      case '1': {
        const url = await question('Enter WhatsApp Channel URL: ');
        
        if (!validateUrl(url)) {
          console.log('❌ Invalid URL format!');
          break;
        }
        
        const emojis = await question('Enter emojis (comma-separated): ');
        
        try {
          console.log('⏳ Sending reaction...');
          const result = await client.sendReaction(url, emojis);
          console.log('✅ Success:', result.message);
        } catch (error) {
          console.log('❌ Error:', error.message);
        }
        break;
      }
      
      case '2': {
        const count = parseInt(await question('How many reactions? '));
        const reactions = [];
        
        for (let i = 0; i < count; i++) {
          console.log(`\nReaction ${i + 1}/${count}:`);
          const url = await question('  URL: ');
          const emojis = await question('  Emojis: ');
          reactions.push({ url, emojis });
        }
        
        const delay = parseInt(await question('\nDelay between requests (ms): ') || '1000');
        
        try {
          console.log('\n⏳ Sending batch reactions...');
          const results = await client.sendBatchReactions(reactions, { delay });
          const success = results.filter(r => r.success).length;
          console.log(`\n✅ Completed: ${success}/${results.length} succeeded`);
        } catch (error) {
          console.log('❌ Error:', error.message);
        }
        break;
      }
      
      case '3': {
        const url = await question('Enter URL to validate: ');
        const isValid = validateUrl(url);
        console.log(isValid ? '✅ URL is valid' : '❌ URL is invalid');
        break;
      }
      
      case '4': {
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      }
      
      default: {
        console.log('❌ Invalid option!');
      }
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
});
```

**Buat executable:**
```bash
chmod +x cli.js
./cli.js
```
</details>

## 🐛 Troubleshooting

### Error: "API Key tidak valid"
- Pastikan API Key Anda benar
- Cek apakah API Key sudah expired
- Verify API Key di dashboard

### Error: "URL tidak valid"
- Format harus: `https://whatsapp.com/channel/{CHANNEL_ID}/{POST_ID}`
- Pastikan tidak ada spasi atau karakter tambahan
- Gunakan `validateUrl()` untuk memverifikasi

### Error: "Request timeout"
- Coba tingkatkan timeout: `{ timeout: 30000 }`
- Cek koneksi internet Anda
- Server mungkin sedang sibuk, retry setelah beberapa saat

### Batch reactions lambat
- Kurangi delay antar request
- Gunakan concurrency yang lebih tinggi
- Implement parallel processing

### Rate limit exceeded
- Implementasi rate limiting di client side
- Tambahkan delay yang lebih besar
- Gunakan queue system

## ⚖️ Disclaimer

Penggunaan library ini sepenuhnya menjadi tanggung jawab pengguna. Pastikan Anda mematuhi Terms of Service WhatsApp dan tidak melakukan spam atau abuse.

---

**© 2025 Nine** | Made with ❤️ for the community
