import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Auth.css'

function StudentAuth({ setUser }) {
  return (
    <Routes>
      <Route path="/" element={<StudentChoice />} />
      <Route path="/login" element={<StudentLogin setUser={setUser} />} />
      <Route path="/register" element={<StudentRegister setUser={setUser} />} />
    </Routes>
  )
}

function StudentChoice() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Вход для ученика</h1>
        <p className="auth-subtitle">Выберите действие:</p>
        
        <div className="btn-group">
          <Link to="/student/login" className="btn btn-primary">Войти в аккаунт</Link>
          <Link to="/student/register" className="btn btn-success">Зарегистрироваться</Link>
          <Link to="/" className="btn btn-secondary">← На главную</Link>
        </div>
      </div>
    </div>
  )
}

function StudentLogin({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'student' })
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        navigate('/dashboard')
      } else {
        setError(data.error || 'Ошибка входа')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Вход для ученика</h1>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Введите ваш email"
            />
          </div>
          
          <div className="form-group">
            <label>Пароль:</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Введите пароль"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Войти</button>
          <Link to="/student" className="btn btn-secondary">← Назад</Link>
        </form>
        
        <div className="auth-link">
          <p>Нет аккаунта? <Link to="/student/register">Зарегистрируйтесь</Link></p>
          <p><Link to="/forgot-password">Забыли пароль?</Link></p>
        </div>
      </div>
    </div>
  )
}

function StudentRegister({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    className: '',
    verificationCode: ''
  })
  const [error, setError] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const sendVerificationCode = async () => {
    if (!formData.email) {
      setError('Введите email для получения кода')
      return
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Введите корректный email адрес')
      return
    }

    setSendingCode(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await res.json()

      if (res.ok) {
        setCodeSent(true)
        setError('')
        
        // Если в режиме разработки возвращается код
        if (data.devCode) {
          alert(`🔧 РЕЖИМ РАЗРАБОТКИ\n\nВаш код подтверждения: ${data.devCode}\n\n${data.warning || 'Email сервис отключен (SKIP_EMAIL=true)'}\n\nВведите этот код в поле ниже.`)
        } else {
          alert(`✅ Код подтверждения отправлен на ${formData.email}\n\nПроверьте вашу почту (включая папку "Спам")`)
        }
      } else {
        setError(data.error || 'Ошибка отправки кода')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    // Validate class format (e.g., 1А, 11Б, 9В)
    const classRegex = /^([1-9]|1[0-1])[А-Яа-я]$/
    if (!classRegex.test(formData.className)) {
      setError('Класс должен быть в формате: 1А, 5Б, 11В (от 1 до 11 класса)')
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'student'
        })
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        navigate('/dashboard')
      } else {
        setError(data.error || 'Ошибка регистрации')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Регистрация ученика</h1>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
              placeholder="example@school.ru"
            />
          </div>
          
          <div className="form-group">
            <label>Пароль:</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
              minLength="6"
              placeholder="Не менее 6 символов"
            />
          </div>
          
          <div className="form-group">
            <label>Повторите пароль:</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
              placeholder="Повторите пароль"
            />
          </div>
          
          <div className="form-group">
            <label>Имя:</label>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required 
              placeholder="Иван"
            />
          </div>
          
          <div className="form-group">
            <label>Фамилия:</label>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required 
              placeholder="Иванов"
            />
          </div>
          
          <div className="form-group">
            <label>Класс:</label>
            <input 
              type="text" 
              name="className"
              value={formData.className}
              onChange={handleChange}
              required 
              minLength="2"
              maxLength="3"
              placeholder="10А"
            />
            <small style={{ color: '#7f8c8d' }}>Формат: 1А, 5Б, 11В (от 1 до 11 класса)</small>
          </div>
          
          <div className="form-group">
            <label>Код подтверждения:</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="text" 
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  required 
                  placeholder="Введите 6-значный код"
                  maxLength="6"
                  disabled={!codeSent}
                  style={{ marginBottom: '8px' }}
                />
                {codeSent && (
                  <small style={{ color: '#4caf50', display: 'block' }}>
                    ✓ Код отправлен на {formData.email}
                  </small>
                )}
                {!codeSent && (
                  <small style={{ color: '#7f8c8d', display: 'block' }}>
                    Сначала получите код на email
                  </small>
                )}
              </div>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={sendVerificationCode}
                disabled={sendingCode || !formData.email}
                style={{ minWidth: '180px', whiteSpace: 'nowrap' }}
              >
                {sendingCode ? 'Отправка...' : codeSent ? 'Отправить снова' : 'Получить код'}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-success">Зарегистрироваться</button>
          <Link to="/student" className="btn btn-secondary">← Назад</Link>
        </form>
      </div>
    </div>
  )
}

export default StudentAuth
