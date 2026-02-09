import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Auth.css'

function AdminAuth({ setUser }) {
  return (
    <Routes>
      <Route path="/" element={<AdminChoice />} />
      <Route path="/login" element={<AdminLogin setUser={setUser} />} />
      <Route path="/register" element={<AdminRegister setUser={setUser} />} />
    </Routes>
  )
}

function AdminChoice() {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Вход для администратора</h1>
        <p className="auth-subtitle">Выберите действие:</p>
        
        <div className="btn-group">
          <Link to="/admin/login" className="btn btn-primary">Войти в аккаунт</Link>
          <Link to="/admin/register" className="btn btn-success">Зарегистрироваться</Link>
          <Link to="/" className="btn btn-secondary">← На главную</Link>
        </div>
      </div>
    </div>
  )
}

function AdminLogin({ setUser }) {
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
        body: JSON.stringify({ email, password, role: 'admin' })
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
        <h1>Вход для администратора</h1>
        
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
          <Link to="/admin" className="btn btn-secondary">← Назад</Link>
        </form>
        
        <div className="auth-link">
          <p>Нет аккаунта? <Link to="/admin/register">Зарегистрируйтесь</Link></p>
          <p><Link to="/forgot-password">Забыли пароль?</Link></p>
        </div>
      </div>
    </div>
  )
}

function AdminRegister({ setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    position: '',
    secretCode: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    if (formData.phone.length < 10) {
      setError('Номер телефона должен содержать минимум 10 цифр')
      return
    }

    if (formData.position.length < 2 || formData.position.length > 50) {
      setError('Должность должна содержать от 2 до 50 символов')
      return
    }

    if (!formData.secretCode) {
      setError('Введите код подтверждения администратора')
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          secretCode: formData.secretCode,
          phone: null, // Optional field
          className: null, // Not needed for admin
          role: 'admin'
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
      console.error('Registration error:', err)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Регистрация администратора</h1>
        
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
            <label>Номер телефона:</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required 
              minLength="10"
              maxLength="15"
              placeholder="+7XXXXXXXXXX или 8XXXXXXXXXX"
            />
            <small style={{ color: '#7f8c8d' }}>От 10 до 15 цифр</small>
          </div>
          
          <div className="form-group">
            <label>Должность:</label>
            <input 
              type="text" 
              name="position"
              value={formData.position}
              onChange={handleChange}
              required 
              minLength="2"
              maxLength="50"
              placeholder="Директор"
            />
            <small style={{ color: '#7f8c8d' }}>От 2 до 50 символов</small>
          </div>
          
          <div className="form-group">
            <label>Код подтверждения:</label>
            <input 
              type="password" 
              name="secretCode"
              value={formData.secretCode}
              onChange={handleChange}
              required 
              placeholder="Введите код подтверждения администратора"
            />
            <small style={{ color: '#e74c3c', fontWeight: 'bold' }}>
              Код выдается вышестоящим руководством
            </small>
          </div>
          
          <button type="submit" className="btn btn-success">Зарегистрироваться</button>
          <Link to="/admin" className="btn btn-secondary">← Назад</Link>
        </form>
      </div>
    </div>
  )
}

export default AdminAuth
