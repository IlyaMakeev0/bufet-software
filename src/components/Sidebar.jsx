import { Link, useLocation } from 'react-router-dom'
import '../styles/Sidebar.css'

function Sidebar({ items, role }) {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🍽️ Столовая</h2>
        <p className="role">{role}</p>
      </div>
      
      <nav className="sidebar-nav">
        {items.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/login" className="logout">
          Выход
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
