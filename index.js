const axios = require('axios');

// Konfigurasi API
const API_URL = 'https://nieve-wachrs.vercel.app';

/**
 * Kelas utama NVRCH Client
 * @class
 */
class NVRCH {
  /**
   * Membuat instance NVRCH Client
   * @param {string|Object} apiKey - API Key string atau config object
   * @param {string} apiKey.apiKey - API Key
   * @param {number} [apiKey.timeout=30000] - Timeout dalam ms
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API Key harus disediakan');
    }
    
    let apiKeyString;
    let config = {};
    
    if (typeof apiKey === 'string') {
      apiKeyString = apiKey.trim();
      config.timeout = 30000;
    } else if (typeof apiKey === 'object' && apiKey !== null) {
      if (!apiKey.apiKey) {
        throw new Error('apiKey property harus disediakan dalam config object');
      }
      apiKeyString = apiKey.apiKey.trim();
      config.timeout = apiKey.timeout || 30000;
      config.delay = apiKey.delay;
    } else {
      throw new Error('API Key harus berupa string atau object');
    }
    
    if (!apiKeyString) {
      throw new Error('API Key tidak boleh kosong');
    }
    
    this._apiKey = apiKeyString;
    this._config = config;
    
    // Buat axios instance
    this._axios = axios.create({
      baseURL: API_URL,
      timeout: config.timeout,
      headers: {
        'Authorization': apiKeyString,
        'Content-Type': 'application/json',
        'User-Agent': 'nvrch/3.0.0'
      }
    });
  }
  
  /**
   * Validasi URL WhatsApp Channel
   * @param {string} url - URL WhatsApp Channel
   * @returns {boolean} true jika valid
   */
  static validateUrl(url) {
    return NVRCH._isValidWhatsAppChannelUrl(url);
  }
  
  /**
   * Internal: Validasi URL WhatsApp Channel
   * @private
   */
  static _isValidWhatsAppChannelUrl(url) {
    if (typeof url !== 'string' || !url.trim()) {
      return false;
    }
    
    try {
      const urlObj = new URL(url);
      
      // Validasi domain
      const validDomains = ['whatsapp.com', 'www.whatsapp.com'];
      if (!validDomains.includes(urlObj.hostname.toLowerCase())) {
        return false;
      }
      
      // Validasi path harus /channel/{channelId}/{postId}
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length < 3) {
        return false;
      }
      
      if (pathParts[0] !== 'channel') {
        return false;
      }
      
      return true;
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Internal: Format emoji
   * @private
   */
  static _formatEmojis(emojis) {
    if (Array.isArray(emojis)) {
      const cleanEmojis = emojis
        .filter(emoji => emoji && typeof emoji === 'string')
        .map(emoji => emoji.trim())
        .filter(emoji => emoji.length > 0);
      
      if (cleanEmojis.length === 0) {
        throw new Error('Array emoji tidak mengandung emoji yang valid');
      }
      
      return cleanEmojis.join(',');
    }
    
    if (typeof emojis === 'string') {
      const trimmed = emojis.trim();
      if (trimmed.length === 0) {
        throw new Error('String emoji tidak boleh kosong');
      }
      
      return trimmed
        .split(',')
        .map(emoji => emoji.trim())
        .filter(emoji => emoji.length > 0)
        .join(',');
    }
    
    throw new TypeError('Emojis harus berupa string atau array');
  }
  
  /**
   * Mengirim reaksi ke post WhatsApp Channel
   * @param {string} url - URL post WhatsApp Channel
   * @param {string|string[]} emojis - Emoji atau array emoji
   * @param {Object} [options] - Opsi tambahan
   * @param {number} [options.timeout] - Timeout override dalam ms
   * @returns {Promise<Object>} Response dari server
   * @throws {Error} Jika terjadi error
   */
  async sendReaction(url, emojis, options = {}) {
    // Validasi parameter
    if (!url || typeof url !== 'string') {
      throw new Error('URL post WhatsApp Channel harus diisi dan berupa string');
    }
    
    if (!emojis) {
      throw new Error('Emoji harus diisi');
    }
    
    // Validasi URL
    if (!NVRCH._isValidWhatsAppChannelUrl(url)) {
      throw new Error(
        'URL WhatsApp Channel tidak valid. ' +
        'Format yang benar: https://whatsapp.com/channel/{channelId}/{postId} ' +
        'Contoh: https://whatsapp.com/channel/0029VbAzDjIBFLgbEyadQb3y/178'
      );
    }
    
    // Format emoji
    const formattedEmojis = NVRCH._formatEmojis(emojis);
    
    // Siapkan data request
    const requestData = {
      url: url.trim(),
      emojis: formattedEmojis
    };
    
    // Konfigurasi timeout
    const timeout = options.timeout || this._config.timeout;
    
    try {
      // Kirim request
      const response = await this._axios.post('', requestData, { timeout });
      
      // Validasi response
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Response dari server tidak valid');
      }
      
      return response.data;
      
    } catch (error) {
      throw this._handleAxiosError(error);
    }
  }
  
  /**
   * Batch send reactions to multiple posts
   * @param {Array<Object>} reactions - Array of reaction objects
   * @param {string} reactions[].url - URL post WhatsApp Channel
   * @param {string|string[]} reactions[].emojis - Emoji atau array emoji
   * @param {Object} [options] - Opsi tambahan
   * @param {number} [options.delay] - Delay antar request dalam ms
   * @param {number} [options.timeout] - Timeout per request dalam ms
   * @returns {Promise<Array<Object>>} Array of results
   */
  async sendBatchReactions(reactions, options = {}) {
    // Validasi reactions
    if (!Array.isArray(reactions)) {
      throw new TypeError('Reactions harus berupa array');
    }
    
    if (reactions.length === 0) {
      throw new Error('Reactions array tidak boleh kosong');
    }
    
    // Validasi setiap reaction
    reactions.forEach((reaction, index) => {
      if (!reaction.url) {
        throw new Error(`Reaction pada index ${index} tidak memiliki URL`);
      }
      if (!reaction.emojis) {
        throw new Error(`Reaction pada index ${index} tidak memiliki emoji`);
      }
      if (!NVRCH._isValidWhatsAppChannelUrl(reaction.url)) {
        throw new Error(`URL tidak valid pada index ${index}: ${reaction.url}`);
      }
    });
    
    const results = [];
    const delay = options.delay || this._config.delay || 1000;
    
    for (let i = 0; i < reactions.length; i++) {
      const { url, emojis } = reactions[i];
      
      try {
        const result = await this.sendReaction(url, emojis, {
          timeout: options.timeout
        });
        
        results.push({
          success: true,
          index: i,
          url: url,
          data: result
        });
        
      } catch (error) {
        results.push({
          success: false,
          index: i,
          url: url,
          error: error.message,
          status: error.status,
          response: error.response
        });
      }
      
      // Delay antara request (kecuali untuk request terakhir)
      if (i < reactions.length - 1 && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }
  
  /**
   * Internal: Handle axios error
   * @private
   */
  _handleAxiosError(error) {
    if (error.response) {
      // Server merespon dengan error
      const status = error.response.status;
      const data = error.response.data || {};
      
      const errorMessage = data.message || 
                          error.message || 
                          `Server error: ${status}`;
      
      const enhancedError = new Error(errorMessage);
      enhancedError.status = status;
      enhancedError.response = data;
      enhancedError.isAxiosError = true;
      
      return enhancedError;
      
    } else if (error.request) {
      // Request dibuat tetapi tidak ada response
      return new Error(
        `Tidak ada response dari server. ` +
        `Periksa koneksi internet atau server mungkin down.`
      );
      
    } else {
      // Error saat setup request
      return new Error(`Error setup request: ${error.message}`);
    }
  }
  
  /**
   * Mendapatkan konfigurasi saat ini
   * @returns {Object} Konfigurasi client
   */
  getConfig() {
    return {
      ...this._config,
      apiKey: '***' // Mask API Key untuk keamanan
    };
  }
  
  /**
   * Mengupdate konfigurasi
   * @param {Object} config - Konfigurasi baru
   */
  setConfig(config) {
    if (config.timeout && typeof config.timeout === 'number') {
      this._config.timeout = config.timeout;
      this._axios.defaults.timeout = config.timeout;
    }
    
    if (config.delay && typeof config.delay === 'number') {
      this._config.delay = config.delay;
    }
    
    if (config.apiKey && typeof config.apiKey === 'string') {
      this._apiKey = config.apiKey.trim();
      this._axios.defaults.headers.Authorization = this._apiKey;
    }
  }
}

/**
 * Factory function untuk membuat NVRCH Client
 * @param {string|Object} apiKey - API Key atau config
 * @returns {NVRCH} Instance NVRCH Client
 */
function createClient(apiKey) {
  return new NVRCH(apiKey);
}

/**
 * Authentikasi dan membuat client
 * @param {string|Object} apiKey - API Key atau config
 * @returns {NVRCH} Instance NVRCH Client
 */
function auth(apiKey) {
  return createClient(apiKey);
}

/**
 * Validasi URL WhatsApp Channel
 * @param {string} url - URL WhatsApp Channel
 * @returns {boolean} true jika valid
 */
function validateUrl(url) {
  return NVRCH.validateUrl(url);
}

/**
 * Mendapatkan informasi package
 * @returns {Object} Informasi package
 */
function getPackageInfo() {
  return {
    name: 'nvrch',
    version: '3.0.0',
    description: 'Package untuk mengirim reaksi ke WhatsApp Channel dengan auth system',
    apiUrl: API_URL,
    requiresApiKey: true,
    defaultTimeout: 30000,
    exports: [
      'auth(apiKey)',
      'createClient(apiKey)',
      'validateUrl(url)',
      'getPackageInfo()',
      'NVRCH class'
    ]
  };
}

// Export utama
module.exports = {
  // Auth dan factory functions
  auth,
  createClient,
  
  // Class (untuk advanced usage)
  NVRCH,
  
  // Helper functions
  validateUrl,
  getPackageInfo,
  
  // Konstanta
  API_URL
};
