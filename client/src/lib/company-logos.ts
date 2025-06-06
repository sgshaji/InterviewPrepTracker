// Company logo utilities with API integration
interface LogoData {
  url: string;
  source: string;
  initials: string;
}

const logoCache = new Map<string, LogoData>();

export async function getCompanyLogo(companyName: string): Promise<LogoData | null> {
  if (!companyName?.trim()) return null;
  
  const cacheKey = companyName.toLowerCase().trim();
  
  // Check cache first
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey)!;
  }
  
  try {
    const response = await fetch(`/api/company-logo/${encodeURIComponent(companyName)}`);
    if (response.ok) {
      const logoData = await response.json();
      logoCache.set(cacheKey, logoData);
      return logoData;
    }
  } catch (error) {
    console.warn('Failed to fetch company logo:', error);
  }
  
  // Fallback to initials
  const initials = getCompanyInitials(companyName);
  const fallback = {
    url: generateCompanyAvatarUrl(companyName),
    source: 'fallback',
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