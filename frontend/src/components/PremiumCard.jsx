import React, { useState, useEffect } from 'react';
import { Wifi, Building2 } from 'lucide-react';
import './PremiumCard.css';

const BANK_LOGOS = {
  'HDFC Bank':           '/logos/banks/hdfc.svg',
  'ICICI Bank':          '/logos/banks/icici.svg',
  'State Bank of India': '/logos/banks/sbi.svg',
  'Axis Bank':           '/logos/banks/axis.svg',
  'Kotak Bank':          '/logos/banks/kotak.svg',
  'Yes Bank':            '/logos/banks/yesbank.svg',
  'IndusInd Bank':       '/logos/banks/indusind.svg',
  'Bank of Baroda':      '/logos/banks/bob.svg',
  'Punjab National Bank':'/logos/banks/pnb.svg',
  'Canara Bank':         '/logos/banks/canara.svg',
  'IDFC First Bank':     '/logos/banks/idfc.svg',
};

const NETWORK_LOGOS = {
  'Visa':       '/logos/networks/visa.svg',
  'Mastercard': '/logos/networks/mastercard.svg',
  'RuPay':      '/logos/networks/rupay.svg',
  'Amex':       '/logos/networks/amex.svg',
  'Diners':     '/logos/banks/diners.svg',
};

export default function PremiumCard({ 
  bankName = 'Bank Name', 
  cardName = '', 
  cardNetwork = 'Visa', 
  cardType = 'Credit', 
  maskedNumber = '••••', 
  holderName = 'CARDHOLDER NAME' 
}) {
  const [bankError, setBankError] = useState(false);
  const [netError, setNetError] = useState(false);

  useEffect(() => { setBankError(false); }, [bankName]);
  useEffect(() => { setNetError(false); }, [cardNetwork]);

  // Dynamic Network Logo Rendering
  const renderNetwork = () => {
    const logoUrl = NETWORK_LOGOS[cardNetwork];
    if (logoUrl && !netError) {
      return (
        <img 
          src={logoUrl} 
          alt={cardNetwork}
          className="pc-network-img"
          onError={() => setNetError(true)}
        />
      );
    }

    // Fallbacks
    switch(cardNetwork?.toLowerCase()) {
      case 'visa':
        return <div className="pc-network net-visa" style={{ fontStyle: 'italic', fontWeight: '900', color: '#fff', fontSize: '1.2rem' }}>VISA</div>;
      case 'mastercard':
        return (
          <div className="pc-network net-mastercard" style={{ display: 'flex', position: 'relative', width: '30px', height: '18px' }}>
            <div style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: '#eb001b', left: 0, opacity: 0.9 }}></div>
            <div style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: '#f79e1b', right: 0, opacity: 0.9 }}></div>
          </div>
        );
      case 'rupay':
        return <div className="pc-network net-rupay" style={{ fontWeight: '800', color: '#fff', fontSize: '1rem', fontStyle: 'italic' }}>RuPay</div>;
      case 'amex':
        return <div className="pc-network net-amex" style={{ fontWeight: '700', color: '#0058b8', background: '#fff', padding: '2px 4px', borderRadius: '2px', fontSize: '0.75rem' }}>AMEX</div>;
      default:
        return <div className="pc-network" style={{fontSize: '0.9rem', fontWeight: '700'}}>{cardNetwork}</div>;
    }
  };

  // Ensure minimum rendering for empty states during live-edit
  const renderMasked = (num) => {
    const last4 = num?.slice(-4)?.replace(/\D/g, '') || '';
    const safeLast4 = last4.padEnd(4, '•');
    return (
      <div className="pc-number">
        <span>••••</span>
        <span>••••</span>
        <span>••••</span>
        <span>{safeLast4}</span>
      </div>
    );
  };

  return (
    <div className="premium-card-wrap">
      <div className="premium-card">
        <div className="pc-inner">
          
          <div className="pc-top">
            <div className="pc-bank-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent' }}>
              {BANK_LOGOS[bankName] && !bankError ? (
                <img 
                  src={BANK_LOGOS[bankName]} 
                  alt={bankName}
                  className="pc-bank-img"
                  onError={() => setBankError(true)}
                />
              ) : (
                <Building2 size={16} />
              )}
              <span style={{ fontWeight: 800, letterSpacing: '0.04em', background: 'linear-gradient(180deg, #fff, #b8b8b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {!BANK_LOGOS[bankName] || bankError ? (bankName || 'Bank Name') : ''}
              </span>
            </div>
            <div className="pc-card-name" style={{ fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
              {cardName || 'Premium'}
            </div>
          </div>

          <div className="pc-chip-row">
            <div className="pc-chip">
              <div className="pc-chip-lines"></div>
            </div>
            <Wifi size={20} className="pc-nfc" />
          </div>

          {renderMasked(maskedNumber)}

          <div className="pc-bottom">
            <div className="pc-holder">
              {holderName || 'CARDHOLDER NAME'}
            </div>
            {renderNetwork()}
          </div>

        </div>
      </div>
    </div>
  );
}
