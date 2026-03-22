import api from './axiosClient'

// ---- Auth & Verification ----
export const sendOtp           = (email)   => api.post('/auth/send-otp',  { email }).then(r => r.data)
export const verifyOtp         = (payload) => api.post('/auth/verify-otp', payload).then(r => r.data)
export const registerUser      = (payload) => api.post('/auth/register',   payload).then(r => r.data)
export const loginWithPassword = (payload) => api.post('/auth/login',      payload).then(r => r.data)
export const fetchAuthMe       = ()        => api.get('/auth/me').then(r => r.data)

export const sendWhatsAppOtp   = (phone)   => api.post('/user/whatsapp/send-otp', { phone }).then(r => r.data)
export const verifyWhatsAppOtp = (payload) => api.post('/user/whatsapp/verify-otp', payload).then(r => r.data)


// ---- Card Listings ----
export const fetchListings = (params) => api.get('/listings', { params }).then(r => r.data)
export const createListing = (data) => api.post('/listings', data).then(r => r.data)
export const updateListing = (id, data) => api.put(`/listings/${id}`, data).then(r => r.data)
export const deleteListing = (id) => api.delete(`/listings/${id}`).then(r => r.data)
export const fetchMyListings = () => api.get('/listings/me').then(r => r.data)

// ---- Card Requests ----
export const createRequest = (data) => api.post('/requests', data).then(r => r.data)
export const fetchMyRequests = () => api.get('/requests/me').then(r => r.data)
export const fetchIncomingRequests = () => api.get('/requests/incoming').then(r => r.data)
export const updateRequestStatus = (id, status) => api.patch(`/requests/${id}/status`, { status }).then(r => r.data)

// ---- Notifications ----
export const fetchMyNotifications = () => api.get('/notifications/me').then(r => r.data)
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data)
export const markAllNotificationsRead = () => api.patch('/notifications/read-all').then(r => r.data)

// ---- Users ----
export const getMyProfile = () => api.get('/users/me').then(r => r.data)
