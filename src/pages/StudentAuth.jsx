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
        <h1>👨‍🎓 Вход для ученика</h1>
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
        <h1>🔐 Вход для ученика</h1>
        
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
    phone: '',
    className: ''
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

    if (formData.className.length < 1 || formData.className.length > 5) {
      setError('Класс должен содержать от 1 до 5 символов')
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
        <h1>📝 Регистрация ученика</h1>
        
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
            <small style={{ color: '#7f8c8d' }}>От 10 до 15 цифр. Формат: +7XXX XXX XX XX</small>
          </div>
          
          <div className="form-group">
            <label>Класс:</label>
            <input 
              type="text" 
              name="className"
              value={formData.className}
              onChange={handleChange}
              required 
              minLength="1"
              maxLength="5"
              placeholder="10А"
            />
            <small style={{ color: '#7f8c8d' }}>От 1 до 5 символов. Примеры: 10А, 11Б, 9</small>
          </div>
          
          <button type="submit" className="btn btn-success">Зарегистрироваться</button>
          <Link to="/student" className="btn btn-secondary">← Назад</Link>
        </form>
      </div>
    </div>
  )
}

export default StudentAuth
