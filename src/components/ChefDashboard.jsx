import { useState, useEffect } from 'react'

function ChefDashboard({ user }) {
  const [pendingMeals, setPendingMeals] = useState([])
  const [issuedToday, setIssuedToday] = useState([])
  const [inventory, setInventory] = useState([])
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [students, setStudents] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [notification, setNotification] = useState(null)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchStudent, setSearchStudent] = useState('')
  const [newInventoryItem, setNewInventoryItem] = useState({ name: '', quantity: '', unit: 'кг' })
  const [newPurchaseRequest, setNewPurchaseRequest] = useState({ item: '', quantity: '', unit: 'кг', urgency: 'обычная' })
  const [stats, setStats] = useState({
    breakfastIssued: 0,
    lunchIssued: 0,
    snackIssued: 0,
    totalToday: 0
  })

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
      const [pendingRes, issuedRes, inventoryRes, purchaseRes, studentsRes] = await Promise.all([
        fetch('/api/chef/pending-meals'),
        fetch('/api/chef/issued-today'),
        fetch('/api/chef/inventory'),
        fetch('/api/chef/purchase-requests'),
        fetch('/api/chef/students')
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
        showNotification('✅ Блюдо выдано успешно!', 'success')
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка выдачи блюда', 'error')
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
        body: JSON.stringify(newInventoryItem)
      })

      if (res.ok) {
        showNotification('✅ Продукт добавлен на склад', 'success')
        setShowInventoryModal(false)
        setNewInventoryItem({ name: '', quantity: '', unit: 'кг' })
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
        showNotification('✅ Количество обновлено', 'success')
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
        showNotification('✅ Продукт удален', 'success')
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
        showNotification('✅ Заявка на закупку создана', 'success')
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
    if (meal.allergies) requirements.push(`⚠️ Аллергии: ${meal.allergies}`)
    if (meal.foodPreferences) requirements.push(`❤️ Предпочтения: ${meal.foodPreferences}`)
    return requirements
  }

  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setShowStudentModal(true)
  }

  const filteredStudents = students.filter(student => {
    const searchLower = searchStudent.toLowerCase()
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.className.toLowerCase().includes(searchLower)
    )
  })

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
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingMeals.length}</div>
          <div className="stat-label">Ожидают выдачи</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🌅</div>
          <div className="stat-value">{stats.breakfastIssued}</div>
          <div className="stat-label">Завтраков выдано</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">{stats.lunchIssued}</div>
          <div className="stat-label">Обедов выдано</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍪</div>
          <div className="stat-value">{stats.snackIssued}</div>
          <div className="stat-label">Полдников выдано</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Ожидают выдачи ({pendingMeals.length})
        </button>
        <button 
          className={`tab ${activeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          ✅ Выдано сегодня ({issuedToday.length})
        </button>
        <button 
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Ученики ({students.length})
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Склад ({inventory.length})
        </button>
        <button 
          className={`tab ${activeTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchase')}
        >
          🛒 Заявки на закупку ({purchaseRequests.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="section">
          <h2>⏳ Ожидают выдачи</h2>
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
                            ✓ Выдать
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
          <h2>✅ Выдано сегодня</h2>
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
            <h2>👥 База учеников</h2>
            <input
              type="text"
              placeholder="🔍 Поиск по имени или классу..."
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
                        <span className="detail-icon">⚠️</span>
                        <div>
                          <strong>Аллергии:</strong>
                          <p>{student.allergies}</p>
                        </div>
                      </div>
                    )}
                    
                    {student.foodPreferences && (
                      <div className="student-detail preferences">
                        <span className="detail-icon">❤️</span>
                        <div>
                          <strong>Предпочтения:</strong>
                          <p>{student.foodPreferences}</p>
                        </div>
                      </div>
                    )}
                    
                    {!student.allergies && !student.foodPreferences && (
                      <div className="student-detail no-restrictions">
                        <span className="detail-icon">✅</span>
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
            <h2>📦 Склад продуктов</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowInventoryModal(true)}
            >
              + Добавить продукт
            </button>
          </div>
          
          {inventory.length === 0 ? (
            <p>Склад пуст</p>
          ) : (
            <div className="inventory-grid">
              {inventory.map(item => (
                <div key={item.id} className={`inventory-card ${item.quantity < 10 ? 'low-stock' : ''}`}>
                  <div className="inventory-header">
                    <h3>{item.name}</h3>
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => deleteInventoryItem(item.id)}
                      title="Удалить"
                    >
                      🗑️
                    </button>
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
                  {item.quantity < 10 && (
                    <div className="low-stock-badge">
                      ⚠️ Мало на складе
                    </div>
                  )}
                  <div className="inventory-date">
                    Обновлено: {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'purchase' && (
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>🛒 Заявки на закупку</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowPurchaseModal(true)}
            >
              + Создать заявку
            </button>
          </div>
          
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
                    <tr key={request.id}>
                      <td>{request.item}</td>
                      <td>{request.quantity} {request.unit}</td>
                      <td>
                        <span className={`urgency-badge ${request.urgency}`}>
                          {request.urgency === 'срочная' ? '🔴 Срочная' : 
                           request.urgency === 'высокая' ? '🟠 Высокая' : '🟢 Обычная'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📦 Добавить продукт</h2>
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
                </select>
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
            <h2>🛒 Создать заявку на закупку</h2>
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
                  <option value="обычная">🟢 Обычная</option>
                  <option value="высокая">🟠 Высокая</option>
                  <option value="срочная">🔴 Срочная</option>
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
            <h2>👤 Информация об ученике</h2>
            
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
                  <h4>📧 Контактная информация</h4>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Телефон:</strong> {selectedStudent.phone}</p>
                </div>

                <div className="detail-section">
                  <h4>⚠️ Пищевые аллергии</h4>
                  {selectedStudent.allergies ? (
                    <div className="allergies-list">
                      {selectedStudent.allergies.split(', ').map((allergy, idx) => (
                        <span key={idx} className="allergy-tag">{allergy}</span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#27ae60' }}>✅ Нет аллергий</p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>❤️ Пищевые предпочтения</h4>
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
    </div>
  )
}

export default ChefDashboard
