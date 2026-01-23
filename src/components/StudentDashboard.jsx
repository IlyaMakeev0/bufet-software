import { useState, useEffect } from 'react'

function StudentDashboard({ user }) {
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [balance, setBalance] = useState(user.balance || 1000)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [menuRes, ordersRes, subsRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/orders'),
        fetch('/api/subscriptions')
      ])

      if (menuRes.ok) setMenu(await menuRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (subsRes.ok) setSubscriptions(await subsRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const createOrder = async (menuId) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId })
      })

      if (res.ok) {
        const data = await res.json()
        alert('Заказ создан успешно!')
        setBalance(data.newBalance)
        loadData()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка создания заказа')
      }
    } catch (error) {
      alert('Ошибка подключения к серверу')
    }
  }

  const todayMenu = menu.filter(item => {
    const today = new Date().toISOString().split('T')[0]
    return item.day === today
  })

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">{balance.toFixed(2)} ₽</div>
          <div className="stat-label">Баланс</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Заказов</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-value">{subscriptions.length}</div>
          <div className="stat-label">Абонементов</div>
        </div>
      </div>

      <div className="section">
        <h2>🍽️ Меню на сегодня</h2>
        {todayMenu.length === 0 ? (
          <p>Меню на сегодня пока не доступно</p>
        ) : (
          <div className="menu-grid">
            {todayMenu.map(item => (
              <div key={item.id} className="menu-card">
                <span className={`meal-type ${item.mealType}`}>
                  {item.mealType === 'завтрак' ? '🌅 Завтрак' : 
                   item.mealType === 'обед' ? '🍽️ Обед' : '🍪 Полдник'}
                </span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="price">{item.price} ₽</div>
                <button 
                  className="btn btn-success"
                  onClick={() => createOrder(item.id)}
                  disabled={balance < item.price}
                >
                  {balance < item.price ? 'Недостаточно средств' : 'Заказать'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <h2>📋 Мои заказы</h2>
        {orders.length === 0 ? (
          <p>У вас пока нет заказов</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Блюдо</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
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

      <div className="section">
        <h2>🎫 Мои абонементы</h2>
        {subscriptions.length === 0 ? (
          <p>У вас пока нет абонементов</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Блюдо</th>
                  <th>Период</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.menuName}</td>
                    <td>{sub.startDate} - {sub.endDate}</td>
                    <td>{sub.totalPrice} ₽</td>
                    <td>
                      <span className={`status-badge ${sub.status === 'активен' ? 'active' : 'pending'}`}>
                        {sub.status}
                      </span>
                    </td>
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

export default StudentDashboard
