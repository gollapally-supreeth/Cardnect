import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { getBankLogoUrl, getNetworkLogoUrl } from '../constants/cardLogos';
import './PremiumCard.css';

export default function PremiumCard({ 
  bankName = 'Bank Name', 
  cardName = '', 
  cardNetwork = 'Visa', 
  cardType: _cardType = 'Credit', 
  maskedNumber = '••••', 
  holderName = 'CARDHOLDER NAME',
  variant = 'default',
}) {
  const [bankError, setBankError] = useState(false);
  const [netError, setNetError] = useState(false);

  const bankLogoUrl = getBankLogoUrl(bankName);
  const networkLogoUrl = getNetworkLogoUrl(cardNetwork);

  useEffect(() => { setBankError(false); }, [bankName]);
  useEffect(() => { setNetError(false); }, [cardNetwork]);

  const renderNetwork = () => {
    if (networkLogoUrl && !netError) {
      return (
        <img 
          src={networkLogoUrl} 
          alt={cardNetwork}
          className="pc-network-img"
          onError={() => setNetError(true)}
          loading="lazy"
          decoding="async"
        />
      );
    }

    switch(cardNetwork?.toLowerCase()) {
      case 'visa':
        return <div className="pc-network net-visa">VISA</div>;
      case 'mastercard':
        return (
          <div className="pc-network net-mastercard">
            <span className="pc-net-mc pc-net-mc--red" />
            <span className="pc-net-mc pc-net-mc--orange" />
          </div>
        );
      case 'rupay':
        return <div className="pc-network net-rupay">RuPay</div>;
      case 'amex':
        return <div className="pc-network net-amex">AMEX</div>;
      default:
        return <div className="pc-network net-fallback">{cardNetwork}</div>;
    }
  };

  const renderMasked = () => {
    const last4 = maskedNumber?.slice(-4)?.replace(/\D/g, '') || '';
    const safeLast4 = last4.padEnd(4, '•');
    return (
      <div className="pc-number">
        <span className="pc-number__g">••••</span>
        <span className="pc-number__g">••••</span>
        <span className="pc-number__g">••••</span>
        <span className="pc-number__g pc-number__g--last">{safeLast4}</span>
      </div>
    );
  };

  const showBankFallback = !bankLogoUrl || bankError;
  const showBankNameText = showBankFallback && Boolean(bankName?.trim());
  const tierLabel = cardName?.trim() || 'Premium';

  const isBrowse = variant === 'browse'

  return (
    <div className={`premium-card-wrap${isBrowse ? ' premium-card-wrap--browse' : ''}`}>
      <div className={`premium-card${isBrowse ? ' premium-card--browse' : ''}`}>
        <div className="pc-metal-layers" aria-hidden="true" />
        <div className="pc-inner">
          
          <header className="pc-header">
            <div className="pc-bank-brand">
              {bankLogoUrl && !bankError ? (
                <img 
                  src={bankLogoUrl} 
                  alt=""
                  className="pc-bank-img"
                  onError={() => setBankError(true)}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              {showBankFallback ? (
                <Building2 size={20} className="pc-bank-fallback-icon" aria-hidden />
              ) : null}
              {showBankNameText ? (
                <span className="pc-bank-custom-name">{bankName}</span>
              ) : null}
            </div>
            <div className="pc-tier">{tierLabel}</div>
          </header>

          <section className="pc-pan" aria-label="Masked card number">
            {renderMasked()}
          </section>

          <footer className="pc-footer">
            <div className="pc-holder">
              {(holderName || 'CARDHOLDER NAME').toUpperCase()}
            </div>
            <div className="pc-network-mark">
              {renderNetwork()}
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}
