import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import '../styles/Auth.css'

function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.login(email, password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      
      // Перенаправление в зависимости от роли
      const routes = {
        student: '/student',
        cook: '/cook',
        admin: '/admin'
      }
      navigate(routes[data.user.role])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Вход в систему</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <p>
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
        <div className="test-accounts">
          <small>Тестовые аккаунты:</small>
          <small>student@test.ru / 123456</small>
          <small>cook@test.ru / 123456</small>
          <small>admin@test.ru / 123456</small>
        </div>
      </div>
    </div>
  )
}

export default Login
