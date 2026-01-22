import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Orders from './Orders'
import Inventory from './Inventory'
import Requests from './Requests'
import '../../styles/Dashboard.css'

function CookDashboard() {
  const menuItems = [
    { path: '/cook', label: 'Выдача блюд', icon: '🍽️' },
    { path: '/cook/inventory', label: 'Остатки', icon: '📦' },
    { path: '/cook/requests', label: 'Заявки', icon: '📝' }
  ]

  return (
    <div className="dashboard">
      <Sidebar items={menuItems} role="Повар" />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </div>
    </div>
  )
}

export default CookDashboard
