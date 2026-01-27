import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Home.css'

function Home() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.body.className = savedTheme === 'dark' ? 'dark-theme' : ''
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.className = newTheme === 'dark' ? 'dark-theme' : ''
  }

  return (
    <div className="home-container">
      <div className="theme-switcher" onClick={toggleTheme}>
        <span className="theme-switcher-text">{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
      </div>

      <div className="home-content">
        <h1>Школьная столовая</h1>
        <p className="subtitle">Система управления питанием в учебном заведении</p>
        
        <div className="role-grid">
          <Link to="/student" className="role-card">
            <div className="role-icon">STUDENT</div>
            <div className="role-name">Ученик</div>
            <div className="role-desc">Регистрация, вход, заказ питания, абонементы, отзывы</div>
          </Link>
          
          <Link to="/chef" className="role-card">
            <div className="role-icon">CHEF</div>
            <div className="role-name">Повар</div>
            <div className="role-desc">Регистрация и вход для сотрудников, учет выдачи</div>
          </Link>
          
          <Link to="/admin" className="role-card">
            <div className="role-icon">ADMIN</div>
            <div className="role-name">Администратор</div>
            <div className="role-desc">Регистрация и вход для администрации, статистика</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
