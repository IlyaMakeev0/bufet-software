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
  const [subscriptionType, setSubscriptionType] = useState('breakfast')
  const [subscriptionDuration, setSubscriptionDuration] = useState(7)
  const [showProfile, setShowProfile] = useState(false)
  const [allergies, setAllergies] = useState('')
  const [foodPreferences, setFoodPreferences] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [reviewMenuItem, setReviewMenuItem] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [activeTab, setActiveTab] = useState('menu')
  const [notification, setNotification] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showConfirmPayment, setShowConfirmPayment] = useState(false)
  const [confirmPaymentData, setConfirmPaymentData] = useState(null)
  const [showOrderQR, setShowOrderQR] = useState(false)
  const [selectedOrderQR, setSelectedOrderQR] = useState(null)
  const [qrCodeData, setQrCodeData] = useState(null)

  // Показать уведомление
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Цены на абонементы
  const subscriptionPrices = {
    breakfast: {
      7: 700,
      14: 1300,
      30: 2500
    },
    full: {
      7: 2800,
      14: 5200,
      30: 10000
    }
  }

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
      // Проверяем аллергии
      const menuItem = menu.find(item => item.id === menuId)
      if (allergies && menuItem.description) {
        const userAllergies = allergies.split(', ').map(a => a.toLowerCase())
        const itemIngredients = menuItem.description.toLowerCase()
        
        const foundAllergy = userAllergies.find(allergy => 
          itemIngredients.includes(allergy.toLowerCase())
        )
        
        if (foundAllergy) {
          showNotification(`⚠️ Внимание! Это блюдо содержит ${foundAllergy}, на который у вас аллергия!`, 'error')
          return
        }
      }

      // Проверяем, есть ли активный абонемент
      const hasActiveSubscription = subscriptions.some(sub => {
        const today = new Date().toISOString().split('T')[0]
        const isActive = sub.status === 'активен' && 
                        sub.startDate <= today && 
                        sub.endDate >= today
        
        // Проверяем, покрывает ли абонемент этот тип питания
        if (sub.subscriptionType === 'full') {
          return isActive // Полный абонемент покрывает все
        } else if (sub.subscriptionType === 'breakfast' && menuItem.mealType === 'завтрак') {
          return isActive // Абонемент на завтрак покрывает только завтрак
        }
        return false
      })

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId, hasActiveSubscription })
      })

      if (res.ok) {
        const data = await res.json()
        if (hasActiveSubscription) {
          showNotification('✅ Заказ создан успешно! Оплата по абонементу.', 'success')
        } else {
          showNotification(`✅ Заказ создан успешно! Списано ${menuItem.price} ₽`, 'success')
          setBalance(data.newBalance)
        }
        loadData()
      } else {
        const error = await res.json()
        
        // Если нужна оплата (уже заказывал по абонементу)
        if (error.needsPayment) {
          setConfirmPaymentData({ menuId, menuItem, errorMessage: error.error })
          setShowConfirmPayment(true)
        } else {
          showNotification(error.error || 'Ошибка создания заказа', 'error')
        }
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const handleTopUp = async (e) => {
    e.preventDefault()
    const amount = parseFloat(topUpAmount)

    if (!amount || amount <= 0) {
      showNotification('Введите корректную сумму', 'error')
      return
    }

    if (amount > 10000) {
      showNotification('Максимальная сумма пополнения: 10000 ₽', 'error')
      return
    }

    // Открываем модальное окно выбора способа оплаты
    setPaymentAmount(amount)
    setShowPaymentModal(true)
    setShowTopUp(false)
  }

  const processPayment = async () => {
    setPaymentProcessing(true)

    // Симуляция обработки платежа
    if (paymentMethod === 'card') {
      showNotification('PAYMENT: Обработка платежа по карте...', 'warning')
      await new Promise(resolve => setTimeout(resolve, 2000))
    } else if (paymentMethod === 'qr') {
      setShowQRCode(true)
      showNotification('QR: Отсканируйте QR-код для оплаты', 'warning')
      await new Promise(resolve => setTimeout(resolve, 3000))
      setShowQRCode(false)
    }

    try {
      const res = await fetch('/api/auth/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount })
      })

      if (res.ok) {
        const data = await res.json()
        setBalance(data.newBalance)
        setTopUpAmount('')
        setShowPaymentModal(false)
        setPaymentProcessing(false)
        showNotification(`✅ Баланс пополнен на ${paymentAmount} ₽`, 'success')
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка пополнения', 'error')
        setPaymentProcessing(false)
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
      setPaymentProcessing(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!confirmPaymentData) return

    try {
      const payRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          menuId: confirmPaymentData.menuId, 
          hasActiveSubscription: false 
        })
      })
      
      if (payRes.ok) {
        const payData = await payRes.json()
        showNotification(`✅ Заказ создан! Списано ${confirmPaymentData.menuItem.price} ₽`, 'success')
        setBalance(payData.newBalance)
        setShowConfirmPayment(false)
        setConfirmPaymentData(null)
        loadData()
      } else {
        const payError = await payRes.json()
        showNotification(payError.error || 'Ошибка создания заказа', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const generateOrderQR = async (orderId) => {
    try {
      const res = await fetch(`/api/qrcode/generate/order/${orderId}`, {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        setQrCodeData(data)
        setSelectedOrderQR(orderId)
        setShowOrderQR(true)
        showNotification('✅ Код сгенерирован!', 'success')
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка генерации кода', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const openSubscriptionModal = () => {
    setShowSubscription(true)
    setSubscriptionType('breakfast')
    setSubscriptionDuration(7)
  }

  const createSubscription = async (e) => {
    e.preventDefault()

    const totalPrice = subscriptionPrices[subscriptionType][subscriptionDuration]

    if (balance < totalPrice) {
      showNotification('Недостаточно средств на балансе', 'error')
      return
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionType,
          durationDays: subscriptionDuration
        })
      })

      if (res.ok) {
        const data = await res.json()
        setBalance(data.newBalance)
        setShowSubscription(false)
        showNotification(`✅ Абонемент успешно оформлен! Списано: ${totalPrice} ₽`, 'success')
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка создания абонемента', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const generateDateRange = () => {
    const dates = []
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + subscriptionDuration)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0])
    }
    
    return dates
  }

  const getSubscriptionTypeName = (type) => {
    return type === 'breakfast' ? 'Только завтрак' : 'Завтрак + Обед + Полдник'
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
        showNotification('✅ Предпочтения обновлены успешно!', 'success')
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка обновления', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const markAsReceived = async (mealId) => {
    try {
      const res = await fetch(`/api/orders/issued-meals/${mealId}/receive`, {
        method: 'PUT'
      })

      if (res.ok) {
        showNotification('✅ Заказ отмечен как полученный!', 'success')
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка отметки', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
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
        showNotification('✅ Отзыв добавлен успешно!', 'success')
        loadData()
      } else {
        const error = await res.json()
        showNotification(error.error || 'Ошибка добавления отзыва', 'error')
      }
    } catch (error) {
      showNotification('Ошибка подключения к серверу', 'error')
    }
  }

  const todayMenu = menu.filter(item => {
    const today = new Date().toISOString().split('T')[0]
    return item.day === today
  })

  // Проверка активного абонемента
  const getActiveSubscription = () => {
    const today = new Date().toISOString().split('T')[0]
    return subscriptions.find(sub => 
      sub.status === 'активен' && 
      sub.startDate <= today && 
      sub.endDate >= today
    )
  }

  const activeSubscription = getActiveSubscription()

  // Проверка, покрывается ли блюдо абонементом
  const isCoveredBySubscription = (mealType) => {
    if (!activeSubscription) return false
    if (activeSubscription.subscriptionType === 'full') return true
    if (activeSubscription.subscriptionType === 'breakfast' && mealType === 'завтрак') return true
    return false
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
          <div className="stat-icon">BALANCE</div>
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
          <div className="stat-icon">ORDERS</div>
          <div className="stat-value">{orders.length}</div>
          <div className="stat-label">Заказов</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">TICKETS</div>
          <div className="stat-value">{subscriptions.length}</div>
          <div className="stat-label">Абонементов</div>
          <button 
            className="btn btn-success"
            onClick={openSubscriptionModal}
            style={{ marginTop: '10px', fontSize: '14px' }}
          >
            Купить
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon">PROFILE</div>
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
          Меню
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
        <button 
          className={`tab ${activeTab === 'pickup' ? 'active' : ''}`}
          onClick={() => setActiveTab('pickup')}
        >
          Получение
        </button>
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Абонементы
        </button>
        <button 
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Отзывы
        </button>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <div className="modal-overlay" onClick={() => setShowTopUp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Пополнение баланса</h2>
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
                  Продолжить
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

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => !paymentProcessing && setShowPaymentModal(false)}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Выберите способ оплаты</h2>
            
            <div className="payment-amount-display">
              <span>Сумма к оплате:</span>
              <strong>{paymentAmount} ₽</strong>
            </div>

            <div className="payment-methods">
              <label className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={paymentProcessing}
                />
                <div className="payment-method-content">
                  <div className="payment-icon">CARD</div>
                  <div className="payment-info">
                    <div className="payment-name">Банковская карта</div>
                    <div className="payment-description">Visa, MasterCard, МИР</div>
                  </div>
                </div>
              </label>

              <label className={`payment-method-card ${paymentMethod === 'qr' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qr"
                  checked={paymentMethod === 'qr'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={paymentProcessing}
                />
                <div className="payment-method-content">
                  <div className="payment-icon">QR</div>
                  <div className="payment-info">
                    <div className="payment-name">QR-код</div>
                    <div className="payment-description">СБП, Система Быстрых Платежей</div>
                  </div>
                </div>
              </label>
            </div>

            {showQRCode && (
              <div className="qr-code-container">
                <div className="qr-code-placeholder">
                  <div className="qr-code-box">
                    <div className="qr-pattern"></div>
                  </div>
                  <p>Отсканируйте QR-код в приложении банка</p>
                  <div className="qr-loader">
                    <div className="spinner"></div>
                    <span>Ожидание оплаты...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button"
                className="btn btn-success"
                onClick={processPayment}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? (
                  <>
                    <span className="btn-spinner"></span>
                    Обработка...
                  </>
                ) : (
                  `Оплатить ${paymentAmount} ₽`
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowPaymentModal(false)}
                disabled={paymentProcessing}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Payment Modal */}
      {showConfirmPayment && confirmPaymentData && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Подтверждение оплаты</h2>
            
            <div className="confirm-payment-info">
              <p>{confirmPaymentData.errorMessage}</p>
              <div className="payment-details">
                <div className="detail-row">
                  <span>Блюдо:</span>
                  <strong>{confirmPaymentData.menuItem.name}</strong>
                </div>
                <div className="detail-row">
                  <span>Стоимость:</span>
                  <strong>{confirmPaymentData.menuItem.price} ₽</strong>
                </div>
                <div className="detail-row">
                  <span>Текущий баланс:</span>
                  <strong>{balance.toFixed(2)} ₽</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button"
                className="btn btn-success"
                onClick={handleConfirmPayment}
              >
                Оплатить из баланса
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirmPayment(false)
                  setConfirmPaymentData(null)
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscription && (
        <div className="modal-overlay" onClick={() => setShowSubscription(false)}>
          <div className="modal-content subscription-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Оформление абонемента</h2>
            
            <form onSubmit={createSubscription}>
              <div className="form-group">
                <label>Тип абонемента</label>
                <div className="subscription-types">
                  <label className={`subscription-type-card ${subscriptionType === 'breakfast' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="subscriptionType"
                      value="breakfast"
                      checked={subscriptionType === 'breakfast'}
                      onChange={(e) => setSubscriptionType(e.target.value)}
                    />
                    <div className="type-content">
                      <div className="type-icon">BREAKFAST</div>
                      <div className="type-name">Только завтрак</div>
                      <div className="type-description">Завтрак каждый день</div>
                    </div>
                  </label>
                  
                  <label className={`subscription-type-card ${subscriptionType === 'full' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="subscriptionType"
                      value="full"
                      checked={subscriptionType === 'full'}
                      onChange={(e) => setSubscriptionType(e.target.value)}
                    />
                    <div className="type-content">
                      <div className="type-icon">FULL DAY</div>
                      <div className="type-name">Полный день</div>
                      <div className="type-description">Завтрак + Обед + Полдник</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Длительность абонемента</label>
                <div className="duration-options">
                  <label className={`duration-card ${subscriptionDuration === 7 ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="duration"
                      value="7"
                      checked={subscriptionDuration === 7}
                      onChange={(e) => setSubscriptionDuration(parseInt(e.target.value))}
                    />
                    <div className="duration-content">
                      <div className="duration-days">7 дней</div>
                      <div className="duration-price">{subscriptionPrices[subscriptionType][7]} ₽</div>
                      <div className="duration-per-day">
                        {(subscriptionPrices[subscriptionType][7] / 7).toFixed(0)} ₽/день
                      </div>
                    </div>
                  </label>

                  <label className={`duration-card ${subscriptionDuration === 14 ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="duration"
                      value="14"
                      checked={subscriptionDuration === 14}
                      onChange={(e) => setSubscriptionDuration(parseInt(e.target.value))}
                    />
                    <div className="duration-content">
                      <div className="duration-days">14 дней</div>
                      <div className="duration-price">{subscriptionPrices[subscriptionType][14]} ₽</div>
                      <div className="duration-per-day">
                        {(subscriptionPrices[subscriptionType][14] / 14).toFixed(0)} ₽/день
                      </div>
                      <div className="duration-badge">Выгодно</div>
                    </div>
                  </label>

                  <label className={`duration-card ${subscriptionDuration === 30 ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="duration"
                      value="30"
                      checked={subscriptionDuration === 30}
                      onChange={(e) => setSubscriptionDuration(parseInt(e.target.value))}
                    />
                    <div className="duration-content">
                      <div className="duration-days">30 дней</div>
                      <div className="duration-price">{subscriptionPrices[subscriptionType][30]} ₽</div>
                      <div className="duration-per-day">
                        {(subscriptionPrices[subscriptionType][30] / 30).toFixed(0)} ₽/день
                      </div>
                      <div className="duration-badge best">Лучшая цена</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="subscription-summary">
                <h3>Итоговая информация</h3>
                <div className="summary-item">
                  <span className="summary-item-label">Тип:</span>
                  <span className="summary-item-value">{getSubscriptionTypeName(subscriptionType)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Длительность:</span>
                  <span className="summary-item-value">{subscriptionDuration} дней</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Начало:</span>
                  <span className="summary-item-value">{new Date().toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Окончание:</span>
                  <span className="summary-item-value">
                    {new Date(Date.now() + subscriptionDuration * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-item-label">Итого к оплате:</span>
                  <span className="summary-item-value">{subscriptionPrices[subscriptionType][subscriptionDuration]} ₽</span>
                </div>
                <div className="summary-note">
                  Деньги будут списаны с баланса сразу после оформления
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={balance < subscriptionPrices[subscriptionType][subscriptionDuration]}
                >
                  {balance < subscriptionPrices[subscriptionType][subscriptionDuration] 
                    ? 'Недостаточно средств' 
                    : 'Оформить абонемент'}
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
            <h2>Настройки профиля</h2>
            <form onSubmit={handleUpdatePreferences}>
              <div className="form-group">
                <label>Пищевые аллергии</label>
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

      {/* Numeric Code Modal */}
      {showOrderQR && qrCodeData && (
        <div className="modal-overlay" onClick={() => setShowOrderQR(false)}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🔢 Код для получения заказа</h2>
            
            <div className="qr-code-display">
              <div className="numeric-code-container" style={{
                textAlign: 'center',
                padding: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: '#fff',
                  letterSpacing: '10px',
                  fontFamily: 'monospace',
                  textShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                  {qrCodeData.qrCode}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: '15px',
                  fontWeight: '500'
                }}>
                  Покажите этот код повару
                </div>
              </div>
              
              <div className="qr-instructions">
                <h3>Как получить заказ:</h3>
                <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
                  <li>Назовите этот 6-значный код повару</li>
                  <li>Повар введет код в систему</li>
                  <li>Получите свой заказ</li>
                </ol>
                
                <div className="qr-info">
                  <p><strong>⏰ Срок действия:</strong></p>
                  <p>{new Date(qrCodeData.expiresAt).toLocaleString('ru-RU')}</p>
                  <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '10px' }}>
                    Код действителен 24 часа
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowOrderQR(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Меню на сегодня</h2>
        {activeSubscription && (
          <div className="active-subscription-banner">
            <div className="banner-icon">SUBSCRIPTION</div>
            <div className="banner-content">
              <strong>У вас активен абонемент:</strong> {getSubscriptionTypeName(activeSubscription.subscriptionType)}
              <br />
              <small>Действует до: {new Date(activeSubscription.endDate).toLocaleDateString('ru-RU')}</small>
            </div>
          </div>
        )}
        {todayMenu.length === 0 ? (
          <p>Меню на сегодня пока не доступно</p>
        ) : (
          <div className="menu-grid">
            {todayMenu.map(item => {
              const coveredBySubscription = isCoveredBySubscription(item.mealType)
              
              // Проверка аллергий
              const hasAllergy = allergies && item.description ? 
                allergies.split(', ').some(allergy => 
                  item.description.toLowerCase().includes(allergy.toLowerCase())
                ) : false

              return (
                <div key={item.id} className={`menu-card ${hasAllergy ? 'has-allergy' : ''}`}>
                  <span className={`meal-type ${item.mealType}`}>
                    {item.mealType === 'завтрак' ? 'Завтрак' : 
                     item.mealType === 'обед' ? 'Обед' : 'Полдник'}
                  </span>
                  {coveredBySubscription && (
                    <div className="subscription-badge">
                      По абонементу
                    </div>
                  )}
                  {hasAllergy && (
                    <div className="allergy-badge">
                      ⚠️ Аллергия
                    </div>
                  )}
                  <h3>{item.name}</h3>
                  <p className="menu-description">{item.description}</p>
                  <div className="price">
                    {coveredBySubscription ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#95a5a6' }}>{item.price} ₽</span>
                        <span style={{ color: '#27ae60', marginLeft: '10px', fontWeight: 'bold' }}>Бесплатно</span>
                      </>
                    ) : (
                      `${item.price} ₽`
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn btn-success"
                      onClick={() => createOrder(item.id)}
                      disabled={hasAllergy}
                      style={{ flex: 1 }}
                      title={hasAllergy ? 'Содержит аллерген' : ''}
                    >
                      {hasAllergy ? '⚠️ Нельзя заказать' : 
                       coveredBySubscription ? 'Заказать (бесплатно)' : 'Заказать'}
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
              )
            })}
          </div>
        )}
      </div>

      {activeTab === 'orders' && (
        <div className="section">
          <h2>Мои заказы</h2>
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
                    <th>Код</th>
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
                      <td>
                        {order.status === 'оплачен' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => generateOrderQR(order.id)}
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            🔢 Показать код
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

      {activeTab === 'pickup' && (
        <div className="section">
          <h2>Получение заказов</h2>
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
                        {meal.mealType === 'завтрак' ? 'Завтрак' : 
                         meal.mealType === 'обед' ? 'Обед' : 'Полдник'}
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
          <h2>Мои абонементы</h2>
          {subscriptions.length === 0 ? (
            <p>У вас пока нет абонементов</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Тип</th>
                    <th>Длительность</th>
                    <th>Период</th>
                    <th>Цена</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => (
                    <tr key={sub.id}>
                      <td>{getSubscriptionTypeName(sub.subscriptionType)}</td>
                      <td>{sub.durationDays} дней</td>
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
