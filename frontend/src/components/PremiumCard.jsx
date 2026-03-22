import React from 'react';
import { Wifi, Building2 } from 'lucide-react';
import './PremiumCard.css';

export default function PremiumCard({ 
  bankName = 'Bank Name', 
  cardName = '', 
  cardNetwork = 'Visa', 
  cardType = 'Credit', 
  maskedNumber = '••••', 
  holderName = 'CARDHOLDER NAME' 
}) {

  // Dynamic Network Logo Rendering
  const renderNetwork = () => {
    switch(cardNetwork?.toLowerCase()) {
      case 'visa':
        return <div className="pc-network net-visa">VISA</div>;
      case 'mastercard':
        return (
          <div className="pc-network net-mastercard">
            <div className="mc-circle mc-red"></div>
            <div className="mc-circle mc-yellow"></div>
          </div>
        );
      case 'rupay':
        return <div className="pc-network net-rupay">RuPay</div>;
      case 'amex':
        return <div className="pc-network net-amex">AMEX</div>;
      default:
        return <div className="pc-network" style={{fontSize: '0.9rem'}}>{cardNetwork}</div>;
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
            <div className="pc-bank-name">
              <Building2 size={16} /> 
              {bankName || 'Bank Name'}
            </div>
            <div className="pc-card-name">
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
