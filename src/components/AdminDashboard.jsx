import { useState, useEffect } from 'react'

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayMeals: 0
  })
  const [users, setUsers] = useState([])
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, usersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/recent-orders')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (ordersRes.ok) setRecentOrders(await ordersRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Всего пользователей</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Всего заказов</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{stats.totalRevenue.toFixed(2)} ₽</div>
          <div className="stat-label">Общая выручка</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">{stats.todayMeals}</div>
          <div className="stat-label">Выдано сегодня</div>
        </div>
      </div>

      <div className="section">
        <h2>👥 Пользователи</h2>
        {users.length === 0 ? (
          <p>Нет зарегистрированных пользователей</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Класс/Должность</th>
                  <th>Баланс</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`status-badge ${u.role}`}>
                        {u.role === 'student' ? 'Ученик' : 
                         u.role === 'chef' ? 'Повар' : 'Администратор'}
                      </span>
                    </td>
                    <td>{u.className || u.position || '-'}</td>
                    <td>{u.role === 'student' ? `${u.balance} ₽` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section">
        <h2>📋 Последние заказы</h2>
        {recentOrders.length === 0 ? (
          <p>Нет заказов</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Блюдо</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.studentName}</td>
                    <td>{order.menuName}</td>
                    <td>{order.price} ₽</td>
                    <td>
                      <span className={`status-badge ${order.status === 'оплачен' ? 'paid' : 'pending'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
