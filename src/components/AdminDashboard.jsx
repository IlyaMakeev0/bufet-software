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
  const [loading, setLoading] = useState(false)
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
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editUserData, setEditUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    className: '',
    balance: '',
    password: ''
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsRes, usersRes, ordersRes, purchaseRes, menuReqRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/recent-orders'),
        fetch('/api/admin/purchase-requests'),
        fetch('/api/admin/menu-requests')
      ])

      if (statsRes.ok) {
        setStats(await statsRes.json())
      } else {
        console.error('Failed to load stats:', await statsRes.text())
      }

      if (usersRes.ok) {
        setUsers(await usersRes.json())
      } else {
        console.error('Failed to load users:', await usersRes.text())
      }

      if (ordersRes.ok) {
        setRecentOrders(await ordersRes.json())
      } else {
        console.error('Failed to load orders:', await ordersRes.text())
      }

      if (purchaseRes.ok) {
        setPurchaseRequests(await purchaseRes.json())
      } else {
        console.error('Failed to load purchase requests:', await purchaseRes.text())
      }

      if (menuReqRes.ok) {
        setMenuRequests(await menuReqRes.json())
      } else {
        console.error('Failed to load menu requests:', await menuReqRes.text())
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      showNotification('Ошибка загрузки данных', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/reports?startDate=${reportDateRange.startDate}&endDate=${reportDateRange.endDate}`)
      if (res.ok) {
        setReports(await res.json())
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка загрузки отчетов', 'error')
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
      showNotification('Ошибка подключения к серверу', 'error')
    } finally {
      setLoading(false)
    }
  }

  const updatePurchaseRequestStatus = async (id, status) => {
    if (!id || !status) return

    try {
      setLoading(true)
      const res = await fetch(`/api/admin/purchase-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        showNotification(`✅ Статус заявки обновлен: ${status}`, 'success')
        await loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка обновления статуса', 'error')
      }
    } catch (error) {
      console.error('Update purchase request error:', error)
      showNotification('Ошибка подключения к серверу', 'error')
    } finally {
      setLoading(false)
    }
  }

  const approveMenuRequest = async () => {
    if (!selectedMenuRequest) return

    try {
      setLoading(true)
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
        await loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка одобрения заявки', 'error')
      }
    } catch (error) {
      console.error('Approve menu request error:', error)
      showNotification('Ошибка подключения к серверу', 'error')
    } finally {
      setLoading(false)
    }
  }

  const rejectMenuRequest = async () => {
    if (!selectedMenuRequest || !rejectionComment.trim()) {
      showNotification('Укажите причину отклонения', 'error')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/admin/menu-requests/${selectedMenuRequest.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminComment: rejectionComment.trim() })
      })

      if (res.ok) {
        showNotification('✅ Заявка отклонена', 'success')
        setShowRejectModal(false)
        setSelectedMenuRequest(null)
        setRejectionComment('')
        await loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка отклонения заявки', 'error')
      }
    } catch (error) {
      console.error('Reject menu request error:', error)
      showNotification('Ошибка подключения к серверу', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openEditUserModal = (user) => {
    setSelectedUser(user)
    setEditUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      className: user.className || '',
      balance: user.balance || '',
      password: ''
    })
    setShowEditUserModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()

    if (!selectedUser) {
      showNotification('Ошибка: пользователь не выбран', 'error')
      return
    }

    try {
      setLoading(true)
      
      // Подготовка данных для отправки
      const updateData = {
        firstName: editUserData.firstName.trim(),
        lastName: editUserData.lastName.trim(),
        email: editUserData.email.trim(),
        phone: editUserData.phone?.trim() || null,
        className: editUserData.className?.trim() || null,
        balance: editUserData.balance ? parseFloat(editUserData.balance) : null,
        password: editUserData.password?.trim() || null
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (res.ok) {
        showNotification('✅ Данные пользователя успешно обновлены', 'success')
        setShowEditUserModal(false)
        setSelectedUser(null)
        setEditUserData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          className: '',
          balance: '',
          password: ''
        })
        await loadData()
      } else {
        const error = await res.json()
        showNotification(`Ошибка: ${error.error || 'Не удалось обновить данные'}`, 'error')
      }
    } catch (error) {
      console.error('Update user error:', error)
      showNotification('Ошибка подключения к серверу', 'error')
    } finally {
      setLoading(false)
    }
  }

  const confirmDeleteUser = (user) => {
    if (user.id === user.id) {
      showNotification('Нельзя удалить свой собственный аккаунт', 'error')
      return
    }
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        showNotification('✅ Пользователь успешно удален', 'success')
        setShowDeleteConfirm(false)
        setUserToDelete(null)
        await loadData()
      } else {
        const error = await res.json()
        showNotification(`Ошибка: ${error.error || 'Не удалось удалить пользователя'}`, 'error')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      showNotification('Ошибка подключения к серверу', 'error')
    } finally {
      setLoading(false)
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
          <div className="admin-stat-icon">USERS</div>
          <div className="admin-stat-value">{stats.totalUsers}</div>
          <div className="admin-stat-label">Всего пользователей</div>
        </div>
        
        <div className="admin-stat-card success">
          <div className="admin-stat-icon">REVENUE</div>
          <div className="admin-stat-value">{(stats.totalRevenue || 0).toFixed(0)} ₽</div>
          <div className="admin-stat-label">Общая выручка</div>
        </div>
        
        <div className="admin-stat-card warning">
          <div className="admin-stat-icon">PURCHASE</div>
          <div className="admin-stat-value">{pendingPurchaseRequests.length}</div>
          <div className="admin-stat-label">Заявок на закупку</div>
        </div>
        
        <div className="admin-stat-card info">
          <div className="admin-stat-icon">MENU</div>
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
          Обзор
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи ({users.length})
        </button>
        <button 
          className={`tab ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          Заявки на закупку ({pendingPurchaseRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'menu-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu-requests')}
        >
          Новые блюда ({pendingMenuRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('reports')
            loadReports()
          }}
        >
          Отчеты
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="section">
          <h2>📊 Последние заказы</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '20px', color: '#90caf9' }}>Загрузка заказов...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">Нет заказов</div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
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
                      <td><strong>{order.studentName}</strong></td>
                      <td>{order.menuName}</td>
                      <td><strong>{order.price.toFixed(2)} ₽</strong></td>
                      <td>
                        <span className={`status-badge ${order.status === 'оплачен' ? 'paid' : 'pending'}`}>
                          {order.status === 'оплачен' ? '✅ Оплачен' : '⏳ Ожидает'}
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
          <h2>👥 Управление пользователями</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '20px', color: '#90caf9' }}>Загрузка пользователей...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <div className="empty-state-text">Нет зарегистрированных пользователей</div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Класс/Должность</th>
                    <th>Баланс</th>
                    <th>Дата регистрации</th>
                    <th style={{ textAlign: 'center' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.firstName} {u.lastName}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`status-badge ${u.role}`}>
                          {u.role === 'student' ? '🎓 Ученик' : 
                           u.role === 'chef' ? '👨‍🍳 Повар' : '👑 Администратор'}
                        </span>
                      </td>
                      <td>{u.className || u.position || '-'}</td>
                      <td>{u.role === 'student' ? `${u.balance.toFixed(2)} ₽` : '-'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openEditUserModal(u)}
                            disabled={loading}
                            title="Редактировать пользователя"
                          >
                            ✏️ Изменить
                          </button>
                          {u.id !== user.id && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => confirmDeleteUser(u)}
                              disabled={loading}
                              title="Удалить пользователя"
                            >
                              🗑️ Удалить
                            </button>
                          )}
                        </div>
                      </td>
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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '20px', color: '#90caf9' }}>Загрузка заявок...</p>
            </div>
          ) : purchaseRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">Нет заявок на закупку</div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Продукт</th>
                    <th>Количество</th>
                    <th>Срочность</th>
                    <th>Создал</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th style={{ textAlign: 'center' }}>Действия</th>
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
                          {request.status === 'ожидает' ? '⏳ Ожидает' :
                           request.status === 'одобрена' ? '✅ Одобрена' : '❌ Отклонена'}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        {request.status === 'ожидает' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updatePurchaseRequestStatus(request.id, 'одобрена')}
                              disabled={loading}
                              title="Одобрить заявку"
                            >
                              ✅
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => updatePurchaseRequestStatus(request.id, 'отклонена')}
                              disabled={loading}
                              title="Отклонить заявку"
                            >
                              ❌
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
          <h2>Заявки на новые блюда</h2>
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
          <h2>Отчеты и аналитика</h2>
          
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
                <h3>Выручка</h3>
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
                <h3>По типам приема пищи</h3>
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
        <div className="modal-overlay" onClick={() => !loading && setShowApproveModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>✅ Одобрить блюдо: {selectedMenuRequest.name}</h2>
            
            <div className="form-group">
              <label>Дата начала *</label>
              <input
                type="date"
                value={approvalData.startDate}
                onChange={(e) => setApprovalData({...approvalData, startDate: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Дата окончания *</label>
              <input
                type="date"
                value={approvalData.endDate}
                onChange={(e) => setApprovalData({...approvalData, endDate: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Комментарий для повара</label>
              <textarea
                value={approvalData.adminComment}
                onChange={(e) => setApprovalData({...approvalData, adminComment: e.target.value})}
                placeholder="Комментарий для повара (необязательно)"
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-success" 
                onClick={approveMenuRequest}
                disabled={loading}
              >
                {loading ? '⏳ Одобрение...' : '✅ Одобрить и добавить в меню'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowApproveModal(false)}
                disabled={loading}
              >
                ❌ Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedMenuRequest && (
        <div className="modal-overlay" onClick={() => !loading && setShowRejectModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>❌ Отклонить блюдо: {selectedMenuRequest.name}</h2>
            
            <div className="form-group">
              <label>Причина отклонения *</label>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Укажите причину отклонения заявки"
                rows="4"
                required
                disabled={loading}
              />
              <small>Повар увидит эту причину</small>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={rejectMenuRequest}
                disabled={!rejectionComment.trim() || loading}
              >
                {loading ? '⏳ Отклонение...' : '❌ Отклонить заявку'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowRejectModal(false)}
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => !loading && setShowEditUserModal(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Редактирование пользователя</h2>
            
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Имя *</label>
                <input
                  type="text"
                  value={editUserData.firstName}
                  onChange={(e) => setEditUserData({...editUserData, firstName: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="Введите имя"
                />
              </div>

              <div className="form-group">
                <label>Фамилия *</label>
                <input
                  type="text"
                  value={editUserData.lastName}
                  onChange={(e) => setEditUserData({...editUserData, lastName: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="Введите фамилию"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                  required
                  disabled={loading}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  value={editUserData.phone}
                  onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})}
                  placeholder="79991234567"
                  disabled={loading}
                />
              </div>

              {selectedUser.role === 'student' && (
                <>
                  <div className="form-group">
                    <label>Класс</label>
                    <input
                      type="text"
                      value={editUserData.className}
                      onChange={(e) => setEditUserData({...editUserData, className: e.target.value})}
                      placeholder="10А"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Баланс (₽)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editUserData.balance}
                      onChange={(e) => setEditUserData({...editUserData, balance: e.target.value})}
                      placeholder="1000"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({...editUserData, password: e.target.value})}
                  placeholder="Оставьте пустым, если не хотите менять"
                  minLength="6"
                  disabled={loading}
                />
                <small>Минимум 6 символов. Оставьте пустым, если не хотите менять пароль.</small>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? '⏳ Сохранение...' : '✅ Сохранить изменения'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditUserModal(false)}
                  disabled={loading}
                >
                  ❌ Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="modal-overlay" onClick={() => !loading && setShowDeleteConfirm(false)}>
          <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Подтверждение удаления</h2>
            
            <div style={{ padding: '20px 0' }}>
              <p style={{ fontSize: '1.1em', marginBottom: '15px' }}>
                Вы действительно хотите удалить пользователя?
              </p>
              
              <div style={{ 
                background: '#fff3cd', 
                border: '2px solid #ffc107', 
                borderRadius: '8px', 
                padding: '15px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                  <strong>Имя:</strong> {userToDelete.firstName} {userToDelete.lastName}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Email:</strong> {userToDelete.email}
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Роль:</strong> {
                    userToDelete.role === 'student' ? 'Ученик' : 
                    userToDelete.role === 'chef' ? 'Повар' : 'Администратор'
                  }
                </p>
              </div>

              <div style={{ 
                background: '#ffebee', 
                border: '2px solid #f44336', 
                borderRadius: '8px', 
                padding: '15px',
                color: '#c62828'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                  ⚠️ Внимание! Это действие нельзя отменить.
                </p>
                <p style={{ margin: '10px 0 0 0' }}>
                  Все данные пользователя будут удалены безвозвратно.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? '⏳ Удаление...' : '🗑️ Да, удалить пользователя'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                ❌ Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
