import { useState } from 'react'

function PurchaseRequests() {
  const [requests, setRequests] = useState([
    { id: 1, product: 'Мука', quantity: 20, unit: 'кг', cook: 'Петров И.', status: 'pending' },
    { id: 2, product: 'Молоко', quantity: 15, unit: 'л', cook: 'Сидорова М.', status: 'pending' }
  ])

  const handleApprove = (id) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ))
  }

  const handleReject = (id) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ))
  }

  return (
    <div className="page">
      <h1>Заявки на закупку</h1>
      
      <div className="requests-list">
        {requests.filter(r => r.status === 'pending').map(request => (
          <div key={request.id} className="request-card">
            <h3>{request.product}</h3>
            <p>{request.quantity} {request.unit}</p>
            <p>От: {request.cook}</p>
            <div className="actions">
              <button onClick={() => handleApprove(request.id)} className="approve">
                Одобрить
              </button>
              <button onClick={() => handleReject(request.id)} className="reject">
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PurchaseRequests
