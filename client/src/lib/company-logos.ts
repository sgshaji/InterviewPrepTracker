// Company logo utilities with direct Clearbit integration
interface LogoData {
  url: string;
  source: string;
  initials: string;
}

const logoCache = new Map<string, LogoData>();

// Direct company domain mapping for better logo accuracy
const getDomainForCompany = (companyName: string): string => {
  const cleanName = companyName.toLowerCase().trim();
  
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
    'linkedin': 'linkedin.com',
    'twitter': 'x.com',
    'tesla': 'tesla.com',
    'salesforce': 'salesforce.com',
    'adobe': 'adobe.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'intel': 'intel.com',
    'nvidia': 'nvidia.com',
    'paypal': 'paypal.com',
    'stripe': 'stripe.com',
    'shopify': 'shopify.com',
    'zoom': 'zoom.us',
    'slack': 'slack.com',
    'dropbox': 'dropbox.com',
    'atlassian': 'atlassian.com',
    'figma': 'figma.com',
    'notion': 'notion.so',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'docker': 'docker.com',
    'mongodb': 'mongodb.com',
    'redis': 'redis.io',
    'postgresql': 'postgresql.org',
    'mysql': 'mysql.com',
    'yahoo': 'yahoo.com',
    'ebay': 'ebay.com',
    'visa': 'visa.com',
    'mastercard': 'mastercard.com',
    'jpmorgan': 'jpmorgan.com',
    'goldman sachs': 'goldmansachs.com',
    'morgan stanley': 'morganstanley.com',
    'boeing': 'boeing.com',
    'airbus': 'airbus.com',
    'general electric': 'ge.com',
    'ford': 'ford.com',
    'toyota': 'toyota.com',
    'bmw': 'bmw.com',
    'mercedes': 'mercedes-benz.com',
    'volkswagen': 'volkswagen.com',
    'pfizer': 'pfizer.com',
    'johnson & johnson': 'jnj.com',
    'walmart': 'walmart.com',
    'target': 'target.com',
    'costco': 'costco.com',
    'nike': 'nike.com',
    'adidas': 'adidas.com',
    'wayfair': 'wayfair.com',
    'miro': 'miro.com',
    'intuit': 'intuit.com',
    'agoda': 'agoda.com',
    'lloyds bank': 'lloydsbank.com',
    'payu': 'payu.com',
    'wise': 'wise.com',
    'datadog': 'datadoghq.com',
    'deel': 'deel.com',
    'bolt': 'bolt.eu',
    'arm': 'arm.com'
  };

  // Check exact match
  if (domainMap[cleanName]) {
    return domainMap[cleanName];
  }

  // Check partial matches
  for (const [key, domain] of Object.entries(domainMap)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return domain;
    }
  }

  // Generate likely domain
  const safeName = cleanName.replace(/[^a-z0-9]/g, '');
  return `${safeName}.com`;
};

export async function getCompanyLogo(companyName: string): Promise<LogoData | null> {
  if (!companyName?.trim()) return null;
  
  const cacheKey = companyName.toLowerCase().trim();
  
  // Check cache first
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey)!;
  }
  
  const domain = getDomainForCompany(companyName);
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  
  try {
    // Test if Clearbit logo exists
    const response = await fetch(clearbitUrl, { method: 'HEAD' });
    if (response.ok) {
      const logoData = {
        url: clearbitUrl,
        source: 'clearbit',
        initials: getCompanyInitials(companyName)
      };
      logoCache.set(cacheKey, logoData);
      return logoData;
    }
  } catch (error) {
    console.warn('Clearbit logo fetch failed:', error);
  }
  
  // Fallback to initials avatar
  const initials = getCompanyInitials(companyName);
  const fallback = {
    url: generateCompanyAvatarUrl(companyName),
    source: 'initials',
    initials
  };
  
  logoCache.set(cacheKey, fallback);
  return fallback;
}

export function getCompanyInitials(companyName: string): string {
  if (!companyName) return '?';
  
  return companyName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function generateCompanyAvatarUrl(companyName: string): string {
  const initials = getCompanyInitials(companyName);
  const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
  const colorIndex = companyName.length % colors.length;
  const color = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=32&rounded=true`;
}