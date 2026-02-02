import { useState, useEffect } from 'react'

function ChefDashboard({ user }) {
  const [pendingMeals, setPendingMeals] = useState([])
  const [issuedToday, setIssuedToday] = useState([])
  const [inventory, setInventory] = useState([])
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [students, setStudents] = useState([])
  const [inventoryLog, setInventoryLog] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [menuRequests, setMenuRequests] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [notification, setNotification] = useState(null)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showMenuRequestModal, setShowMenuRequestModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null)
  const [searchStudent, setSearchStudent] = useState('')
  const [searchInventory, setSearchInventory] = useState('')
  const [newInventoryItem, setNewInventoryItem] = useState({ name: '', quantity: '', unit: 'кг', minQuantity: 10 })
  const [newPurchaseRequest, setNewPurchaseRequest] = useState({ item: '', quantity: '', unit: 'кг', urgency: 'обычная' })
  const [newMenuRequest, setNewMenuRequest] = useState({
    name: '',
    description: '',
    price: '',
    mealType: 'обед',
    ingredients: []
  })
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: 'кг' })
  const [stats, setStats] = useState({
    breakfastIssued: 0,
    lunchIssued: 0,
    snackIssued: 0,
    totalToday: 0
  })
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [qrScanResult, setQrScanResult] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Показать уведомление
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pendingRes, issuedRes, inventoryRes, purchaseRes, studentsRes, lowStockRes, menuRequestsRes, notificationsRes] = await Promise.all([
        fetch('/api/chef/pending-meals'),
        fetch('/api/chef/issued-today'),
        fetch('/api/chef/inventory'),
        fetch('/api/chef/purchase-requests'),
        fetch('/api/chef/students'),
        fetch('/api/chef/inventory/low-stock'),
        fetch('/api/chef/menu-requests'),
        fetch('/api/chef/notifications')
      ])

      if (pendingRes.ok) setPendingMeals(await pendingRes.json())
      if (issuedRes.ok) {
        const issued = await issuedRes.json()
        setIssuedToday(issued)
        
        // Подсчет статистики
        const breakfast = issued.filter(m => m.mealType === 'завтрак').length
        const lunch = issued.filter(m => m.mealType === 'обед').length
        const snack = issued.filter(m => m.mealType === 'полдник').length
        
        setStats({
          breakfastIssued: breakfast,
          lunchIssued: lunch,
          snackIssued: snack,
          totalToday: issued.length
        })
      }
      if (inventoryRes.ok) setInventory(await inventoryRes.json())
      if (purchaseRes.ok) setPurchaseRequests(await purchaseRes.json())
      if (studentsRes.ok) setStudents(await studentsRes.json())
      if (lowStockRes.ok) setLowStock(await lowStockRes.json())
      if (menuRequestsRes.ok) setMenuRequests(await menuRequestsRes.json())
      if (notificationsRes.ok) {
        const notifs = await notificationsRes.json()
        setNotifications(notifs)
        setUnreadCount(notifs.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const issueMeal = async (mealId) => {
    try {
      const res = await fetch('/api/chef/issue-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId })
      })

      if (res.ok) {
        showNotification('Блюдо выдано успешно! Ингредиенты списаны со склада', 'success')
        loadData()
      } else {
        const error = await res.json()
        if (error.details) {
          showNotification(`${error.error}:\n${error.details.join('\n')}`, 'error')
        } else {
          showNotification(error.error || 'Ошибка выдачи блюда', 'error')
        }
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const addInventoryItem = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/chef/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInventoryItem.name,
          quantity: newInventoryItem.quantity,
          unit: newInventoryItem.unit,
          minQuantity: newInventoryItem.minQuantity
        })
      })

      if (res.ok) {
        showNotification('Продукт добавлен на склад', 'success')
        setShowInventoryModal(false)
        setNewInventoryItem({ name: '', quantity: '', unit: 'кг', minQuantity: 10 })
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка добавления', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const updateInventoryQuantity = async (id, newQuantity) => {
    try {
      const res = await fetch(`/api/chef/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (res.ok) {
        showNotification('Количество обновлено', 'success')
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка обновления', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const deleteInventoryItem = async (id) => {
    try {
      const res = await fetch(`/api/chef/inventory/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        showNotification('Продукт удален', 'success')
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка удаления', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const createPurchaseRequest = async (e) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/chef/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPurchaseRequest)
      })

      if (res.ok) {
        showNotification('Заявка на закупку создана', 'success')
        setShowPurchaseModal(false)
        setNewPurchaseRequest({ item: '', quantity: '', unit: 'кг', urgency: 'обычная' })
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка создания заявки', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const getSpecialRequirements = (meal) => {
    const requirements = []
    if (meal.allergies) requirements.push(`! Аллергии: ${meal.allergies}`)
    if (meal.foodPreferences) requirements.push(`♥ Предпочтения: ${meal.foodPreferences}`)
    return requirements
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  const viewInventoryLog = async (item) => {
    setSelectedInventoryItem(item)
    setShowLogModal(true)
    
    try {
      const res = await fetch(`/api/chef/inventory-log?inventoryId=${item.id}&limit=20`)
      if (res.ok) {
        setInventoryLog(await res.json())
      }
    } catch (error) {
      console.error('Failed to load inventory log:', error)
    }
  }

  const filteredStudents = students.filter(student => {
    const searchLower = searchStudent.toLowerCase()
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.className.toLowerCase().includes(searchLower)
    )
  })

  const filteredInventory = inventory.filter(item => {
    const searchLower = searchInventory.toLowerCase()
    return item.name.toLowerCase().includes(searchLower)
  })

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity) {
      showNotification('Заполните все поля ингредиента', 'error')
      return
    }

    setNewMenuRequest({
      ...newMenuRequest,
      ingredients: [...newMenuRequest.ingredients, { ...newIngredient }]
    })
    setNewIngredient({ name: '', quantity: '', unit: 'кг' })
  }

  const removeIngredient = (index) => {
    setNewMenuRequest({
      ...newMenuRequest,
      ingredients: newMenuRequest.ingredients.filter((_, i) => i !== index)
    })
  }

  const createMenuRequest = async (e) => {
    e.preventDefault()

    if (newMenuRequest.ingredients.length === 0) {
      showNotification('Добавьте хотя бы один ингредиент', 'error')
      return
    }

    try {
      const res = await fetch('/api/chef/menu-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMenuRequest)
      })

      if (res.ok) {
        showNotification('Заявка на добавление блюда отправлена администратору', 'success')
        setShowMenuRequestModal(false)
        setNewMenuRequest({
          name: '',
          description: '',
          price: '',
          mealType: 'обед',
          ingredients: []
        })
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка создания заявки', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const handleQRScan = async (numericCode) => {
    if (isScanning) return
    setIsScanning(true)

    try {
      // Валидация числового кода
      const validateRes = await fetch('/api/qrcode/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: numericCode })
      })

      if (validateRes.ok) {
        const data = await validateRes.json()
        setQrScanResult(data.order)
        showNotification('✅ Код действителен!', 'success')
      } else {
        const error = await validateRes.json()
        showNotification(error.error || 'Недействительный код', 'error')
        setQrScanResult(null)
      }
    } catch (error) {
      showNotification('Ошибка проверки кода', 'error')
      setQrScanResult(null)
    } finally {
      setIsScanning(false)
    }
  }

  const issueOrderByQR = async () => {
    if (!qrScanResult) return

    try {
      const res = await fetch(`/api/qrcode/issue/${qrScanResult.id}`, {
        method: 'POST'
      })

      if (res.ok) {
        showNotification('✅ Заказ успешно выдан!', 'success')
        setShowQRScanner(false)
        setQrScanResult(null)
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка выдачи заказа', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const handleManualQRInput = (e) => {
    e.preventDefault()
    const input = e.target.elements.qrInput.value.trim()
    if (input) {
      handleQRScan(input)
      e.target.reset()
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/chef/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      if (res.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const res = await fetch('/api/chef/notifications/read-all', {
        method: 'PUT'
      })

      if (res.ok) {
        showNotification('Все уведомления отмечены как прочитанные', 'success')
        loadData()
      }
    } catch (error) {
      showNotification('Ошибка обновления уведомлений', 'error')
    }
  }

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

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">PENDING</div>
          <div className="stat-value">{pendingMeals.length}</div>
          <div className="stat-label">Ожидают выдачи</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">BREAKFAST</div>
          <div className="stat-value">{stats.breakfastIssued}</div>
          <div className="stat-label">Завтраков выдано</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">LUNCH</div>
          <div className="stat-value">{stats.lunchIssued}</div>
          <div className="stat-label">Обедов выдано</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">SNACK</div>
          <div className="stat-value">{stats.snackIssued}</div>
          <div className="stat-label">Полдников выдано</div>
        </div>

        <div className={`stat-card ${lowStock.length > 0 ? 'warning' : ''}`}>
          <div className="stat-icon">LOW STOCK</div>
          <div className="stat-value">{lowStock.length}</div>
          <div className="stat-label">Мало на складе</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="stat-icon">CODE</div>
          <div className="stat-label" style={{ color: '#fff', marginTop: '10px' }}>Ввод кода заказа</div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowQRScanner(true)}
            style={{ marginTop: '10px', fontSize: '14px', background: '#fff', color: '#667eea' }}
          >
            🔢 Ввести код
          </button>
        </div>

        <div className={`stat-card ${unreadCount > 0 ? 'notification-active' : ''}`} style={{ 
          background: unreadCount > 0 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          cursor: 'pointer'
        }}
        onClick={() => setShowNotifications(true)}
        >
          <div className="stat-icon">BELL</div>
          <div className="stat-value">{unreadCount}</div>
          <div className="stat-label" style={{ color: unreadCount > 0 ? '#fff' : '#333' }}>
            {unreadCount > 0 ? 'Новые уведомления' : 'Уведомления'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Ожидают выдачи ({pendingMeals.length})
        </button>
        <button 
          className={`tab ${activeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          Выдано сегодня ({issuedToday.length})
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Ученики ({students.length})
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Склад ({inventory.length})
        </button>
        <button 
          className={`tab ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          Заявки на закупку ({purchaseRequests.length})
        </button>
        <button 
          className={`tab ${activeTab === 'menu-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu-requests')}
        >
          Новые блюда ({menuRequests.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="section">
          <h2>Ожидают выдачи</h2>
          {pendingMeals.length === 0 ? (
            <p>Нет блюд, ожидающих выдачи</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ученик</th>
                    <th>Класс</th>
                    <th>Блюдо</th>
                    <th>Тип</th>
                    <th>Особые требования</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMeals.map(meal => {
                    const requirements = getSpecialRequirements(meal)
                    return (
                      <tr key={meal.id} className={requirements.length > 0 ? 'special-requirements' : ''}>
                        <td>{meal.studentName}</td>
                        <td>{meal.className}</td>
                        <td>{meal.menuName}</td>
                        <td>
                          <span className={`meal-type ${meal.mealType}`}>
                            {meal.mealType}
                          </span>
                        </td>
                        <td>
                          {requirements.length > 0 ? (
                            <div className="requirements-list">
                              {requirements.map((req, idx) => (
                                <div key={idx} className="requirement-badge">{req}</div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#95a5a6' }}>Нет</span>
                          )}
                        </td>
                        <td>
                          <button 
                            className="btn btn-success"
                            onClick={() => issueMeal(meal.id)}
                          >
                            Выдать
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'issued' && (
        <div className="section">
          <h2>Выдано сегодня</h2>
          {issuedToday.length === 0 ? (
            <p>Сегодня еще ничего не выдано</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Ученик</th>
                    <th>Класс</th>
                    <th>Блюдо</th>
                    <th>Тип</th>
                    <th>Время</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedToday.map(meal => (
                    <tr key={meal.id}>
                      <td>{meal.studentName}</td>
                      <td>{meal.className}</td>
                      <td>{meal.menuName}</td>
                      <td>
                        <span className={`meal-type ${meal.mealType}`}>
                          {meal.mealType}
                        </span>
                      </td>
                      <td>{new Date(meal.issuedAt).toLocaleTimeString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>База учеников</h2>
            <input
              type="text"
              placeholder="Поиск по имени или классу..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                width: '300px',
                fontSize: '14px'
              }}
            />
          </div>
          
          {filteredStudents.length === 0 ? (
            <p>Нет учеников в базе</p>
          ) : (
            <div className="students-grid">
              {filteredStudents.map(student => (
                <div key={student.id} className="student-card">
                  <div className="student-header">
                    <div className="student-avatar">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="student-info">
                      <h3>{student.firstName} {student.lastName}</h3>
                      <span className="student-class">{student.className}</span>
                    </div>
                  </div>
                  
                  <div className="student-details">
                    {student.allergies && (
                      <div className="student-detail allergies">
                        <span className="detail-icon">!</span>
                        <div>
                          <strong>Аллергии:</strong>
                          <p>{student.allergies}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.foodPreferences && (
                      <div className="student-detail preferences">
                        <span className="detail-icon">♥</span>
                        <div>
                          <strong>Предпочтения:</strong>
                          <p>{student.foodPreferences}</p>
                        </div>
                      </div>
                    )}
                    
                    {!student.allergies && !student.foodPreferences && (
                      <div className="student-detail no-restrictions">
                        <span className="detail-icon">✓</span>
                        <p>Нет ограничений</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => viewStudentDetails(student)}
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Подробнее
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Склад продуктов</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Поиск продукта..."
                value={searchInventory}
                onChange={(e) => setSearchInventory(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  width: '250px',
                  fontSize: '14px'
                }}
              />
              <button 
                className="btn btn-primary"
                onClick={() => setShowInventoryModal(true)}
              >
                + Добавить продукт
              </button>
            </div>
          </div>

          {lowStock.length > 0 && (
            <div style={{ 
              background: '#fff3cd', 
              border: '2px solid #ffc107', 
              borderRadius: '12px', 
              padding: '15px', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Требуют пополнения ({lowStock.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {lowStock.map(item => (
                  <span 
                    key={item.id} 
                    style={{
                      background: '#fff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      border: '1px solid #ffc107'
                    }}
                  >
                    {item.name}: {item.quantity} {item.unit} (мин: {item.min_quantity})
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {filteredInventory.length === 0 ? (
            <p>Склад пуст</p>
          ) : (
            <div className="inventory-grid">
              {filteredInventory.map(item => {
                const isLow = item.quantity <= item.min_quantity
                const percentage = (item.quantity / item.min_quantity) * 100
                
                return (
                  <div key={item.id} className={`inventory-card ${isLow ? 'low-stock' : ''}`}>
                    <div className="inventory-header">
                      <h3>{item.name}</h3>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          className="btn-icon btn-info"
                          onClick={() => viewInventoryLog(item)}
                          title="История"
                        >
                          LOG
                        </button>
                        <button 
                          className="btn-icon btn-danger"
                          onClick={() => deleteInventoryItem(item.id)}
                          title="Удалить"
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                    
                    <div className="inventory-quantity">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInventoryQuantity(item.id, parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                      />
                      <span className="unit">{item.unit}</span>
                    </div>
                    
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '12px', 
                        color: '#7f8c8d',
                        marginBottom: '5px'
                      }}>
                        <span>Минимум: {item.min_quantity} {item.unit}</span>
                        <span>{percentage.toFixed(0)}%</span>
                      </div>
                      <div style={{ 
                        height: '6px', 
                        background: '#ecf0f1', 
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${Math.min(percentage, 100)}%`,
                          background: isLow ? '#e74c3c' : percentage < 150 ? '#f39c12' : '#27ae60',
                          transition: 'all 0.3s'
                        }} />
                      </div>
                    </div>
                    
                    {isLow && (
                      <div className="low-stock-badge">
                        Мало на складе
                      </div>
                    )}
                    
                    <div className="inventory-date">
                      Обновлено: {new Date(item.updated_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'purchase' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Заявки на закупку</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowPurchaseModal(true)}
            >
              + Создать заявку
            </button>
          </div>

          {lowStock.length > 0 && (
            <div style={{ 
              background: '#e8f5e9', 
              border: '2px solid #4caf50', 
              borderRadius: '12px', 
              padding: '15px', 
              marginBottom: '20px' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Рекомендуем заказать</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#558b2f' }}>
                Следующие продукты заканчиваются на складе:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {lowStock.map(item => (
                  <button
                    key={item.id}
                    className="btn btn-sm btn-success"
                    onClick={() => {
                      setNewPurchaseRequest({
                        item: item.name,
                        quantity: (item.min_quantity * 2).toString(),
                        unit: item.unit,
                        urgency: item.quantity < item.min_quantity * 0.5 ? 'срочная' : 'высокая'
                      })
                      setShowPurchaseModal(true)
                    }}
                    style={{ fontSize: '13px' }}
                  >
                    + {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
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
                    <th>Статус</th>
                    <th>Дата создания</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseRequests.map(request => (
                    <tr key={request.id} className={request.urgency === 'срочная' ? 'urgent-row' : ''}>
                      <td><strong>{request.item}</strong></td>
                      <td>{request.quantity} {request.unit}</td>
                      <td>
                        <span className={`urgency-badge ${request.urgency}`}>
                          {request.urgency === 'срочная' ? 'Срочная' : 
                           request.urgency === 'высокая' ? 'Высокая' : 'Обычная'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.created_at).toLocaleDateString('ru-RU', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'menu-requests' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Заявки на новые блюда</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowMenuRequestModal(true)}
            >
              + Предложить блюдо
            </button>
          </div>

          <div style={{ 
            background: '#e3f2fd', 
            border: '2px solid #2196f3', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Как это работает</h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#1976d2' }}>
              Вы можете предложить новое блюдо для меню. Укажите название, описание, цену и подробный состав с количеством ингредиентов. 
              Администратор рассмотрит вашу заявку и при одобрении добавит блюдо в меню.
            </p>
          </div>
          
          {menuRequests.length === 0 ? (
            <p>У вас пока нет заявок на добавление блюд</p>
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
                        <strong>Комментарий администратора:</strong>
                        <p style={{ margin: '5px 0 0 0' }}>{request.adminComment}</p>
                      </div>
                    )}
                  </div>
                  
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

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Добавить продукт на склад</h2>
            <form onSubmit={addInventoryItem}>
              <div className="form-group">
                <label>Название продукта</label>
                <input
                  type="text"
                  value={newInventoryItem.name}
                  onChange={(e) => setNewInventoryItem({...newInventoryItem, name: e.target.value})}
                  placeholder="Например: Мука пшеничная"
                  required
                />
              </div>
              <div className="form-group">
                <label>Количество</label>
                <input
                  type="number"
                  value={newInventoryItem.quantity}
                  onChange={(e) => setNewInventoryItem({...newInventoryItem, quantity: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Единица измерения</label>
                <select
                  value={newInventoryItem.unit}
                  onChange={(e) => setNewInventoryItem({...newInventoryItem, unit: e.target.value})}
                >
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="шт">шт</option>
                  <option value="упак">упак</option>
                  <option value="г">г</option>
                  <option value="мл">мл</option>
                </select>
              </div>
              <div className="form-group">
                <label>Минимальный остаток (для уведомлений)</label>
                <input
                  type="number"
                  value={newInventoryItem.minQuantity}
                  onChange={(e) => setNewInventoryItem({...newInventoryItem, minQuantity: e.target.value})}
                  placeholder="10"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Добавить
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowInventoryModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Request Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay" onClick={() => setShowPurchaseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Создать заявку на закупку</h2>
            <form onSubmit={createPurchaseRequest}>
              <div className="form-group">
                <label>Название продукта</label>
                <input
                  type="text"
                  value={newPurchaseRequest.item}
                  onChange={(e) => setNewPurchaseRequest({...newPurchaseRequest, item: e.target.value})}
                  placeholder="Например: Картофель"
                  required
                />
              </div>
              <div className="form-group">
                <label>Количество</label>
                <input
                  type="number"
                  value={newPurchaseRequest.quantity}
                  onChange={(e) => setNewPurchaseRequest({...newPurchaseRequest, quantity: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Единица измерения</label>
                <select
                  value={newPurchaseRequest.unit}
                  onChange={(e) => setNewPurchaseRequest({...newPurchaseRequest, unit: e.target.value})}
                >
                  <option value="кг">кг</option>
                  <option value="л">л</option>
                  <option value="шт">шт</option>
                  <option value="упак">упак</option>
                </select>
              </div>
              <div className="form-group">
                <label>Срочность</label>
                <select
                  value={newPurchaseRequest.urgency}
                  onChange={(e) => setNewPurchaseRequest({...newPurchaseRequest, urgency: e.target.value})}
                >
                  <option value="обычная">Обычная</option>
                  <option value="высокая">Высокая</option>
                  <option value="срочная">Срочная</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Создать заявку
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Информация об ученике</h2>
            
            <div className="student-modal-content">
              <div className="student-modal-header">
                <div className="student-avatar-large">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <h3>{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="student-class-large">Класс: {selectedStudent.className}</p>
                </div>
              </div>

              <div className="student-modal-details">
                <div className="detail-section">
                  <h4>Контактная информация</h4>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Телефон:</strong> {selectedStudent.phone}</p>
                </div>

                <div className="detail-section">
                  <h4>Пищевые аллергии</h4>
                  {selectedStudent.allergies ? (
                    <div className="allergies-list">
                      {selectedStudent.allergies.split(', ').map((allergy, idx) => (
                        <span key={idx} className="allergy-tag">{allergy}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#27ae60' }}>Нет аллергий</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Пищевые предпочтения</h4>
                  {selectedStudent.foodPreferences ? (
                    <div className="preferences-list">
                      {selectedStudent.foodPreferences.split(', ').map((pref, idx) => (
                        <span key={idx} className="preference-tag">{pref}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#95a5a6' }}>Не указаны</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowStudentModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Log Modal */}
      {showLogModal && selectedInventoryItem && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <h2>История: {selectedInventoryItem.name}</h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Текущий остаток:</strong> {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                </div>
                <div>
                  <strong>Минимум:</strong> {selectedInventoryItem.min_quantity} {selectedInventoryItem.unit}
                </div>
              </div>
            </div>

            {inventoryLog.length === 0 ? (
              <p>История изменений пуста</p>
            ) : (
              <div className="table-container" style={{ maxHeight: '400px', overflow: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Действие</th>
                      <th>Изменение</th>
                      <th>Было</th>
                      <th>Стало</th>
                      <th>Причина</th>
                      <th>Кто</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryLog.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.createdAt).toLocaleString('ru-RU')}</td>
                        <td>
                          <span className={`action-badge ${log.action}`}>
                            {log.action === 'списание' ? '↓' : '↑'} {log.action}
                          </span>
                        </td>
                        <td style={{ 
                          color: log.quantityChange < 0 ? '#e74c3c' : '#27ae60',
                          fontWeight: 'bold'
                        }}>
                          {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                        </td>
                        <td>{log.quantityBefore}</td>
                        <td>{log.quantityAfter}</td>
                        <td style={{ fontSize: '12px', color: '#7f8c8d' }}>{log.reason || '-'}</td>
                        <td>{log.createdBy || 'Система'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowLogModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Request Modal */}
      {showMenuRequestModal && (
        <div className="modal-overlay" onClick={() => setShowMenuRequestModal(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <h2>Предложить новое блюдо</h2>
            <form onSubmit={createMenuRequest}>
              <div className="form-group">
                <label>Название блюда *</label>
                <input
                  type="text"
                  value={newMenuRequest.name}
                  onChange={(e) => setNewMenuRequest({...newMenuRequest, name: e.target.value})}
                  placeholder="Например: Борщ украинский"
                  required
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newMenuRequest.description}
                  onChange={(e) => setNewMenuRequest({...newMenuRequest, description: e.target.value})}
                  placeholder="Краткое описание блюда"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Цена (₽) *</label>
                <input
                  type="number"
                  value={newMenuRequest.price}
                  onChange={(e) => setNewMenuRequest({...newMenuRequest, price: e.target.value})}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Тип приема пищи *</label>
                <select
                  value={newMenuRequest.mealType}
                  onChange={(e) => setNewMenuRequest({...newMenuRequest, mealType: e.target.value})}
                >
                  <option value="завтрак">Завтрак</option>
                  <option value="обед">Обед</option>
                  <option value="полдник">Полдник</option>
                </select>
              </div>

              <div className="form-group">
                <label>Состав блюда *</label>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Ингредиент</label>
                      <input
                        type="text"
                        value={newIngredient.name}
                        onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                        placeholder="Название"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Количество</label>
                      <input
                        type="number"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Ед. изм.</label>
                      <select
                        value={newIngredient.unit}
                        onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                      >
                        <option value="кг">кг</option>
                        <option value="г">г</option>
                        <option value="л">л</option>
                        <option value="мл">мл</option>
                        <option value="шт">шт</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={addIngredient}
                    >
                      + Добавить
                    </button>
                  </div>
                </div>

                {newMenuRequest.ingredients.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Добавленные ингредиенты:</strong>
                    <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
                      {newMenuRequest.ingredients.map((ing, idx) => (
                        <li key={idx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#e8f5e9',
                          borderRadius: '6px',
                          marginBottom: '5px'
                        }}>
                          <span>{ing.name}: {ing.quantity} {ing.unit}</span>
                          <button
                            type="button"
                            className="btn-icon btn-danger"
                            onClick={() => removeIngredient(idx)}
                            style={{ fontSize: '14px' }}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Отправить заявку
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowMenuRequestModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Input Modal */}
      {showQRScanner && (
        <div className="modal-overlay" onClick={() => setShowQRScanner(false)}>
          <div className="modal-content qr-scanner-modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h2>🔢 Ввод кода заказа</h2>
            
            <div className="qr-scanner-content">
              <div style={{ 
                background: '#f8f9fa', 
                padding: '30px', 
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '64px',
                  marginBottom: '20px'
                }}>
                  🔢
                </div>
                <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
                  Введите 6-значный код, который назвал ученик
                </p>
              </div>

              <div style={{ 
                background: '#e3f2fd', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>Введите код</h4>
                <form onSubmit={handleManualQRInput}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      name="qrInput"
                      placeholder="Например: 123456"
                      maxLength="6"
                      pattern="\d{6}"
                      style={{ 
                        flex: 1,
                        fontSize: '24px',
                        textAlign: 'center',
                        letterSpacing: '5px',
                        fontFamily: 'monospace'
                      }}
                      autoFocus
                      required
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isScanning}
                      style={{ minWidth: '120px' }}
                    >
                      {isScanning ? 'Проверка...' : 'Проверить'}
                    </button>
                  </div>
                  <small style={{ display: 'block', marginTop: '10px', color: '#666' }}>
                    Введите 6 цифр кода заказа
                  </small>
                </form>
              </div>

              {qrScanResult && (
                <div style={{ 
                  background: '#d4edda', 
                  border: '2px solid #28a745',
                  padding: '20px', 
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#155724' }}>✅ Заказ найден!</h3>
                  
                  <div className="order-details">
                    <div className="detail-row">
                      <span><strong>Ученик:</strong></span>
                      <span>{qrScanResult.studentName}</span>
                    </div>
                    <div className="detail-row">
                      <span><strong>Класс:</strong></span>
                      <span>{qrScanResult.className}</span>
                    </div>
                    <div className="detail-row">
                      <span><strong>Блюдо:</strong></span>
                      <span>{qrScanResult.menuName}</span>
                    </div>
                    <div className="detail-row">
                      <span><strong>Тип:</strong></span>
                      <span className={`meal-type ${qrScanResult.mealType}`}>
                        {qrScanResult.mealType}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span><strong>Статус:</strong></span>
                      <span className="status-badge paid">{qrScanResult.status}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-success"
                    onClick={issueOrderByQR}
                    style={{ width: '100%', marginTop: '15px', fontSize: '16px' }}
                  >
                    ✓ Выдать заказ
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowQRScanner(false)
                  setQrScanResult(null)
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>🔔 Уведомления</h2>
              {unreadCount > 0 && (
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={markAllNotificationsAsRead}
                >
                  Отметить все как прочитанные
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px 0' }}>
                У вас пока нет уведомлений
              </p>
            ) : (
              <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    style={{
                      background: notif.is_read ? '#f8f9fa' : '#e3f2fd',
                      border: `2px solid ${notif.is_read ? '#e9ecef' : '#2196f3'}`,
                      borderRadius: '12px',
                      padding: '15px',
                      marginBottom: '15px',
                      cursor: notif.is_read ? 'default' : 'pointer'
                    }}
                    onClick={() => !notif.is_read && markNotificationAsRead(notif.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: notif.is_read ? '#495057' : '#1976d2' }}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span style={{
                          background: '#2196f3',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          НОВОЕ
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: '#495057' }}>
                      {notif.message}
                    </p>
                    <small style={{ color: '#6c757d' }}>
                      {new Date(notif.created_at).toLocaleString('ru-RU')}
                    </small>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowNotifications(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChefDashboard
