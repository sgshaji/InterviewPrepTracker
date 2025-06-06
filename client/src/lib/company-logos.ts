// Company logo utilities
export function getCompanyLogo(companyName: string): string | null {
  if (!companyName) return null;
  
  const cleanName = companyName.toLowerCase().trim();
  
  // Map of known companies to their logo URLs or icon names
  const logoMap: Record<string, string> = {
    'google': 'https://logo.clearbit.com/google.com',
    'microsoft': 'https://logo.clearbit.com/microsoft.com',
    'apple': 'https://logo.clearbit.com/apple.com',
    'amazon': 'https://logo.clearbit.com/amazon.com',
    'meta': 'https://logo.clearbit.com/meta.com',
    'facebook': 'https://logo.clearbit.com/meta.com',
    'netflix': 'https://logo.clearbit.com/netflix.com',
    'uber': 'https://logo.clearbit.com/uber.com',
    'airbnb': 'https://logo.clearbit.com/airbnb.com',
    'spotify': 'https://logo.clearbit.com/spotify.com',
    'linkedin': 'https://logo.clearbit.com/linkedin.com',
    'twitter': 'https://logo.clearbit.com/twitter.com',
    'tesla': 'https://logo.clearbit.com/tesla.com',
    'salesforce': 'https://logo.clearbit.com/salesforce.com',
    'adobe': 'https://logo.clearbit.com/adobe.com',
    'oracle': 'https://logo.clearbit.com/oracle.com',
    'ibm': 'https://logo.clearbit.com/ibm.com',
    'intel': 'https://logo.clearbit.com/intel.com',
    'nvidia': 'https://logo.clearbit.com/nvidia.com',
    'paypal': 'https://logo.clearbit.com/paypal.com',
    'stripe': 'https://logo.clearbit.com/stripe.com',
    'shopify': 'https://logo.clearbit.com/shopify.com',
    'zoom': 'https://logo.clearbit.com/zoom.us',
    'slack': 'https://logo.clearbit.com/slack.com',
    'dropbox': 'https://logo.clearbit.com/dropbox.com',
    'atlassian': 'https://logo.clearbit.com/atlassian.com',
    'figma': 'https://logo.clearbit.com/figma.com',
    'notion': 'https://logo.clearbit.com/notion.so'
  };

  // Check for exact match first
  if (logoMap[cleanName]) {
    return logoMap[cleanName];
  }

  // Check for partial matches
  for (const [company, logo] of Object.entries(logoMap)) {
    if (cleanName.includes(company) || company.includes(cleanName)) {
      return logo;
    }
  }

  // Try Clearbit API with company domain guess
  const potentialDomain = `${cleanName.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
  return `https://logo.clearbit.com/${potentialDomain}`;
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