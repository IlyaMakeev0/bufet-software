import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: выбор метода, 2: email, 3: код, 4: новый пароль
  const [method, setMethod] = useState('email') // email или admin
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('student')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Шаг 1: Выбор метода сброса
  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod)
    setStep(2)
    setError('')
  }

  // Шаг 2: Отправка кода на email или создание запроса администрации
  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Введите email')
      setLoading(false)
      return
    }

    if (method === 'email') {
      // Отправка кода на email
      try {
        const res = await fetch('/api/auth/request-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role })
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Код для сброса пароля отправлен на ваш email')
          setStep(3)
        } else {
          setError(data.error || 'Ошибка отправки кода')
        }
      } catch (err) {
        setError('Ошибка подключения к серверу')
      }
    } else {
      // Создание запроса администрации
      if (!reason) {
        setError('Укажите причину запроса')
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/request-admin-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role, reason })
        })

        const data = await res.json()

        if (res.ok) {
          setSuccess('Запрос отправлен администрации. Ожидайте ответа на ваш email.')
          setTimeout(() => navigate('/'), 3000)
        } else {
          setError(data.error || 'Ошибка создания запроса')
        }
      } catch (err) {
        setError('Ошибка подключения к серверу')
      }
    }

    setLoading(false)
  }

  // Шаг 3: Проверка кода и установка нового пароля
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!code || !newPassword || !confirmPassword) {
      setError('Заполните все поля')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Пароль успешно изменён! Перенаправление на страницу входа...')
        setTimeout(() => {
          if (role === 'student') navigate('/student/login')
          else if (role === 'chef') navigate('/chef/login')
          else navigate('/admin/login')
        }, 2000)
      } else {
        setError(data.error || 'Ошибка сброса пароля')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    }

    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>🔐 Сброс пароля</h1>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* Шаг 1: Выбор метода */}
        {step === 1 && (
          <div>
            <p className="auth-subtitle">Выберите способ восстановления пароля:</p>
            
            <div className="method-selection">
              <button
                className="method-card"
                onClick={() => handleMethodSelect('email')}
              >
                <div className="method-icon">📧</div>
                <h3>Через Email</h3>
                <p>Получите код на вашу почту</p>
                <small>Быстро и безопасно</small>
              </button>

              <button
                className="method-card"
                onClick={() => handleMethodSelect('admin')}
              >
                <div className="method-icon">👤</div>
                <h3>Через администрацию</h3>
                <p>Отправьте запрос администратору</p>
                <small>Если нет доступа к email</small>
              </button>
            </div>

            <Link to="/" className="btn btn-secondary" style={{ marginTop: '20px' }}>
              ← На главную
            </Link>
          </div>
        )}

        {/* Шаг 2: Ввод email и роли */}
        {step === 2 && (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Роль:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="student">Ученик</option>
                <option value="chef">Повар</option>
                <option value="admin">Администратор</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
              />
            </div>

            {method === 'admin' && (
              <div className="form-group">
                <label>Причина запроса:</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Опишите причину, по которой вам нужно сбросить пароль"
                  rows="4"
                  required
                />
                <small>Администратор рассмотрит ваш запрос и свяжется с вами</small>
              </div>
            )}

            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Отправка...' : method === 'email' ? 'Отправить код' : 'Отправить запрос'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Назад
              </button>
            </div>
          </form>
        )}

        {/* Шаг 3: Ввод кода и нового пароля */}
        {step === 3 && method === 'email' && (
          <form onSubmit={handleResetPassword}>
            <p className="auth-subtitle">
              Код отправлен на <strong>{email}</strong>
              <br />
              <small>Проверьте папку "Спам", если не видите письмо</small>
            </p>

            <div className="form-group">
              <label>Код из email:</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Введите 6-значный код"
                maxLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Новый пароль:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Не менее 6 символов"
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Повторите пароль:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
                required
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Сохранение...' : 'Изменить пароль'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                ← Назад
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
