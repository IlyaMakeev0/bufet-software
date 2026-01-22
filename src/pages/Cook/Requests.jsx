import { useState } from 'react'

function Requests() {
  const [requests, setRequests] = useState([])
  const [newRequest, setNewRequest] = useState({ product: '', quantity: '', unit: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const request = {
      id: Date.now(),
      ...newRequest,
      status: 'pending',
      date: new Date()
    }
    setRequests([...requests, request])
    setNewRequest({ product: '', quantity: '', unit: '' })
  }

  return (
    <div className="page">
      <h1>Заявки на закупку</h1>
      
      <form onSubmit={handleSubmit} className="request-form">
        <h2>Создать заявку</h2>
        <input
          type="text"
          placeholder="Название продукта"
          value={newRequest.product}
          onChange={(e) => setNewRequest({ ...newRequest, product: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Количество"
          value={newRequest.quantity}
          onChange={(e) => setNewRequest({ ...newRequest, quantity: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Единица измерения (кг, л, шт)"
          value={newRequest.unit}
          onChange={(e) => setNewRequest({ ...newRequest, unit: e.target.value })}
          required
        />
        <button type="submit">Отправить заявку</button>
      </form>

      <div className="requests-list">
        <h2>Мои заявки</h2>
        {requests.length === 0 ? (
          <p>Нет активных заявок</p>
        ) : (
          requests.map(request => (
            <div key={request.id} className="request-card">
              <h3>{request.product}</h3>
              <p>{request.quantity} {request.unit}</p>
              <span className={`status ${request.status}`}>
                {request.status === 'pending' ? 'На рассмотрении' : 'Одобрено'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Requests
