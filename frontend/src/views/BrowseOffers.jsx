import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, SlidersHorizontal, CreditCard, Star, ArrowRight, Loader, X, Wifi, Shield, MessageCircle, CheckCircle } from 'lucide-react'
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
  const needsEmail = !user?.emailVerified;

  if (!isVerified) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Verification Required</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="alert alert-warning" style={{ margin: '16px 0' }}>
          {needsEmail ? 'Please verify your email address to request cards.' : ''}
        </div>
        


        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>Close</button>
      </div>
    </div>
  )

  if (isSuccess) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal vpm-success animate-fade-in" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '48px 32px' }}>
        <div className="vpm-success-icon" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <div className="success-ring-outer">
            <CheckCircle size={64} color="var(--color-gold)" strokeWidth={1.5} />
          </div>
        </div>
        <h3 className="modal-title" style={{ fontSize: 28, marginBottom: 12, fontWeight: 300, letterSpacing: '1px' }}>Request Sent</h3>
        <p className="vpm-subtitle" style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          The card holder has been notified.<br/>
          Check your notifications for their response.
        </p>
        
        <button className="vpm-btn-gold mt-6" style={{ width: '100%', marginTop: 32, height: 48 }} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )

  const requesterName = user?.name || 'A verified user';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal premium-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Card Request</h3>
            <div className="modal-subtitle">Secure request for {listing.bankName} {listing.cardType}</div>
          </div>
          <button className="modal-close btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="req-body">
          {/* Mini card summary */}
          <div className="req-card-summary">
            <div className="rcs-left">
              <div className="rcs-bank">{listing.bankName}</div>
              <div className="rcs-network">{listing.cardNetwork}</div>
            </div>
            <div className="rcs-right">
              <div className="rcs-commission">{listing.commissionPercentage}%</div>
              <div className="rcs-label">Commission</div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
              What offer do you want to use?
            </label>
            <textarea
              className="form-textarea premium-textarea"
              placeholder="e.g. 10% off on Swiggy with HDFC Credit Card..."
              value={offerDetails}
              onChange={e => setOfferDetails(e.target.value)}
              rows={3}
            />
          </div>

          <div className="req-info-box" style={{ marginTop: 20 }}>
            <Shield size={14} />
            <span>The card holder will see your contact details only after they accept your request.</span>
          </div>

          {mutation.error && <div className="alert alert-danger" style={{ marginTop: 16 }}>{mutation.error.message}</div>}

          <div className="req-footer" style={{ marginTop: 32, display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button
              className="vpm-btn-gold"
              style={{ flex: 2, height: 48, fontSize: 15 }}
              disabled={!offerDetails.trim() || mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? <><Loader size={16} className="spin" /> Sending...</> : 'Send Request'}
            </button>
          </div>
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

  const isVerified = !!user?.emailVerified;

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
          <h1 className="bo-title">Browse Cards</h1>
          <p className="bo-subtitle">Discover verified card holders and request access to exclusive discounts</p>
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
