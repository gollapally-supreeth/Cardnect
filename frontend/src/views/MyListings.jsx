import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Loader, CreditCard } from 'lucide-react'
import { fetchMyListings, createListing, updateListing, deleteListing } from '../api/services'
import './MyListings.css'

const BANKS = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Yes Bank', 'IndusInd Bank', 'BOB', 'PNB', 'Canara Bank', 'IDFC First', 'Other']
const NETWORKS = ['Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners']
const TYPES = ['Credit', 'Debit']

const EMPTY_FORM = { bankName: '', cardNetwork: 'Visa', cardType: 'Credit', maskedNumber: '', commissionPercentage: '' }

function ListingModal({ listing, onClose }) {
  const qc = useQueryClient()
  const isEdit = !!listing?.id
  const [form, setForm] = useState(listing || EMPTY_FORM)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => isEdit ? updateListing(listing.id, form) : createListing(form),
    onSuccess: () => { qc.invalidateQueries(['my-listings']); onClose() },
    onError: e => setError(e.message),
  })

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    if (!form.bankName) return 'Bank name is required'
    if (!form.maskedNumber) return 'Card (masked) number is required'
    const num = parseFloat(form.commissionPercentage)
    if (isNaN(num) || num < 0 || num > 100) return 'Commission must be between 0 and 100'
    return ''
  }

  const handleSubmit = () => {
    const err = validate()
    if (err) { setError(err); return }
    mutation.mutate()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Card Listing' : 'Add New Card Listing'}</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          Only enter the <strong>last 4 digits</strong> of your card. Never enter full card number, CVV, or expiry.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Bank Name *</label>
            <select className="form-select" value={form.bankName} onChange={e => handleChange('bankName', e.target.value)}>
              <option value="">Select bank</option>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Card Network *</label>
              <select className="form-select" value={form.cardNetwork} onChange={e => handleChange('cardNetwork', e.target.value)}>
                {NETWORKS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Card Type *</label>
              <select className="form-select" value={form.cardType} onChange={e => handleChange('cardType', e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Last 4 Digits (displayed as masked) *</label>
            <input
              className="form-input"
              placeholder="e.g., 1234 → shown as XXXX XXXX XXXX 1234"
              maxLength={4}
              value={form.maskedNumber}
              onChange={e => handleChange('maskedNumber', e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Commission Percentage (%) *</label>
            <input
              className="form-input"
              type="number"
              placeholder="e.g., 2.5"
              min={0} max={100} step={0.5}
              value={form.commissionPercentage}
              onChange={e => handleChange('commissionPercentage', e.target.value)}
            />
          </div>
        </div>
        {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}
        {mutation.error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{mutation.error.message}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader size={16} className="spin" /> Saving...</> : isEdit ? 'Save Changes' : 'Add Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyListings() {
  const qc = useQueryClient()
  const [modalData, setModalData] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  })

  const openAdd = () => { setModalData(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (l) => { setModalData(l); setModalOpen(true) }

  return (
    <div>
      <div className="browse-header">
        <div>
          <h1 className="page-title">My Card Listings</h1>
          <p className="page-subtitle">Manage your shared card offers</p>
        </div>
        <button id="add-listing-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Listing
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state"><Loader size={32} className="spin" /></div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CreditCard size={28} /></div>
          <h3>No listings yet</h3>
          <p>Add your first card listing to start earning commissions.</p>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add First Listing</button>
        </div>
      ) : (
        <div className="my-listings-grid">
          {listings.map(l => (
            <div key={l.id} className="my-listing-card">
              <div className="my-listing-header">
                <div>
                  <h3 className="listing-bank">{l.bankName}</h3>
                  <p className="listing-meta">{l.cardType} · {l.cardNetwork}</p>
                </div>
                <span className={`badge ${l.active ? 'badge-success' : 'badge-muted'}`}>
                  {l.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="listing-masked">XXXX XXXX XXXX {l.maskedNumber}</div>
              <div className="badge badge-primary" style={{ marginBottom: 16 }}>{l.commissionPercentage}% commission</div>
              <div className="my-listing-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(l)}>
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { if (window.confirm('Deactivate this listing?')) deleteMutation.mutate(l.id) }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={14} /> {deleteMutation.isPending ? '...' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ListingModal
          listing={modalData}
          onClose={() => { setModalOpen(false); setModalData(null) }}
        />
      )}
    </div>
  )
}
