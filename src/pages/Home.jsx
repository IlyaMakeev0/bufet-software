import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>🏫 Школьная столовая</h1>
        <p className="subtitle">Система управления питанием в учебном заведении</p>
        
        <div className="role-grid">
          <Link to="/student" className="role-card">
            <div className="role-icon">👨‍🎓</div>
            <div className="role-name">Ученик</div>
            <div className="role-desc">Регистрация, вход, заказ питания, абонементы, отзывы</div>
          </Link>
          
          <Link to="/chef" className="role-card">
            <div className="role-icon">👨‍🍳</div>
            <div className="role-name">Повар</div>
            <div className="role-desc">Регистрация и вход для сотрудников, учет выдачи</div>
          </Link>
          
          <Link to="/admin" className="role-card">
            <div className="role-icon">👨‍💼</div>
            <div className="role-name">Администратор</div>
            <div className="role-desc">Регистрация и вход для администрации, статистика</div>
          </Link>
        </div>
        
        <div className="info-box">
          <h3>📱 Новая функция!</h3>
          <p><strong>Добавлен номер телефона</strong> при регистрации для лучшей связи.</p>
          <p>Все пользователи должны зарегистрироваться самостоятельно.</p>
        </div>
      </div>
    </div>
  )
}

export default Home
