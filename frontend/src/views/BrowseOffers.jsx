import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, SlidersHorizontal, CreditCard, Star, ArrowRight, Loader, X, Wifi, Shield } from 'lucide-react'
import { fetchListings, createRequest } from '../api/services'
import { useAuthContext } from '../context/AuthContext'
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
function RequestModal({ listing, onClose, isVerified }) {
  const qc = useQueryClient()
  const [offerDetails, setOfferDetails] = useState('')
  const mutation = useMutation({
    mutationFn: () => createRequest({ listingId: listing.id, offerDetails }),
    onSuccess: () => { qc.invalidateQueries(['my-requests']); onClose() },
  })

  if (!isVerified) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Verification Required</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="alert alert-warning">
          Verify your phone and email before sending card requests. Go to <strong>Profile → Verification</strong>.
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={onClose}>Got it</button>
      </div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal bo-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Request Card Access</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Mini card preview */}
        <div className="req-card-preview">
          <div className="req-card-bank">{listing.bankName}</div>
          <div className="req-card-meta">{listing.cardType} · {listing.cardNetwork}</div>
          <div className="req-card-masked">XXXX XXXX XXXX {listing.maskedNumber?.slice(-4)}</div>
          <div className="req-card-commission">{listing.commissionPercentage}% commission</div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">What offer do you want to use? *</label>
          <textarea
            className="form-textarea"
            placeholder="e.g. 10% off on Zomato with HDFC Credit Card, max ₹100 discount"
            value={offerDetails}
            onChange={e => setOfferDetails(e.target.value)}
            rows={3}
          />
        </div>

        <div className="alert alert-info" style={{ marginTop: 12, fontSize: 12 }}>
          The card holder will contact you via WhatsApp using your verified phone number.
        </div>

        {mutation.error && <div className="alert alert-danger" style={{ marginTop: 10 }}>{mutation.error.message}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={!offerDetails.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <><Loader size={15} className="spin" /> Sending...</> : 'Send Request →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Premium listing card ── */
function ListingCard({ listing, onRequest, index }) {
  return (
    <div
      className="lc-wrap"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Visual credit card */}
      <div className="lc-card">
        {/* Shine overlay */}
        <div className="lc-shine" />

        {/* Top row */}
        <div className="lc-top">
          <div className="lc-bank">{listing.bankName}</div>
          <div className="lc-rating">
            <Star size={12} fill="currentColor" />
            <span>{listing.holderRating?.toFixed(1) || 'New'}</span>
          </div>
        </div>

        {/* Chip + NFC */}
        <div className="lc-chip-row">
          <div className="lc-chip">
            <div className="lc-chip-grid">
              {[...Array(6)].map((_, i) => <span key={i} />)}
            </div>
          </div>
          <Wifi size={18} className="lc-nfc" />
        </div>

        {/* Masked number */}
        <div className="lc-number">
          <span>••••</span><span>••••</span><span>••••</span>
          <span className="lc-last4">{listing.maskedNumber?.slice(-4) || '••••'}</span>
        </div>

        {/* Bottom row */}
        <div className="lc-bottom">
          <div>
            <div className="lc-meta-label">CARD TYPE</div>
            <div className="lc-meta-val">{listing.cardType}</div>
          </div>
          <NetworkBadge name={listing.cardNetwork} />
        </div>
      </div>

      {/* Info + CTA below card */}
      <div className="lc-info">
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
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  )
}
