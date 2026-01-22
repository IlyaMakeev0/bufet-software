import { useState } from 'react'

function Orders() {
  const [orders, setOrders] = useState([
    { id: 1, student: 'Иван Иванов', type: 'Завтрак', status: 'pending' },
    { id: 2, student: 'Мария Петрова', type: 'Обед', status: 'pending' }
  ])

  const handleComplete = (id) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: 'completed' } : order
    ))
  }

  return (
    <div className="page">
      <h1>Учет выданных блюд</h1>
      
      <div className="orders-list">
        {orders.filter(o => o.status === 'pending').length === 0 ? (
          <p>Нет ожидающих заказов</p>
        ) : (
          orders.filter(o => o.status === 'pending').map(order => (
            <div key={order.id} className="order-card">
              <h3>{order.student}</h3>
              <p>Тип: {order.type}</p>
              <button onClick={() => handleComplete(order.id)}>
                Выдано
              </button>
            </div>
          ))
        )}
      </div>

      <h2>Выданные сегодня</h2>
      <div className="completed-orders">
        {orders.filter(o => o.status === 'completed').map(order => (
          <div key={order.id} className="order-card completed">
            <h3>{order.student}</h3>
            <p>Тип: {order.type}</p>
            <span className="status">✓ Выдано</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
