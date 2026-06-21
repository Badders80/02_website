/**
 * Marketplace Release Stage Configuration
 *
 * Controls whether the marketplace is in production or staging mode.
 * Used for conditional logic in sitemap, SEO, and feature flags.
 */

export function isMarketplaceProductionStage(): boolean {
  // Check environment variable or default to true for production
  return process.env.NEXT_PUBLIC_MARKETPLACE_STAGE === 'production' || 
         process.env.NODE_ENV === 'production';
}
