#!/usr/bin/env python3
"""
Company Logo Service
Fetches real company logos from multiple sources with fallbacks
"""
import requests
import json
import sys
import hashlib
import os
from urllib.parse import quote
import time

def get_company_domain(company_name):
    """Convert company name to likely domain"""
    # Common company mappings
    domain_map = {
        'google': 'google.com',
        'alphabet': 'google.com',
        'microsoft': 'microsoft.com',
        'apple': 'apple.com',
        'amazon': 'amazon.com',
        'meta': 'meta.com',
        'facebook': 'meta.com',
        'netflix': 'netflix.com',
        'uber': 'uber.com',
        'lyft': 'lyft.com',
        'airbnb': 'airbnb.com',
        'spotify': 'spotify.com',
        'linkedin': 'linkedin.com',
        'twitter': 'x.com',
        'x corp': 'x.com',
        'tesla': 'tesla.com',
        'spacex': 'spacex.com',
        'salesforce': 'salesforce.com',
        'adobe': 'adobe.com',
        'oracle': 'oracle.com',
        'ibm': 'ibm.com',
        'intel': 'intel.com',
        'nvidia': 'nvidia.com',
        'amd': 'amd.com',
        'paypal': 'paypal.com',
        'stripe': 'stripe.com',
        'shopify': 'shopify.com',
        'zoom': 'zoom.us',
        'slack': 'slack.com',
        'dropbox': 'dropbox.com',
        'atlassian': 'atlassian.com',
        'figma': 'figma.com',
        'notion': 'notion.so',
        'discord': 'discord.com',
        'github': 'github.com',
        'gitlab': 'gitlab.com',
        'docker': 'docker.com',
        'redis': 'redis.io',
        'mongodb': 'mongodb.com',
        'postgresql': 'postgresql.org',
        'mysql': 'mysql.com',
        'yahoo': 'yahoo.com',
        'ebay': 'ebay.com',
        'payoneer': 'payoneer.com',
        'visa': 'visa.com',
        'mastercard': 'mastercard.com',
        'american express': 'americanexpress.com',
        'jpmorgan': 'jpmorgan.com',
        'goldman sachs': 'goldmansachs.com',
        'morgan stanley': 'morganstanley.com',
        'blackrock': 'blackrock.com',
        'vanguard': 'vanguard.com',
        'fidelity': 'fidelity.com',
        'schwab': 'schwab.com',
        'wells fargo': 'wellsfargo.com',
        'bank of america': 'bankofamerica.com',
        'chase': 'chase.com',
        'citibank': 'citibank.com',
        'hsbc': 'hsbc.com',
        'deutsche bank': 'db.com',
        'credit suisse': 'credit-suisse.com',
        'ubs': 'ubs.com',
        'barclays': 'barclays.com',
        'boeing': 'boeing.com',
        'airbus': 'airbus.com',
        'lockheed martin': 'lockheedmartin.com',
        'raytheon': 'raytheon.com',
        'general electric': 'ge.com',
        'general motors': 'gm.com',
        'ford': 'ford.com',
        'toyota': 'toyota.com',
        'honda': 'honda.com',
        'nissan': 'nissan-global.com',
        'bmw': 'bmw.com',
        'mercedes': 'mercedes-benz.com',
        'volkswagen': 'volkswagen.com',
        'audi': 'audi.com',
        'porsche': 'porsche.com',
        'ferrari': 'ferrari.com',
        'lamborghini': 'lamborghini.com',
        'mclaren': 'mclaren.com',
        'rolls royce': 'rolls-roycemotorcars.com',
        'bentley': 'bentleymotors.com',
        'pfizer': 'pfizer.com',
        'johnson & johnson': 'jnj.com',
        'merck': 'merck.com',
        'novartis': 'novartis.com',
        'roche': 'roche.com',
        'abbott': 'abbott.com',
        'medtronic': 'medtronic.com',
        'bristol myers squibb': 'bms.com',
        'eli lilly': 'lilly.com',
        'gilead': 'gilead.com',
        'biogen': 'biogen.com',
        'amgen': 'amgen.com',
        'moderna': 'modernatx.com',
        'biontech': 'biontech.de',
        'astrazeneca': 'astrazeneca.com',
        'glaxosmithkline': 'gsk.com',
        'sanofi': 'sanofi.com',
        'takeda': 'takeda.com',
        'teva': 'tevapharm.com',
        'walmart': 'walmart.com',
        'target': 'target.com',
        'costco': 'costco.com',
        'home depot': 'homedepot.com',
        'lowes': 'lowes.com',
        'best buy': 'bestbuy.com',
        'macys': 'macys.com',
        'nordstrom': 'nordstrom.com',
        'gap': 'gap.com',
        'nike': 'nike.com',
        'adidas': 'adidas.com',
        'under armour': 'underarmour.com',
        'puma': 'puma.com',
        'reebok': 'reebok.com',
        'new balance': 'newbalance.com',
        'converse': 'converse.com',
        'vans': 'vans.com',
        'timberland': 'timberland.com',
        'columbia': 'columbia.com',
        'patagonia': 'patagonia.com',
        'north face': 'thenorthface.com',
        'lululemon': 'lululemon.com',
        'athleta': 'athleta.gap.com',
        'old navy': 'oldnavy.gap.com',
        'banana republic': 'bananarepublic.gap.com'
    }
    
    clean_name = company_name.lower().strip()
    
    # Check direct mapping first
    if clean_name in domain_map:
        return domain_map[clean_name]
    
    # Check partial matches
    for key, domain in domain_map.items():
        if key in clean_name or clean_name in key:
            return domain
    
    # Generate likely domain
    clean_domain = clean_name.replace(' ', '').replace('&', 'and').replace(',', '').replace('.', '').replace('-', '')
    return f"{clean_domain}.com"

def fetch_logo_clearbit(domain):
    """Fetch logo from Clearbit API"""
    try:
        url = f"https://logo.clearbit.com/{domain}"
        response = requests.head(url, timeout=5)
        if response.status_code == 200:
            return url
    except:
        pass
    return None

def fetch_logo_brandfetch(company_name, api_key=None):
    """Fetch logo from Brandfetch API"""
    if not api_key:
        return None
    
    try:
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json'
        }
        
        # Search for company
        search_url = f"https://api.brandfetch.io/v2/search/{quote(company_name)}"
        response = requests.get(search_url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data and len(data) > 0:
                brand = data[0]
                if 'logos' in brand and len(brand['logos']) > 0:
                    logo = brand['logos'][0]
                    if 'formats' in logo and len(logo['formats']) > 0:
                        return logo['formats'][0]['src']
    except:
        pass
    return None

def generate_initials_avatar(company_name):
    """Generate avatar with company initials"""
    initials = ''.join([word[0].upper() for word in company_name.split()[:2]])
    if not initials:
        initials = company_name[:2].upper()
    
    # Generate consistent color based on company name
    hash_obj = hashlib.md5(company_name.encode())
    hex_hash = hash_obj.hexdigest()
    
    colors = ['3B82F6', '10B981', '8B5CF6', 'F59E0B', 'EF4444', '6366F1', 'EC4899', '14B8A6']
    color_index = int(hex_hash[0], 16) % len(colors)
    bg_color = colors[color_index]
    
    return f"https://ui-avatars.com/api/?name={quote(initials)}&background={bg_color}&color=fff&size=128&rounded=true&bold=true"

def get_company_logo(company_name):
    """Main function to get company logo with multiple fallbacks"""
    if not company_name or not company_name.strip():
        return None
    
    company_name = company_name.strip()
    domain = get_company_domain(company_name)
    
    # Try Clearbit first (free, no API key needed)
    logo_url = fetch_logo_clearbit(domain)
    if logo_url:
        return {
            'url': logo_url,
            'source': 'clearbit',
            'initials': ''.join([word[0].upper() for word in company_name.split()[:2]])
        }
    
    # Try Brandfetch if API key is available
    brandfetch_key = os.getenv('BRANDFETCH_API_KEY')
    if brandfetch_key:
        logo_url = fetch_logo_brandfetch(company_name, brandfetch_key)
        if logo_url:
            return {
                'url': logo_url,
                'source': 'brandfetch',
                'initials': ''.join([word[0].upper() for word in company_name.split()[:2]])
            }
    
    # Fallback to initials avatar
    return {
        'url': generate_initials_avatar(company_name),
        'source': 'initials',
        'initials': ''.join([word[0].upper() for word in company_name.split()[:2]])
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Company name required"}))
        sys.exit(1)
    
    company_name = sys.argv[1]
    result = get_company_logo(company_name)
    print(json.dumps(result))