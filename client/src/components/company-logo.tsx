import { useState, useEffect } from 'react';
import { getCompanyLogo, getCompanyInitials, generateCompanyAvatarUrl } from '../lib/company-logos';

interface CompanyLogoProps {
  companyName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
};

export default function CompanyLogo({ companyName, size = 'md', className = '' }: CompanyLogoProps) {
  const [logoData, setLogoData] = useState<{ url: string; initials: string } | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function fetchLogo() {
      if (!companyName?.trim()) return;
      
      try {
        const data = await getCompanyLogo(companyName);
        if (data) {
          setLogoData(data);
          setImageError(false);
        }
      } catch (error) {
        console.warn('Error fetching company logo:', error);
        // Fallback to initials
        setLogoData({
          url: generateCompanyAvatarUrl(companyName),
          initials: getCompanyInitials(companyName)
        });
      }
    }

    fetchLogo();
  }, [companyName]);

  if (!logoData) {
    // Loading state with company initials
    const initials = getCompanyInitials(companyName);
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-lg flex items-center justify-center font-semibold text-gray-500 animate-pulse`}>
        {initials}
      </div>
    );
  }

  if (imageError || !logoData.url) {
    // Error state with company initials
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-semibold text-white shadow-sm`}>
        {logoData.initials}
      </div>
    );
  }

  return (
    <img
      src={logoData.url}
      alt={`${companyName} logo`}
      className={`${sizeClasses[size]} ${className} rounded-lg object-cover shadow-sm bg-white`}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  );
}