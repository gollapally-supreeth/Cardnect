import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Loader, CreditCard, Wifi, TrendingUp } from 'lucide-react'
import { fetchMyListings, createListing, updateListing, deleteListing } from '../api/services'
import { useAuthContext } from '../context/AuthContext'
import PremiumCard from '../components/PremiumCard'
import './MyListings.css'

const BANKS    = ['HDFC Bank','ICICI Bank','SBI','Axis Bank','Kotak Bank','Yes Bank','IndusInd Bank','BOB','PNB','Canara Bank','IDFC First','Virtual Bank','Other']
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
    mutationFn: () => isEdit ? updateListing(listing.id, form) : createListing(form),
    onSuccess:  () => { qc.invalidateQueries(['my-listings']); onClose() },
    onError:    e  => setError(e.message),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    const finalBankName = (form.bankName === 'Other' || form.bankName === 'Virtual Bank') 
      ? form.customBankName 
      : form.bankName

    if (!finalBankName) { setError('Bank name is required'); return }
    if (!form.maskedNumber) { setError('Last 4 digits required'); return }
    const n = parseFloat(form.commissionPercentage)
    if (isNaN(n) || n < 0 || n > 100) { setError('Commission must be 0–100'); return }
    setError('')

    const payload = { ...form, bankName: finalBankName }
    mutation.mutate(payload)
  }

  const { user } = useAuthContext();
  const displayBankName = (form.bankName === 'Other' || form.bankName === 'Virtual Bank')
    ? form.customBankName || form.bankName
    : form.bankName;

  const showCustomBank = form.bankName === 'Other' || form.bankName === 'Virtual Bank';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ml-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Card Listing' : 'Add New Listing'}</h3>
          <button className="modal-close btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 20, fontSize: 12 }}>
          Only enter the <strong>last 4 digits</strong> of your card. Never enter full number, CVV, or expiry.
        </div>

        {/* LIVE 3D PREVIEW */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <PremiumCard 
            bankName={displayBankName}
            cardName={form.cardName}
            cardNetwork={form.cardNetwork}
            cardType={form.cardType}
            maskedNumber={form.maskedNumber}
            holderName={user?.name}
          />
        </div>

        <div className="ml-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group" style={{ gridColumn: showCustomBank ? '1' : '1/-1' }}>
            <label className="form-label">Bank Name *</label>
            <select className="form-select" value={form.bankName} onChange={e => set('bankName', e.target.value)}>
              <option value="">Select bank…</option>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          {showCustomBank && (
            <div className="form-group" style={{ gridColumn: '2' }}>
              <label className="form-label">Custom Bank Name *</label>
              <input className="form-input" placeholder="e.g. NeoBank"
                value={form.customBankName}
                onChange={e => set('customBankName', e.target.value)} />
            </div>
          )}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Card Name (Tier)</label>
            <input className="form-input" placeholder="e.g. Platinum, Infinia, Regalia Gold"
              value={form.cardName}
              onChange={e => set('cardName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Network *</label>
            <select className="form-select" value={form.cardNetwork} onChange={e => set('cardNetwork', e.target.value)}>
              {NETWORKS.map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Card Type *</label>
            <select className="form-select" value={form.cardType} onChange={e => set('cardType', e.target.value)}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Last 4 Digits *</label>
            <input className="form-input" placeholder="e.g. 4321" maxLength={4}
              value={form.maskedNumber}
              onChange={e => set('maskedNumber', e.target.value.replace(/\D/g,''))} />
          </div>
          <div className="form-group">
            <label className="form-label">Commission % *</label>
            <input className="form-input" type="number" placeholder="e.g. 2.5" min={0} max={100} step={0.5}
              value={form.commissionPercentage}
              onChange={e => set('commissionPercentage', e.target.value)} />
          </div>
        </div>

        {(error || mutation.error) && (
          <div className="alert alert-danger" style={{ marginTop: 12 }}>
            {error || mutation.error?.message}
          </div>
        )}

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button className="btn btn-secondary" style={{ flex:1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2 }} onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader size={15} className="spin" /> Saving…</> : isEdit ? 'Save Changes' : 'Add Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Card tile ── */
function MyCard({ l, onEdit, onDelete, deleting }) {
  return (
    <div className="ml-card" style={{ animationDelay: `${Math.random() * 120}ms`, padding: 16 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className={`ml-status ${l.active ? 'active' : 'inactive'}`}>
          {l.active ? '● Active' : '○ Inactive'}
        </span>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          <strong>{l.commissionPercentage}%</strong> Comm.
        </div>
      </div>

      <PremiumCard 
        bankName={l.bankName}
        cardName={l.cardName}
        cardNetwork={l.cardNetwork}
        cardType={l.cardType}
        maskedNumber={`•••• •••• •••• ${l.maskedNumber?.slice(-4) || 'XXXX'}`}
        holderName={l.holderName}
      />

      {/* Actions */}
      <div className="ml-actions" style={{ marginTop: 16 }}>
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
  const openEdit = (l) => { setModalData(l);     setModalOpen(true) }

  const active   = listings.filter(l => l.active).length
  const inactive = listings.length - active

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
          <div className="ml-stat-item"><CreditCard size={14} /><span>{listings.length} Total</span></div>
          <div className="ml-stat-item ok"><TrendingUp size={14} /><span>{active} Active</span></div>
          {inactive > 0 && <div className="ml-stat-item muted"><span>{inactive} Inactive</span></div>}
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
