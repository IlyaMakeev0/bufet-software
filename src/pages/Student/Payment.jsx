import { useState } from 'react'
import { api } from '../../api/client'

function Payment() {
  const [paymentType, setPaymentType] = useState('single')
  const [amount, setAmount] = useState(0)
  const [mealType, setMealType] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (amount === 0) return
    
    setLoading(true)
    try {
      await api.createPayment(amount, paymentType, mealType)
      alert('Оплата прошла успешно!')
      setAmount(0)
      setMealType('')
    } catch (error) {
      alert('Ошибка оплаты: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Оплата питания</h1>
      
      <div className="payment-form">
        <div className="payment-type">
          <label>
            <input
              type="radio"
              value="single"
              checked={paymentType === 'single'}
              onChange={(e) => setPaymentType(e.target.value)}
            />
            Разовая оплата
          </label>
          <label>
            <input
              type="radio"
              value="subscription"
              checked={paymentType === 'subscription'}
              onChange={(e) => setPaymentType(e.target.value)}
            />
            Абонемент
          </label>
        </div>

        {paymentType === 'single' && (
          <div>
            <h3>Выберите тип питания</h3>
            <select onChange={(e) => {
              const [price, type] = e.target.value.split('|')
              setAmount(Number(price))
              setMealType(type)
            }}>
              <option value="0|">Выберите...</option>
              <option value="50|breakfast">Завтрак - 50₽</option>
              <option value="120|lunch">Обед - 120₽</option>
              <option value="170|both">Завтрак + Обед - 170₽</option>
            </select>
          </div>
        )}

        {paymentType === 'subscription' && (
          <div>
            <h3>Выберите абонемент</h3>
            <select onChange={(e) => {
              const [price, type] = e.target.value.split('|')
              setAmount(Number(price))
              setMealType(type)
            }}>
              <option value="0|">Выберите...</option>
              <option value="1000|breakfast">Неделя (завтраки) - 1000₽</option>
              <option value="2400|lunch">Неделя (обеды) - 2400₽</option>
              <option value="3400|both">Неделя (полный день) - 3400₽</option>
            </select>
          </div>
        )}

        {amount > 0 && (
          <div className="payment-summary">
            <h3>К оплате: {amount}₽</h3>
            <button onClick={handlePayment} disabled={loading}>
              {loading ? 'Обработка...' : 'Оплатить'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Payment
