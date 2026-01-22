import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Statistics from './Statistics'
import PurchaseRequests from './PurchaseRequests'
import Reports from './Reports'
import '../../styles/Dashboard.css'

function AdminDashboard() {
  const menuItems = [
    { path: '/admin', label: 'Статистика', icon: '📊' },
    { path: '/admin/requests', label: 'Заявки на закупку', icon: '📝' },
    { path: '/admin/reports', label: 'Отчеты', icon: '📄' }
  ]

  return (
    <div className="dashboard">
      <Sidebar items={menuItems} role="Администратор" />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Statistics />} />
          <Route path="/requests" element={<PurchaseRequests />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
