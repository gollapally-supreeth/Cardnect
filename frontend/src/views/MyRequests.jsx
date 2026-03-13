import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Inbox, MessageCircle, Loader, ArrowRight, RefreshCw } from 'lucide-react'
import { fetchMyRequests, fetchIncomingRequests, updateRequestStatus } from '../api/services'
import './MyRequests.css'

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  ACCEPTED: 'badge-success',
  REJECTED: 'badge-danger',
  COMPLETED: 'badge-primary',
}

function buildWhatsAppLink(phone, requesterName, offerDetails, requestId) {
  if (!phone) return null
  const clean = phone.replace(/\D/g, '').replace(/^0/, '91')
  const message = encodeURIComponent(
    `Hello! I got your card request on Cardnect.\n\nRequest #${requestId?.slice(0, 8)}\nRequester: ${requesterName}\nOffer: ${offerDetails}\n\nPlease contact me to proceed.`
  )
  return `https://wa.me/${clean}?text=${message}`
}

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function RequestRow({ req, isIncoming, onStatusChange }) {
  const waLink = isIncoming
    ? buildWhatsAppLink(req.requesterPhone, req.requesterName, req.offerDetails, req.id)
    : null

  return (
    <tr>
      <td>
        <div className="req-bank">{req.listingBankName}</div>
        <div className="req-sub">{req.listingCardType} · {req.listingCardNetwork}</div>
      </td>
      <td>
        <p style={{ fontSize: 13 }}>{req.offerDetails}</p>
      </td>
      {isIncoming && <td style={{ fontSize: 13 }}>{req.requesterName}</td>}
      <td><span className={`badge ${STATUS_COLORS[req.status] || 'badge-muted'}`}>{req.status}</span></td>
      <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{timeAgo(req.createdAt)}</td>
      <td>
        <div className="req-actions">
          {isIncoming && req.status === 'PENDING' && (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => onStatusChange(req.id, 'ACCEPTED')}>Accept</button>
              <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(req.id, 'REJECTED')}>Reject</button>
            </>
          )}
          {isIncoming && req.status === 'ACCEPTED' && waLink && (
            <a className="btn btn-primary btn-sm" href={waLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          {!isIncoming && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>}
        </div>
      </td>
    </tr>
  )
}

export default function MyRequests() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('sent') // sent | incoming

  const { data: sentReqs = [], isLoading: loadingSent } = useQuery({
    queryKey: ['my-requests'],
    queryFn: fetchMyRequests,
  })
  const { data: incomingReqs = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ['incoming-requests'],
    queryFn: fetchIncomingRequests,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateRequestStatus(id, status),
    onSuccess: () => qc.invalidateQueries(['incoming-requests']),
  })

  const isLoading = tab === 'sent' ? loadingSent : loadingIncoming
  const requests = tab === 'sent' ? sentReqs : incomingReqs

  return (
    <div>
      <div className="browse-header">
        <div>
          <h1 className="page-title">Card Requests</h1>
          <p className="page-subtitle">Track your sent requests and manage incoming ones</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => {
          qc.invalidateQueries(['my-requests'])
          qc.invalidateQueries(['incoming-requests'])
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="req-tabs">
        <button
          className={`req-tab ${tab === 'sent' ? 'active' : ''}`}
          onClick={() => setTab('sent')}
        >
          <Inbox size={15} /> Sent Requests
          {sentReqs.length > 0 && <span className="req-tab-count">{sentReqs.length}</span>}
        </button>
        <button
          className={`req-tab ${tab === 'incoming' ? 'active' : ''}`}
          onClick={() => setTab('incoming')}
        >
          <ArrowRight size={15} /> Incoming Requests
          {incomingReqs.filter(r => r.status === 'PENDING').length > 0 && (
            <span className="req-tab-count pending">{incomingReqs.filter(r => r.status === 'PENDING').length}</span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state"><Loader size={28} className="spin" /></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Inbox size={28} /></div>
          <h3>No {tab === 'sent' ? 'sent' : 'incoming'} requests</h3>
          <p>{tab === 'sent' ? 'Browse offers and request a card to get started.' : 'Requests from other users will appear here when they request your cards.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Card</th>
                <th>Offer Details</th>
                {tab === 'incoming' && <th>Requester</th>}
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <RequestRow
                  key={r.id}
                  req={r}
                  isIncoming={tab === 'incoming'}
                  onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
