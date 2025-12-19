declare module 'nvrch' {
  export interface SendReactionResponse {
    success: boolean;
    creator: string;
    message: string;
    data: {
      message: string;
      botResponse: string;
    };
    details: {
      post_link: string;
      reacts: string;
      key_type: string;
      method: string;
    };
  }
  
  export interface BatchReactionItem {
    url: string;
    emojis: string | string[];
  }
  
  export interface BatchResultSuccess {
    success: true;
    index: number;
    url: string;
    data: SendReactionResponse;
  }
  
  export interface BatchResultError {
    success: false;
    index: number;
    url: string;
    error: string;
    status?: number;
    response?: any;
  }
  
  export type BatchResult = BatchResultSuccess | BatchResultError;
  
  export interface ClientConfig {
    /** API Key untuk otentikasi */
    apiKey: string;
    /** Timeout dalam milidetik (default: 30000) */
    timeout?: number;
    /** Delay antar request dalam milidetik (untuk batch) */
    delay?: number;
  }
  
  export interface SendOptions {
    /** Timeout override dalam milidetik */
    timeout?: number;
  }
  
  export interface BatchOptions extends SendOptions {
    /** Delay antar request dalam milidetik */
    delay?: number;
  }
  
  /**
   * Kelas utama NVRCH Client
   */
  export class NVRCH {
    /**
     * Membuat instance NVRCH Client
     * @param apiKey - API Key string atau config object
     */
    constructor(apiKey: string | ClientConfig);
    
    /**
     * Mengirim reaksi ke post WhatsApp Channel
     * @param url - URL post WhatsApp Channel
     * @param emojis - Emoji atau array emoji
     * @param options - Opsi tambahan
     * @returns Promise dengan response dari server
     */
    sendReaction(
      url: string, 
      emojis: string | string[], 
      options?: SendOptions
    ): Promise<SendReactionResponse>;
    
    /**
     * Batch send reactions to multiple posts
     * @param reactions - Array of reaction objects
     * @param options - Opsi tambahan
     * @returns Promise dengan array hasil
     */
    sendBatchReactions(
      reactions: BatchReactionItem[],
      options?: BatchOptions
    ): Promise<BatchResult[]>;
    
    /**
     * Mendapatkan konfigurasi saat ini
     * @returns Konfigurasi client
     */
    getConfig(): Partial<ClientConfig> & { apiKey: string };
    
    /**
     * Mengupdate konfigurasi
     * @param config - Konfigurasi baru
     */
    setConfig(config: Partial<ClientConfig>): void;
    
    /**
     * Validasi URL WhatsApp Channel (static method)
     * @param url - URL WhatsApp Channel
     * @returns boolean apakah URL valid
     */
    static validateUrl(url: string): boolean;
  }
  
  /**
   * Factory function untuk membuat NVRCH Client
   * @param apiKey - API Key atau config
   * @returns Instance NVRCH Client
   */
  export function createClient(apiKey: string | ClientConfig): NVRCH;
  
  /**
   * Authentikasi dan membuat client
   * @param apiKey - API Key atau config
   * @returns Instance NVRCH Client
   */
  export function auth(apiKey: string | ClientConfig): NVRCH;
  
  /**
   * Validasi URL WhatsApp Channel
   * @param url - URL WhatsApp Channel
   * @returns boolean apakah URL valid
   */
  export function validateUrl(url: string): boolean;
  
  /**
   * Mendapatkan informasi package
   * @returns Informasi package
   */
  export function getPackageInfo(): {
    name: string;
    version: string;
    description: string;
    apiUrl: string;
    requiresApiKey: boolean;
    defaultTimeout: number;
    exports: string[];
  };
  
  /** URL API */
  export const API_URL: string;
}
