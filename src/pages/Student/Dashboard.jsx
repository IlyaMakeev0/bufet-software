import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Menu from './Menu'
import Payment from './Payment'
import Profile from './Profile'
import Reviews from './Reviews'
import '../../styles/Dashboard.css'

function StudentDashboard() {
  const menuItems = [
    { path: '/student', label: 'Меню', icon: '🍽️' },
    { path: '/student/payment', label: 'Оплата', icon: '💳' },
    { path: '/student/profile', label: 'Профиль', icon: '👤' },
    { path: '/student/reviews', label: 'Отзывы', icon: '⭐' }
  ]

  return (
    <div className="dashboard">
      <Sidebar items={menuItems} role="Ученик" />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </div>
    </div>
  )
}

export default StudentDashboard
