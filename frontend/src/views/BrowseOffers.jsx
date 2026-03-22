import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, SlidersHorizontal, CreditCard, Star, ArrowRight, Loader, X, Wifi, Shield, MessageCircle } from 'lucide-react'
import { fetchListings, createRequest } from '../api/services'
import { useAuthContext } from '../context/AuthContext'
import VerifyPhoneModal from '../components/VerifyPhoneModal'
import PremiumCard from '../components/PremiumCard'
import './BrowseOffers.css'

const NETWORKS = ['All', 'Visa', 'Mastercard', 'RuPay', 'Amex']
const TYPES    = ['All', 'Credit', 'Debit']

/* Network brand colour accents */
const NET_COLORS = {
  Visa:       '#1a1f71',
  Mastercard: '#eb001b',
  RuPay:      '#005c99',
  Amex:       '#007bc1',
  default:    '#2a2a2a',
}

function NetworkBadge({ name }) {
  return (
    <span className="net-badge" style={{ '--net-color': NET_COLORS[name] || NET_COLORS.default }}>
      {name}
    </span>
  )
}

/* ── Request Modal ── */
function RequestModal({ listing, onClose, isVerified, user, onVerifyClick }) {
  const qc = useQueryClient()
  const [offerDetails, setOfferDetails] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const mutation = useMutation({
    mutationFn: () => createRequest({ listingId: listing.id, offerDetails }),
    onSuccess: () => { 
      qc.invalidateQueries(['my-requests']); 
      setIsSuccess(true);
    },
  })

  // Check which verification is missing
  const needsPhone = !user?.phoneVerified;
  const needsEmail = !user?.emailVerified;

  if (!isVerified) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Verification Required</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="alert alert-warning" style={{ margin: '16px 0' }}>
          {needsEmail && !needsPhone ? 'Please verify your email address to request cards.' : ''}
          {needsPhone && !needsEmail ? 'Please verify your phone number via WhatsApp to request cards.' : ''}
          {needsEmail && needsPhone ? 'Please verify your email and phone number to request cards.' : ''}
        </div>
        
        {needsPhone ? (
          <button className="vpm-btn-gold" style={{ width: '100%', marginBottom: 12 }} onClick={onVerifyClick}>
            Verify Phone via WhatsApp
          </button>
        ) : null}

        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>Close</button>
      </div>
    </div>
  )

  if (isSuccess) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal vpm-success animate-fade-in" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div className="vpm-success-icon" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <CheckCircle size={56} color="#c9a84c" />
        </div>
        <h3 className="modal-title" style={{ fontSize: 24, marginBottom: 12 }}>Request sent!</h3>
        <p className="vpm-subtitle" style={{ fontSize: 16 }}>The card holder will contact you on WhatsApp if they accept.</p>
        
        <button className="vpm-btn-gold mt-6" style={{ width: '100%', marginTop: 24 }} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )

  const requesterName = user?.name || 'A verified user';
  const commissionStr = listing.commissionPercentage + '%';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Send card request?</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Mini card preview */}
        <div className="req-card-preview" style={{ marginBottom: 16 }}>
          <div className="req-card-bank">{listing.bankName}</div>
          <div className="req-card-meta">{listing.cardType} · {listing.cardNetwork}</div>
          <div className="req-card-masked">XXXX XXXX XXXX {listing.maskedNumber?.slice(-4)}</div>
          <div className="req-card-commission">{listing.commissionPercentage}% commission</div>
        </div>

        <div className="form-group" style={{ marginTop: 16, marginBottom: 20 }}>
          <label className="form-label">What offer do you want to use? *</label>
          <textarea
            className="form-textarea"
            placeholder="e.g. 10% off on Zomato with HDFC Credit Card, max ₹100 discount"
            value={offerDetails}
            onChange={e => setOfferDetails(e.target.value)}
            rows={3}
          />
        </div>

        <div className="vpm-wa-preview" style={{ marginBottom: 24, padding: 12 }}>
          <label className="form-label" style={{ fontSize: 12, marginBottom: 8, color: '#8a8a9a' }}>Message Preview:</label>
          <div className="vpm-wa-bubble" style={{ fontSize: 13, lineHeight: '1.4' }}>
            <p>🪪 *New Card Request — Cardnect*</p>
            <br/>
            <p>Hi {listing.holderName || 'Card Holder'}! Someone wants to use your card.</p>
            <br/>
            <p>💳 *Card:* {listing.cardType} {listing.cardNetwork} (••••{listing.maskedNumber?.slice(-4)})</p>
            <p>🏦 *Bank:* {listing.bankName}</p>
            <p>💰 *Commission:* {commissionStr}</p>
            <br/>
            <p>👤 *Requester:* {requesterName}</p>
            <br/>
            <p>Reply *ACCEPT_...* to accept</p>
            <p>Reply *DECLINE_...* to decline</p>
            <br/>
            <p>You have 24 hours to respond.<br/>— Team Cardnect</p>
          </div>
        </div>

        {mutation.error && <div className="alert alert-danger" style={{ marginTop: 10, marginBottom: 16 }}>{mutation.error.message}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1, border: 'none', background: 'rgba(255,255,255,0.05)' }} onClick={onClose}>Cancel</button>
          <button
            className="vpm-btn-gold"
            style={{ flex: 2, padding: '12px' }}
            disabled={!offerDetails.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <><Loader size={15} className="spin" /> Sending...</> : 'Send Request on WhatsApp →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Premium listing card wrapper ── */
function ListingCard({ listing, onRequest, index }) {
  return (
    <div
      className="lc-wrap"
      style={{ animationDelay: `${index * 60}ms`, padding: 16, display: 'flex', flexDirection: 'column' }}
    >
      <PremiumCard 
        bankName={listing.bankName}
        cardName={listing.cardName}
        cardNetwork={listing.cardNetwork}
        cardType={listing.cardType}
        maskedNumber={`•••• •••• •••• ${listing.maskedNumber?.slice(-4) || 'XXXX'}`}
        holderName={listing.holderName}
      />

      {/* Info + CTA below card */}
      <div className="lc-info" style={{ marginTop: 16 }}>
        <div className="lc-commission">
          <span className="lc-commission-pct">{listing.commissionPercentage}%</span>
          <span className="lc-commission-label">commission</span>
        </div>
        <button
          id={`request-btn-${listing.id}`}
          className="lc-request-btn"
          onClick={() => onRequest(listing)}
        >
          Request <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

/* ── Main view ── */
export default function BrowseOffers() {
  const { user } = useAuthContext()
  const [search,  setSearch]  = useState('')
  const [network, setNetwork] = useState('All')
  const [type,    setType]    = useState('All')
  const [selectedListing, setSelectedListing] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  const isVerified = !!(user?.phoneVerified && user?.emailVerified)

  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: fetchListings,
  })

  const filtered = listings.filter(l => {
    const matchSearch  = !search || l.bankName.toLowerCase().includes(search.toLowerCase())
    const matchNetwork = network === 'All' || l.cardNetwork === network
    const matchType    = type   === 'All' || l.cardType    === type
    return matchSearch && matchNetwork && matchType
  })

  return (
    <div className="bo-page">
      {/* Header */}
      <div className="bo-header">
        <div>
          <h1 className="bo-title">Browse Card Offers</h1>
          <p className="bo-subtitle">Find verified card holders and request access to exclusive discounts</p>
        </div>
        <div className="bo-stats">
          <div className="bo-stat">
            <span className="bo-stat-num">{listings.length}</span>
            <span className="bo-stat-lbl">Active Cards</span>
          </div>
          <div className="bo-stat-sep" />
          <div className="bo-stat">
            <span className="bo-stat-num">{NETWORKS.length - 1}</span>
            <span className="bo-stat-lbl">Networks</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bo-filters">
        <div className="bo-search-wrap">
          <Search size={15} className="bo-search-icon" />
          <input
            className="bo-search-input"
            placeholder="Search by bank or network…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="bo-filter-pills">
          <SlidersHorizontal size={14} style={{ color: 'rgba(255,255,255,0.30)' }} />
          <div className="bo-pill-group">
            {NETWORKS.map(n => (
              <button key={n} className={`bo-pill ${network === n ? 'active' : ''}`} onClick={() => setNetwork(n)}>{n}</button>
            ))}
          </div>
          <div className="bo-pill-sep" />
          <div className="bo-pill-group">
            {TYPES.map(t => (
              <button key={t} className={`bo-pill ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="bo-empty"><Loader size={28} className="spin" /><p>Loading offers…</p></div>
      ) : error ? (
        <div className="alert alert-danger">{error.message || 'Failed to load listings.'}</div>
      ) : filtered.length === 0 ? (
        <div className="bo-empty">
          <CreditCard size={36} strokeWidth={1.2} />
          <h3>No listings found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="bo-grid">
          {filtered.map((l, i) => (
            <ListingCard key={l.id} listing={l} onRequest={setSelectedListing} index={i} />
          ))}
        </div>
      )}

      {selectedListing && (
        <RequestModal
          listing={selectedListing}
          isVerified={isVerified}
          user={user}
          onClose={() => setSelectedListing(null)}
          onVerifyClick={() => {
            setSelectedListing(null);
            setShowVerifyModal(true);
          }}
        />
      )}

      {/* WhatsApp verification modal */}
      <VerifyPhoneModal 
        isOpen={showVerifyModal} 
        onClose={() => setShowVerifyModal(false)}
        userPhone={user?.phone || ''}
        onVerified={() => {
          // You could optionally refetch the user context here
          // For now, rely on standard AuthContext re-fetching or optimistic UI
        }}
      />
    </div>
  )
}
