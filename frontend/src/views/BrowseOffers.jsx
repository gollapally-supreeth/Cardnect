import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@clerk/react'
import { Search, Filter, CreditCard, Star, MessageCircle, Loader, X } from 'lucide-react'
import { fetchListings, createRequest } from '../api/services'
import './BrowseOffers.css'

const NETWORKS = ['All', 'Visa', 'Mastercard', 'RuPay', 'Amex']
const TYPES = ['All', 'Credit', 'Debit']

function RequestModal({ listing, onClose, isVerified }) {
  const qc = useQueryClient()
  const [offerDetails, setOfferDetails] = useState('')
  const mutation = useMutation({
    mutationFn: () => createRequest({ listingId: listing.id, offerDetails }),
    onSuccess: () => { qc.invalidateQueries(['my-requests']); onClose() }
  })

  if (!isVerified) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Verification Required</h3>
            <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="alert alert-warning">
            You must verify both your phone number and email address before you can request a card.
            Go to your Profile to complete verification.
          </div>
          <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%' }} onClick={onClose}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Request Card</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="request-listing-summary">
          <div className="rlsum-bank">{listing.bankName}</div>
          <div className="rlsum-meta">{listing.cardType} · {listing.cardNetwork}</div>
          <div className="badge badge-primary" style={{ marginTop: 8 }}>{listing.commissionPercentage}% commission</div>
        </div>
        <div className="divider" />
        <div className="form-group">
          <label className="form-label">What offer do you want to use? *</label>
          <textarea
            className="form-textarea"
            placeholder="e.g., 10% off on Zomato with HDFC Credit Card, max discount ₹100"
            value={offerDetails}
            onChange={e => setOfferDetails(e.target.value)}
            rows={4}
          />
        </div>
        <div className="alert alert-info" style={{ marginTop: 16 }}>
          The card holder will contact you via WhatsApp using the phone number linked to your account.
        </div>
        {mutation.error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{mutation.error.message}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={!offerDetails.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <><Loader size={16} className="spin" /> Sending...</> : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ListingCard({ listing, onRequest }) {
  return (
    <div className="listing-card">
      <div className="listing-card-header">
        <div>
          <h3 className="listing-bank">{listing.bankName}</h3>
          <p className="listing-meta">{listing.cardType} · {listing.cardNetwork}</p>
        </div>
        <div className="listing-rating">
          <Star size={13} fill="currentColor" />
          <span>{listing.holderRating?.toFixed(1) || 'New'}</span>
        </div>
      </div>
      <div className="listing-masked">{listing.maskedNumber}</div>
      <div className="listing-card-footer">
        <div className="badge badge-primary">{listing.commissionPercentage}% commission</div>
        <button id={`request-btn-${listing.id}`} className="btn btn-primary btn-sm" onClick={() => onRequest(listing)}>
          <MessageCircle size={14} /> Request
        </button>
      </div>
    </div>
  )
}

export default function BrowseOffers() {
  const { user } = useUser()
  const [search, setSearch] = useState('')
  const [network, setNetwork] = useState('All')
  const [type, setType] = useState('All')
  const [selectedListing, setSelectedListing] = useState(null)

  const isVerified = user?.phoneNumbers?.[0]?.verification?.status === 'verified' &&
                     user?.emailAddresses?.[0]?.verification?.status === 'verified'

  const { data: listings = [], isLoading, error } = useQuery({
    queryKey: ['listings'],
    queryFn: fetchListings,
  })

  const filtered = listings.filter(l => {
    const matchesSearch = !search || l.bankName.toLowerCase().includes(search.toLowerCase())
    const matchesNetwork = network === 'All' || l.cardNetwork === network
    const matchesType = type === 'All' || l.cardType === type
    return matchesSearch && matchesNetwork && matchesType
  })

  return (
    <div>
      <div className="browse-header">
        <div>
          <h1 className="page-title">Browse Card Offers</h1>
          <p className="page-subtitle">Find verified card holders and request access to exclusive discounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="browse-filters card" style={{ marginBottom: 24 }}>
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search by bank name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={15} style={{ color: 'var(--color-text-secondary)' }} />
          <select className="form-select filter-select" value={network} onChange={e => setNetwork(e.target.value)}>
            {NETWORKS.map(n => <option key={n}>{n}</option>)}
          </select>
          <select className="form-select filter-select" value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="empty-state"><Loader size={32} className="spin" /><p>Loading offers...</p></div>
      ) : error ? (
        <div className="alert alert-danger">Failed to load listings. The backend may not be running yet.</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CreditCard size={28} /></div>
          <h3>No listings found</h3>
          <p>Try adjusting your filters or check back later for new card offers.</p>
        </div>
      ) : (
        <div className="listings-grid">
          {filtered.map(l => (
            <ListingCard key={l.id} listing={l} onRequest={setSelectedListing} />
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
