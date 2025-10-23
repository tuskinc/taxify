import { supabase } from './supabase';

/**
 * Secure API Key Management Service
 * Handles API key retrieval and usage tracking
 */

export interface APIKeyUsage {
  keyType: string;
  userId: string;
  endpoint: string;
  tokensUsed?: number;
  costUsd?: number;
  responseTimeMs?: number;
  success?: boolean;
  errorMessage?: string;
}

export class APIKeyService {
  private static instance: APIKeyService;
  private keyCache: Map<string, string> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): APIKeyService {
    if (!APIKeyService.instance) {
      APIKeyService.instance = new APIKeyService();
    }
    return APIKeyService.instance;
  }

  /**
   * Get API key by type (with caching)
   */
  async getAPIKey(keyType: 'openai' | 'claude' | 'bing' | 'other'): Promise<string | null> {
    const cacheKey = `api_key_${keyType}`;
    const now = Date.now();

    // Check cache first
    if (this.keyCache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.keyCache.get(cacheKey)!;
    }

    try {
      // Get key from database
      const { data, error } = await supabase.rpc('get_active_api_key', {
        key_type_param: keyType
      });

      if (error) {
        console.error('Failed to get API key:', error);
        return null;
      }

      if (data) {
        // Cache the key
        this.keyCache.set(cacheKey, data);
        this.cacheExpiry.set(cacheKey, now + this.CACHE_DURATION);
        return data;
      }

      return null;
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  /**
   * Get OpenAI API key specifically
   */
  async getOpenAIKey(): Promise<string | null> {
    return this.getAPIKey('openai');
  }

  /**
   * Track API key usage
   */
  async trackUsage(usage: APIKeyUsage): Promise<void> {
    try {
      await supabase.rpc('track_api_usage', {
        key_type_param: usage.keyType,
        user_id_param: usage.userId,
        endpoint_param: usage.endpoint,
        tokens_used_param: usage.tokensUsed || 0,
        cost_usd_param: usage.costUsd || 0,
        response_time_ms_param: usage.responseTimeMs || 0,
        success_param: usage.success !== false,
        error_message_param: usage.errorMessage || undefined
      });
    } catch (error) {
      console.error('Failed to track API usage:', error);
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUserUsageStats(userId: string, days: number = 30): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('api_key_usage')
        .select(`
          *,
          api_keys!inner(key_type, key_name)
        `)
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get usage stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }

  /**
   * Get total usage statistics
   */
  async getTotalUsageStats(days: number = 30): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('api_key_usage')
        .select(`
          *,
          api_keys!inner(key_type, key_name)
        `)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get total usage stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting total usage stats:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for key rotation)
   */
  clearCache(): void {
    this.keyCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Clear cache for specific key type
   */
  clearCacheForType(keyType: string): void {
    const cacheKey = `api_key_${keyType}`;
    this.keyCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }
}

// Export singleton instance
export const apiKeyService = APIKeyService.getInstance();

// Helper functions for easy use
export const getOpenAIKey = () => apiKeyService.getOpenAIKey();
export const trackAPIUsage = (usage: APIKeyUsage) => apiKeyService.trackUsage(usage);
export const getUserUsageStats = (userId: string, days?: number) => apiKeyService.getUserUsageStats(userId, days);
export const getTotalUsageStats = (days?: number) => apiKeyService.getTotalUsageStats(days);
