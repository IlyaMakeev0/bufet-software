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
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [menuRequests, setMenuRequests] = useState([])
  const [reports, setReports] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [notification, setNotification] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedMenuRequest, setSelectedMenuRequest] = useState(null)
  const [approvalData, setApprovalData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    adminComment: ''
  })
  const [rejectionComment, setRejectionComment] = useState('')
  const [reportDateRange, setReportDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, usersRes, ordersRes, purchaseRes, menuReqRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/recent-orders'),
        fetch('/api/admin/purchase-requests'),
        fetch('/api/admin/menu-requests')
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
      if (ordersRes.ok) setRecentOrders(await ordersRes.json())
      if (purchaseRes.ok) setPurchaseRequests(await purchaseRes.json())
      if (menuReqRes.ok) setMenuRequests(await menuReqRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const loadReports = async () => {
    try {
      const res = await fetch(`/api/admin/reports?startDate=${reportDateRange.startDate}&endDate=${reportDateRange.endDate}`)
      if (res.ok) {
        setReports(await res.json())
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    }
  }

  const updatePurchaseRequestStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/purchase-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        showNotification(`✅ Статус заявки обновлен: ${status}`, 'success')
        loadData()
      } else {
        showNotification('Ошибка обновления статуса', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const approveMenuRequest = async () => {
    try {
      const res = await fetch(`/api/admin/menu-requests/${selectedMenuRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData)
      })

      if (res.ok) {
        showNotification('✅ Заявка одобрена! Блюдо добавлено в меню', 'success')
        setShowApproveModal(false)
        setSelectedMenuRequest(null)
        setApprovalData({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          adminComment: ''
        })
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка одобрения заявки', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const rejectMenuRequest = async () => {
    try {
      const res = await fetch(`/api/admin/menu-requests/${selectedMenuRequest.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminComment: rejectionComment })
      })

      if (res.ok) {
        showNotification('Заявка отклонена', 'success')
        setShowRejectModal(false)
        setSelectedMenuRequest(null)
        setRejectionComment('')
        loadData()
      } else {
        showNotification('Ошибка отклонения заявки', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const pendingMenuRequests = menuRequests.filter(r => r.status === 'ожидает')
  const pendingPurchaseRequests = purchaseRequests.filter(r => r.status === 'ожидает')

  return (
    <div className="dashboard-content">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-value">{stats.totalUsers}</div>
          <div className="admin-stat-label">Всего пользователей</div>
        </div>
        
        <div className="admin-stat-card success">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-value">{(stats.totalRevenue || 0).toFixed(0)} ₽</div>
          <div className="admin-stat-label">Общая выручка</div>
        </div>
        
        <div className="admin-stat-card warning">
          <div className="admin-stat-icon">🛒</div>
          <div className="admin-stat-value">{pendingPurchaseRequests.length}</div>
          <div className="admin-stat-label">Заявок на закупку</div>
        </div>
        
        <div className="admin-stat-card info">
          <div className="admin-stat-icon">🍽️</div>
          <div className="admin-stat-value">{pendingMenuRequests.length}</div>
          <div className="admin-stat-label">Новых блюд</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Обзор
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Пользователи ({users.length})
        </button>
        <button 
          className={`tab ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          🛒 Заявки на закупку ({pendingPurchaseRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'menu-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu-requests')}
        >
          🍽️ Новые блюда ({pendingMenuRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('reports')
            loadReports()
          }}
        >
          📈 Отчеты
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
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
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
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
                    <th>Дата регистрации</th>
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
                      <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Purchase Requests Tab */}
      {activeTab === 'purchase' && (
        <div className="section">
          <h2>🛒 Заявки на закупку</h2>
          {purchaseRequests.length === 0 ? (
            <p>Нет заявок на закупку</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Продукт</th>
                    <th>Количество</th>
                    <th>Срочность</th>
                    <th>Создал</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.map(request => (
                    <tr key={request.id} className={request.urgency === 'срочная' ? 'urgent-row' : ''}>
                      <td><strong>{request.item}</strong></td>
                      <td>{request.quantity} {request.unit}</td>
                      <td>
                        <span className={`urgency-badge ${request.urgency}`}>
                          {request.urgency === 'срочная' ? '🔴 Срочная' : 
                           request.urgency === 'высокая' ? '🟠 Высокая' : '🟢 Обычная'}
                        </span>
                      </td>
                      <td>{request.createdByName}</td>
                      <td>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        {request.status === 'ожидает' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updatePurchaseRequestStatus(request.id, 'одобрена')}
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updatePurchaseRequestStatus(request.id, 'отклонена')}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Menu Requests Tab */}
      {activeTab === 'menu-requests' && (
        <div className="section">
          <h2>🍽️ Заявки на новые блюда</h2>
          {menuRequests.length === 0 ? (
            <p>Нет заявок на добавление блюд</p>
          ) : (
            <div className="menu-requests-grid">
              {menuRequests.map(request => (
                <div key={request.id} className={`menu-request-card status-${request.status}`}>
                  <div className="menu-request-header">
                    <h3>{request.name}</h3>
                    <span className={`status-badge ${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  
                  <div className="menu-request-details">
                    <p><strong>Описание:</strong> {request.description}</p>
                    <p><strong>Цена:</strong> {request.price} ₽</p>
                    <p><strong>Тип:</strong> <span className={`meal-type ${request.mealType}`}>{request.mealType}</span></p>
                    <p><strong>Создал:</strong> {request.createdByName}</p>
                    
                    <div style={{ marginTop: '15px' }}>
                      <strong>Состав:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {request.ingredients.map((ing, idx) => (
                          <li key={idx}>{ing.name}: {ing.quantity} {ing.unit}</li>
                        ))}
                      </ul>
                    </div>

                    {request.adminComment && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        background: '#fff3cd', 
                        borderRadius: '8px',
                        borderLeft: '4px solid #ffc107'
                      }}>
                        <strong>Комментарий:</strong>
                        <p style={{ margin: '5px 0 0 0' }}>{request.adminComment}</p>
                      </div>
                    )}
                  </div>
                  
                  {request.status === 'ожидает' && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button
                        className="btn btn-success"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setSelectedMenuRequest(request)
                          setShowApproveModal(true)
                        }}
                      >
                        ✓ Одобрить
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setSelectedMenuRequest(request)
                          setShowRejectModal(true)
                        }}
                      >
                        ✕ Отклонить
                      </button>
                    </div>
                  )}
                  
                  <div className="menu-request-footer">
                    <small>Создано: {new Date(request.createdAt).toLocaleDateString('ru-RU')}</small>
                    {request.reviewedAt && (
                      <small>Рассмотрено: {new Date(request.reviewedAt).toLocaleDateString('ru-RU')}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="section">
          <h2>📈 Отчеты и аналитика</h2>
          
          <div className="date-range-picker">
            <label>Период:</label>
            <input
              type="date"
              value={reportDateRange.startDate}
              onChange={(e) => setReportDateRange({...reportDateRange, startDate: e.target.value})}
            />
            <span>—</span>
            <input
              type="date"
              value={reportDateRange.endDate}
              onChange={(e) => setReportDateRange({...reportDateRange, endDate: e.target.value})}
            />
            <button className="btn btn-primary" onClick={loadReports}>
              Обновить
            </button>
          </div>

          {reports && (
            <div className="reports-grid">
              <div className="report-card">
                <h3>💰 Выручка</h3>
                <div className="report-item">
                  <span className="report-item-label">Всего заказов:</span>
                  <span className="report-item-value">{reports.revenue.totalOrders}</span>
                </div>
                <div className="report-item">
                  <span className="report-item-label">Общая выручка:</span>
                  <span className="report-item-value">{(reports.revenue.totalRevenue || 0).toFixed(2)} ₽</span>
                </div>
              </div>

              <div className="report-card">
                <h3>🍽️ По типам приема пищи</h3>
                {reports.mealsByType.map(meal => (
                  <div key={meal.mealType} className="report-item">
                    <span className="report-item-label">{meal.mealType}:</span>
                    <span className="report-item-value">{meal.count} ({meal.revenue.toFixed(0)} ₽)</span>
                  </div>
                ))}
              </div>

              <div className="report-card">
                <h3>⭐ Топ-10 блюд</h3>
                {reports.topDishes.slice(0, 5).map((dish, idx) => (
                  <div key={idx} className="report-item">
                    <span className="report-item-label">{dish.name}:</span>
                    <span className="report-item-value">{dish.ordersCount} заказов</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedMenuRequest && (
        <div className="modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✓ Одобрить блюдо: {selectedMenuRequest.name}</h2>
            
            <div className="form-group">
              <label>Дата начала *</label>
              <input
                type="date"
                value={approvalData.startDate}
                onChange={(e) => setApprovalData({...approvalData, startDate: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Дата окончания *</label>
              <input
                type="date"
                value={approvalData.endDate}
                onChange={(e) => setApprovalData({...approvalData, endDate: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Комментарий</label>
              <textarea
                value={approvalData.adminComment}
                onChange={(e) => setApprovalData({...approvalData, adminComment: e.target.value})}
                placeholder="Комментарий для повара (необязательно)"
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-success" onClick={approveMenuRequest}>
                Одобрить и добавить в меню
              </button>
              <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedMenuRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>✕ Отклонить блюдо: {selectedMenuRequest.name}</h2>
            
            <div className="form-group">
              <label>Причина отклонения *</label>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Укажите причину отклонения заявки"
                rows="4"
                required
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={rejectMenuRequest}
                disabled={!rejectionComment}
              >
                Отклонить заявку
              </button>
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
