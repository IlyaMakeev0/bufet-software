import { useState, useEffect } from 'react'

function StudentDashboard({ user }) {
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [issuedMeals, setIssuedMeals] = useState([])
  const [myReviews, setMyReviews] = useState([])
  const [balance, setBalance] = useState(user.balance || 1000)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [showSubscription, setShowSubscription] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState(null)
  const [subscriptionDates, setSubscriptionDates] = useState([])
  const [subscriptionPeriod, setSubscriptionPeriod] = useState({ start: '', end: '' })
  const [showProfile, setShowProfile] = useState(false)
  const [allergies, setAllergies] = useState('')
  const [foodPreferences, setFoodPreferences] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [reviewMenuItem, setReviewMenuItem] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [activeTab, setActiveTab] = useState('menu')

  useEffect(() => {
    loadData()
    loadProfile()
  }, [])

  const loadData = async () => {
    try {
      const [menuRes, ordersRes, subsRes, mealsRes, reviewsRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/orders'),
        fetch('/api/subscriptions'),
        fetch('/api/orders/issued-meals'),
        fetch('/api/reviews/user/my-reviews')
      ])

      if (menuRes.ok) setMenu(await menuRes.json())
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (subsRes.ok) setSubscriptions(await subsRes.json())
      if (mealsRes.ok) setIssuedMeals(await mealsRes.json())
      if (reviewsRes.ok) setMyReviews(await reviewsRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setAllergies(data.allergies || '')
        setFoodPreferences(data.foodPreferences || '')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
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

  const handleTopUp = async (e) => {
    e.preventDefault()
    const amount = parseFloat(topUpAmount)

    if (!amount || amount <= 0) {
      alert('Введите корректную сумму')
      return
    }

    if (amount > 10000) {
      alert('Максимальная сумма пополнения: 10000 ₽')
      return
    }

    try {
      const res = await fetch('/api/auth/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      if (res.ok) {
        const data = await res.json()
        setBalance(data.newBalance)
        setTopUpAmount('')
        setShowTopUp(false)
        alert(`Баланс пополнен на ${amount} ₽`)
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка пополнения')
      }
    } catch (error) {
      alert('Ошибка подключения к серверу')
    }
  }

  const openSubscriptionModal = (menuItem) => {
    setSelectedMenuItem(menuItem)
    setShowSubscription(true)
    setSubscriptionDates([])
    setSubscriptionPeriod({ start: '', end: '' })
  }

  const createSubscription = async (e) => {
    e.preventDefault()

    if (!subscriptionPeriod.start || !subscriptionPeriod.end) {
      alert('Выберите период абонемента')
      return
    }

    if (subscriptionDates.length === 0) {
      alert('Выберите хотя бы одну дату')
      return
    }

    const totalPrice = selectedMenuItem.price * subscriptionDates.length

    if (balance < totalPrice) {
      alert('Недостаточно средств на балансе')
      return
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: selectedMenuItem.id,
          selectedDates: subscriptionDates,
          startDate: subscriptionPeriod.start,
          endDate: subscriptionPeriod.end
        })
      })

      if (res.ok) {
        const data = await res.json()
        setBalance(data.newBalance)
        setShowSubscription(false)
        alert('Абонемент успешно оформлен!')
        loadData()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка создания абонемента')
      }
    } catch (error) {
      alert('Ошибка подключения к серверу')
    }
  }

  const generateDateRange = () => {
    if (!subscriptionPeriod.start || !subscriptionPeriod.end) return []
    
    const dates = []
    const start = new Date(subscriptionPeriod.start)
    const end = new Date(subscriptionPeriod.end)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }
    
    return dates
  }

  const toggleDate = (date) => {
    if (subscriptionDates.includes(date)) {
      setSubscriptionDates(subscriptionDates.filter(d => d !== date))
    } else {
      setSubscriptionDates([...subscriptionDates, date])
    }
  }

  const handleUpdatePreferences = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allergies, foodPreferences })
      })

      if (res.ok) {
        setShowProfile(false)
        alert('Предпочтения обновлены успешно!')
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка обновления')
      }
    } catch (error) {
      alert('Ошибка подключения к серверу')
    }
  }

  const markAsReceived = async (mealId) => {
    try {
      const res = await fetch(`/api/orders/issued-meals/${mealId}/receive`, {
        method: 'PUT'
      })

      if (res.ok) {
        alert('Заказ отмечен как полученный!')
        loadData()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка отметки')
      }
    } catch (error) {
      alert('Ошибка подключения к серверу')
    }
  }

  const openReviewModal = (menuItem) => {
    setReviewMenuItem(menuItem)
    setShowReview(true)
    setReviewRating(5)
    setReviewComment('')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuId: reviewMenuItem.id,
          rating: reviewRating,
          comment: reviewComment
        })
      })

      if (res.ok) {
        setShowReview(false)
        alert('Отзыв добавлен успешно!')
        loadData()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка добавления отзыва')
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
          <button 
            className="btn btn-primary"
            onClick={() => setShowTopUp(true)}
            style={{ marginTop: '10px', fontSize: '14px' }}
          >
            Пополнить
          </button>
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

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-label">Профиль</div>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowProfile(true)}
            style={{ marginTop: '10px', fontSize: '14px' }}
          >
            Настройки
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          🍽️ Меню
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Заказы
        </button>
        <button 
          className={`tab ${activeTab === 'pickup' ? 'active' : ''}`}
          onClick={() => setActiveTab('pickup')}
        >
          📦 Получение
        </button>
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          🎫 Абонементы
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Отзывы
        </button>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>💰 Пополнение баланса</h2>
            <form onSubmit={handleTopUp}>
              <div className="form-group">
                <label>Сумма пополнения (₽)</label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Введите сумму"
                  min="1"
                  max="10000"
                  step="0.01"
                  required
                />
                <small>Минимум: 1 ₽, Максимум: 10000 ₽</small>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Пополнить
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTopUp(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscription && selectedMenuItem && (
        <div className="modal-overlay" onClick={() => setShowSubscription(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🎫 Оформление абонемента</h2>
            <div className="subscription-info">
              <h3>{selectedMenuItem.name}</h3>
              <p>{selectedMenuItem.description}</p>
              <p><strong>Цена за день:</strong> {selectedMenuItem.price} ₽</p>
            </div>
            <form onSubmit={createSubscription}>
              <div className="form-group">
                <label>Период абонемента</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="date"
                    value={subscriptionPeriod.start}
                    onChange={(e) => setSubscriptionPeriod({ ...subscriptionPeriod, start: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <input
                    type="date"
                    value={subscriptionPeriod.end}
                    onChange={(e) => setSubscriptionPeriod({ ...subscriptionPeriod, end: e.target.value })}
                    min={subscriptionPeriod.start || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {subscriptionPeriod.start && subscriptionPeriod.end && (
                <div className="form-group">
                  <label>Выберите дни ({subscriptionDates.length} выбрано)</label>
                  <div className="date-grid">
                    {generateDateRange().map(date => (
                      <label key={date} className="date-checkbox">
                        <input
                          type="checkbox"
                          checked={subscriptionDates.includes(date)}
                          onChange={() => toggleDate(date)}
                        />
                        <span>{new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {subscriptionDates.length > 0 && (
                <div className="subscription-summary">
                  <p><strong>Выбрано дней:</strong> {subscriptionDates.length}</p>
                  <p><strong>Итого:</strong> {(selectedMenuItem.price * subscriptionDates.length).toFixed(2)} ₽</p>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={subscriptionDates.length === 0}
                >
                  Оформить абонемент
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowSubscription(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>👤 Настройки профиля</h2>
            <form onSubmit={handleUpdatePreferences}>
              <div className="form-group">
                <label>🚫 Пищевые аллергии</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Орехи')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Орехи' : 'Орехи')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Орехи').join(', '))
                        }
                      }}
                    />
                    <span>Орехи</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Молоко')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Молоко' : 'Молоко')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Молоко').join(', '))
                        }
                      }}
                    />
                    <span>Молоко</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Глютен')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Глютен' : 'Глютен')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Глютен').join(', '))
                        }
                      }}
                    />
                    <span>Глютен</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Яйца')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Яйца' : 'Яйца')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Яйца').join(', '))
                        }
                      }}
                    />
                    <span>Яйца</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Рыба')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Рыба' : 'Рыба')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Рыба').join(', '))
                        }
                      }}
                    />
                    <span>Рыба</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Морепродукты')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Морепродукты' : 'Морепродукты')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Морепродукты').join(', '))
                        }
                      }}
                    />
                    <span>Морепродукты</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Соя')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Соя' : 'Соя')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Соя').join(', '))
                        }
                      }}
                    />
                    <span>Соя</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={allergies.includes('Мёд')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllergies(allergies ? allergies + ', Мёд' : 'Мёд')
                        } else {
                          setAllergies(allergies.split(', ').filter(a => a !== 'Мёд').join(', '))
                        }
                      }}
                    />
                    <span>Мёд</span>
                  </label>
                </div>
                <small>Выберите продукты, на которые у вас аллергия</small>
              </div>
              <div className="form-group">
                <label>❤️ Пищевые предпочтения</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Вегетарианство')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Вегетарианство' : 'Вегетарианство')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Вегетарианство').join(', '))
                        }
                      }}
                    />
                    <span>Вегетарианство</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Веганство')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Веганство' : 'Веганство')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Веганство').join(', '))
                        }
                      }}
                    />
                    <span>Веганство</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Без острого')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Без острого' : 'Без острого')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Без острого').join(', '))
                        }
                      }}
                    />
                    <span>Без острого</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Без жирного')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Без жирного' : 'Без жирного')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Без жирного').join(', '))
                        }
                      }}
                    />
                    <span>Без жирного</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Без мяса')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Без мяса' : 'Без мяса')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Без мяса').join(', '))
                        }
                      }}
                    />
                    <span>Без мяса</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Без рыбы')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Без рыбы' : 'Без рыбы')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Без рыбы').join(', '))
                        }
                      }}
                    />
                    <span>Без рыбы</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Халяль')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Халяль' : 'Халяль')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Халяль').join(', '))
                        }
                      }}
                    />
                    <span>Халяль</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={foodPreferences.includes('Кошер')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFoodPreferences(foodPreferences ? foodPreferences + ', Кошер' : 'Кошер')
                        } else {
                          setFoodPreferences(foodPreferences.split(', ').filter(p => p !== 'Кошер').join(', '))
                        }
                      }}
                    />
                    <span>Кошер</span>
                  </label>
                </div>
                <small>Выберите ваши пищевые предпочтения</small>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Сохранить
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowProfile(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && reviewMenuItem && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>⭐ Оставить отзыв</h2>
            <div className="subscription-info">
              <h3>{reviewMenuItem.name}</h3>
              <p>{reviewMenuItem.description}</p>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Оценка</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${reviewRating >= star ? 'active' : ''}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Комментарий (необязательно)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Поделитесь своим мнением о блюде..."
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Отправить отзыв
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowReview(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-success"
                    onClick={() => createOrder(item.id)}
                    disabled={balance < item.price}
                    style={{ flex: 1 }}
                  >
                    {balance < item.price ? 'Недостаточно средств' : 'Заказать'}
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => openSubscriptionModal(item)}
                    style={{ flex: 1 }}
                  >
                    🎫 Абонемент
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => openReviewModal(item)}
                    style={{ flex: 1 }}
                  >
                    ⭐ Отзыв
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'orders' && (
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
      )}

      {activeTab === 'pickup' && (
        <div className="section">
          <h2>📦 Получение заказов</h2>
          {issuedMeals.length === 0 ? (
            <p>У вас нет заказов для получения</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Блюдо</th>
                    <th>Тип</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedMeals.map(meal => (
                    <tr key={meal.id}>
                      <td>{meal.menuName}</td>
                      <td>
                        {meal.mealType === 'завтрак' ? '🌅 Завтрак' : 
                         meal.mealType === 'обед' ? '🍽️ Обед' : '🍪 Полдник'}
                      </td>
                      <td>{new Date(meal.issueDate).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <span className={`status-badge ${meal.status === 'получен' ? 'issued' : 'pending'}`}>
                          {meal.status}
                        </span>
                      </td>
                      <td>
                        {meal.status !== 'получен' && (
                          <button 
                            className="btn btn-success"
                            onClick={() => markAsReceived(meal.id)}
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            ✓ Получил
                          </button>
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

      {activeTab === 'subscriptions' && (
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
      )}

      {activeTab === 'reviews' && (
        <div className="section">
          <h2>⭐ Мои отзывы</h2>
          {myReviews.length === 0 ? (
            <p>Вы еще не оставили ни одного отзыва</p>
          ) : (
            <div className="reviews-list">
              {myReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <h3>{review.menuName}</h3>
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                  <small className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
