import { Routes, Route } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import DashboardLayout from '../components/DashboardLayout'
import BrowseOffers from '../views/BrowseOffers'
import MyListings from '../views/MyListings'
import MyRequests from '../views/MyRequests'
import Profile from '../views/Profile'

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardLayout>
        <Routes>
          <Route index element={<BrowseOffers />} />
          <Route path="my-listings" element={<MyListings />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </DashboardLayout>
    </AppProvider>
  )
}
