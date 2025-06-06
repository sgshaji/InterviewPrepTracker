import { cache } from './cache'

interface LogoCache {
  url: string
  fallbackInitials: string
  timestamp: number
}

export class CompanyLogoService {
  private static CACHE_TTL = 24 * 60 * 60 // 24 hours in seconds

  static async getCompanyLogo(companyName: string): Promise<{ url: string; fallbackInitials: string }> {
    if (!companyName.trim()) {
      return { url: '', fallbackInitials: '?' }
    }

    const cacheKey = `logo:${companyName.toLowerCase().trim()}`
    
    // Try cache first
    const cached = await cache.get(cacheKey) as LogoCache | null
    if (cached && cached.timestamp > Date.now() - (this.CACHE_TTL * 1000)) {
      return { url: cached.url, fallbackInitials: cached.fallbackInitials }
    }

    // Generate fallback initials
    const fallbackInitials = this.generateInitials(companyName)
    
    // Try to get logo from Clearbit
    const logoUrl = this.getClearbitLogoUrl(companyName)
    
    // Cache the result
    const logoData: LogoCache = {
      url: logoUrl,
      fallbackInitials,
      timestamp: Date.now()
    }
    
    await cache.set(cacheKey, logoData, this.CACHE_TTL)
    
    return { url: logoUrl, fallbackInitials }
  }

  private static getClearbitLogoUrl(companyName: string): string {
    const domain = this.getDomain(companyName)
    return `https://logo.clearbit.com/${domain}`
  }

  private static getDomain(companyName: string): string {
    const cleanName = companyName.toLowerCase().trim()
    
    // Common domain mappings
    const domainMap: Record<string, string> = {
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'apple': 'apple.com',
      'amazon': 'amazon.com',
      'meta': 'meta.com',
      'facebook': 'meta.com',
      'netflix': 'netflix.com',
      'uber': 'uber.com',
      'airbnb': 'airbnb.com',
      'spotify': 'spotify.com',
      'slack': 'slack.com',
      'salesforce': 'salesforce.com',
      'adobe': 'adobe.com',
      'oracle': 'oracle.com',
      'ibm': 'ibm.com',
      'intel': 'intel.com',
      'nvidia': 'nvidia.com',
      'tesla': 'tesla.com',
      'stripe': 'stripe.com',
      'paypal': 'paypal.com',
      'shopify': 'shopify.com',
      'zoom': 'zoom.us',
      'linkedin': 'linkedin.com',
      'twitter': 'twitter.com',
      'x': 'x.com',
      'tiktok': 'tiktok.com',
      'snapchat': 'snapchat.com',
      'discord': 'discord.com',
      'reddit': 'reddit.com',
      'github': 'github.com',
      'gitlab': 'gitlab.com',
      'atlassian': 'atlassian.com',
      'jira': 'atlassian.com',
      'confluence': 'atlassian.com',
      'dropbox': 'dropbox.com',
      'box': 'box.com',
      'notion': 'notion.so',
      'figma': 'figma.com',
      'canva': 'canva.com',
      'mongodb': 'mongodb.com',
      'redis': 'redis.io',
      'elastic': 'elastic.co',
      'databricks': 'databricks.com',
      'snowflake': 'snowflake.com'
    }

    if (domainMap[cleanName]) {
      return domainMap[cleanName]
    }

    // Try to construct domain
    const words = cleanName.split(/\s+/)
    if (words.length === 1) {
      return `${words[0]}.com`
    }
    
    return `${words.join('')}.com`
  }

  private static generateInitials(companyName: string): string {
    return companyName
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }
}