// Paths verified HTTP 200 (Wikimedia file locations change; older URLs often 404).

export const BANK_LOGO_URLS = {
  'HDFC Bank': 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
  'ICICI Bank': 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg',
  'State Bank of India': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg',
  'Axis Bank': 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg',
  'Kotak Bank': 'https://upload.wikimedia.org/wikipedia/en/3/39/Kotak_Mahindra_Group_logo.svg',
  'Yes Bank': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Yes_Bank_SVG_Logo.svg',
  'IndusInd Bank': 'https://upload.wikimedia.org/wikipedia/commons/4/40/IndusInd_Bank_SVG_Logo.svg',
  'Bank of Baroda': 'https://upload.wikimedia.org/wikipedia/en/f/f2/BankOfBarodaLogo.svg',
  'Punjab National Bank': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Punjab_National_Bank_new_logo.svg',
  'Canara Bank': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Canara_Bank_Logo.svg',
  'IDFC First Bank': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_of_IDFC_First_Bank.svg',
}

const BANK_LOGO_ALIASES = {
  'SBI Bank': 'State Bank of India',
}

export const NETWORK_LOGO_URLS = {
  Visa: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Visa_Inc._logo_%282021%E2%80%93present%29.svg',
  Mastercard: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  RuPay: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay.svg',
  Amex: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg',
  Diners: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg',
}

export function getBankLogoUrl(bankName) {
  if (!bankName?.trim()) return undefined
  const key = bankName.trim()
  if (BANK_LOGO_URLS[key]) return BANK_LOGO_URLS[key]
  const canon = BANK_LOGO_ALIASES[key]
  return canon ? BANK_LOGO_URLS[canon] : undefined
}

export function getNetworkLogoUrl(network) {
  if (!network?.trim()) return undefined
  const t = network.trim()
  if (NETWORK_LOGO_URLS[t]) return NETWORK_LOGO_URLS[t]
  const lower = t.toLowerCase()
  const key = Object.keys(NETWORK_LOGO_URLS).find((k) => k.toLowerCase() === lower)
  return key ? NETWORK_LOGO_URLS[key] : undefined
}
