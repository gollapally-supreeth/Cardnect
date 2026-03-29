import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Loader, CreditCard, Shield } from 'lucide-react'
import { fetchMyListings, createListing, updateListing, deleteListing } from '../api/services'
import { useAuthContext } from '../context/AuthContext'
import PremiumCard from '../components/PremiumCard'
import '../components/BlackGlassModal.css' // Deep black aesthetic for listing
import './MyListings.css'

const BANKS    = ['HDFC Bank','ICICI Bank','State Bank of India','Axis Bank','Kotak Bank','Yes Bank','IndusInd Bank','Bank of Baroda','Punjab National Bank','Canara Bank','IDFC First Bank','Virtual Bank','Other']
const NETWORKS = ['Visa','Mastercard','RuPay','Amex','Diners']
const TYPES    = ['Credit','Debit']
const EMPTY    = { bankName:'', customBankName:'', cardName:'', cardNetwork:'Visa', cardType:'Credit', maskedNumber:'', commissionPercentage:'' }

/* ── Add / Edit modal ── */
function ListingModal({ listing, onClose }) {
  const qc     = useQueryClient()
  const isEdit = !!listing?.id
  const [form, setForm]   = useState(listing || EMPTY)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: (variables) => isEdit ? updateListing(listing.id, variables) : createListing(variables),
    onSuccess:  () => { qc.invalidateQueries(['my-listings']); onClose() },
    onError:    e  => setError(e.response?.data?.message || e.message),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    const finalBankName = (form.bankName === 'Other' || form.bankName === 'Virtual Bank') 
      ? form.customBankName 
      : form.bankName

    const cleanMasked = typeof form.maskedNumber === 'string' ? form.maskedNumber.replace(/\D/g, '').slice(-4) : ''

    if (!finalBankName) { setError('Bank name is required'); return }
    if (cleanMasked.length !== 4) { setError('Exactly 4 digits required for the card ending'); return }
    const n = parseFloat(form.commissionPercentage)
    if (isNaN(n) || n < 0 || n > 100) { setError('Commission must be 0–100'); return }
    setError('')

    const payload = {
      bankName: finalBankName,
      cardName: form.cardName || '',
      cardNetwork: form.cardNetwork,
      cardType: form.cardType,
      maskedNumber: cleanMasked,
      commissionPercentage: Number(n)
    }

    mutation.mutate(payload)
  }

  const { user } = useAuthContext();
  const displayBankName = (form.bankName === 'Other' || form.bankName === 'Virtual Bank')
    ? form.customBankName || form.bankName
    : form.bankName;

  const showCustomBank = form.bankName === 'Other' || form.bankName === 'Virtual Bank';

  return (
    <div className="black-glass-overlay" onClick={onClose}>
      <div className="black-glass-content ml-listing-modal" onClick={e => e.stopPropagation()}>
        <button type="button" className="black-glass-close" onClick={onClose} aria-label="Close"><X size={16} /></button>

        <div className="ml-listing-modal-head">
          <div className="ml-listing-modal-icon" aria-hidden>
            <CreditCard size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="ml-listing-modal-title">{isEdit ? 'Edit listing' : 'Add card'}</h1>
            <p className="ml-listing-modal-sub">Preview updates as you type</p>
          </div>
        </div>

        <div className="ml-listing-info" role="note">
          <Shield size={14} className="ml-listing-info-icon" aria-hidden />
          <span><strong>Last 4 digits only</strong> — never full number, CVV, or expiry.</span>
        </div>

        <div className="ml-listing-preview">
          <PremiumCard 
            bankName={displayBankName}
            cardName={form.cardName}
            cardNetwork={form.cardNetwork}
            cardType={form.cardType}
            maskedNumber={form.maskedNumber}
            holderName={user?.name}
          />
        </div>

        <div className="ml-form-grid ml-listing-form" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="bg-input-group" style={{ gridColumn: showCustomBank ? '1' : '1/-1' }}>
            <label className="bg-label">Bank Name *</label>
            <select className="bg-input" value={form.bankName} onChange={e => set('bankName', e.target.value)}>
              <option value="">Select bank…</option>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          {showCustomBank && (
            <div className="bg-input-group" style={{ gridColumn: '2' }}>
              <label className="bg-label">Custom Bank Name *</label>
              <input className="bg-input" placeholder="e.g. NeoBank"
                value={form.customBankName}
                onChange={e => set('customBankName', e.target.value)} />
            </div>
          )}
          <div className="bg-input-group" style={{ gridColumn: '1/-1' }}>
            <label className="bg-label">Card Name (Tier)</label>
            <input className="bg-input" placeholder="e.g. Platinum, Infinia, Regalia Gold"
              value={form.cardName}
              onChange={e => set('cardName', e.target.value)} />
          </div>
          <div className="bg-input-group">
            <label className="bg-label">Network *</label>
            <select className="bg-input" value={form.cardNetwork} onChange={e => set('cardNetwork', e.target.value)}>
              {NETWORKS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="bg-input-group">
            <label className="bg-label">Card Type *</label>
            <select className="bg-input" value={form.cardType} onChange={e => set('cardType', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="bg-input-group">
            <label className="bg-label">Last 4 Digits *</label>
            <input className="bg-input" placeholder="e.g. 4321" maxLength={4}
              value={form.maskedNumber}
              onChange={e => set('maskedNumber', e.target.value.replace(/\D/g,''))} />
          </div>
          <div className="bg-input-group">
            <label className="bg-label">Commission % *</label>
            <input className="bg-input" type="number" placeholder="e.g. 2.5" min={0} max={100} step={0.5}
              value={form.commissionPercentage}
              onChange={e => set('commissionPercentage', e.target.value)} />
          </div>
        </div>

        {(error || mutation.error) && (
          <div className="bg-err ml-listing-err">
            {error || mutation.error?.message}
          </div>
        )}

        <div className="ml-listing-actions">
          <button type="button" className="bg-btn-secondary" onClick={onClose} disabled={mutation.isPending}>Cancel</button>
          <button type="button" className="bg-btn" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader size={16} className="spin" /> Saving…</> : isEdit ? 'Save' : 'Add listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Card tile ── */
function MyCard({ l, onEdit, onDelete, deleting }) {
  return (
    <div className="ml-card" style={{ animationDelay: `${Math.random() * 120}ms` }}>
      
      <div className="ml-card-header">
        <div className="ml-card-comm-tag">
          {l.commissionPercentage}% Commission
        </div>
      </div>

      <div className="ml-card-body">
        <PremiumCard 
          bankName={l.bankName}
          cardName={l.cardName}
          cardNetwork={l.cardNetwork}
          cardType={l.cardType}
          maskedNumber={`XXXX XXXX XXXX ${l.maskedNumber?.slice(-4) || 'XXXX'}`}
          holderName={l.holderName}
        />
      </div>

      {/* Actions */}
      <div className="ml-actions">
        <button className="ml-action-btn edit" onClick={() => onEdit(l)}>
          <Pencil size={14} /> Edit
        </button>
        <button
          className="ml-action-btn delete"
          disabled={deleting}
          onClick={() => { if (window.confirm('Remove this listing?')) onDelete(l.id) }}
        >
          <Trash2 size={14} /> {deleting ? '…' : 'Remove'}
        </button>
      </div>
    </div>
  )
}

export default function MyListings() {
  const qc = useQueryClient()
  const [modalData, setModalData] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data: listings = [], isLoading } = useQuery({ queryKey:['my-listings'], queryFn:fetchMyListings })

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  })

  const openAdd  = ()  => { setModalData(EMPTY); setModalOpen(true) }
  const openEdit = (l) => { 
    const isCustom = !BANKS.includes(l.bankName) && !["Virtual Bank", "Other"].includes(l.bankName);
    
    setModalData({
      id: l.id,
      bankName: isCustom ? 'Other' : l.bankName,
      customBankName: isCustom ? l.bankName : '',
      cardName: l.cardName || '',
      cardNetwork: l.cardNetwork,
      cardType: l.cardType,
      maskedNumber: l.maskedNumber ? l.maskedNumber.replace(/\D/g, '').slice(-4) : '',
      commissionPercentage: l.commissionPercentage
    })
    setModalOpen(true) 
  }

  return (
    <div className="ml-page">
      {/* Header */}
      <div className="ml-header">
        <div>
          <h1 className="page-title">My Card Listings</h1>
          <p className="page-subtitle">Manage your shared card offers</p>
        </div>
        <button id="add-listing-btn" className="btn btn-primary ml-add-btn" onClick={openAdd}>
          <Plus size={16} /> Add Listing
        </button>
      </div>

      {/* Stats bar */}
      {listings.length > 0 && (
        <div className="ml-stats">
          <div className="ml-stat-item"><CreditCard size={14} /><span>{listings.length} Active Listings</span></div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="ml-empty"><Loader size={28} className="spin" /></div>
      ) : listings.length === 0 ? (
        <div className="ml-empty">
          <CreditCard size={40} strokeWidth={1} />
          <h3>No listings yet</h3>
          <p>Add your first card listing to start earning commissions.</p>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add First Listing</button>
        </div>
      ) : (
        <div className="ml-grid">
          {listings.map(l => (
            <MyCard
              key={l.id} l={l}
              onEdit={openEdit}
              onDelete={id => deleteMutation.mutate(id)}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <ListingModal listing={modalData} onClose={() => { setModalOpen(false); setModalData(null) }} />
      )}
    </div>
  )
}
