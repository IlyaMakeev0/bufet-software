import { useState, useEffect } from 'react'
import StudentDashboard from '../components/StudentDashboard'
import ChefDashboard from '../components/ChefDashboard'
import AdminDashboard from '../components/AdminDashboard'
import './Dashboard.css'

function Dashboard({ user, logout }) {
  if (!user) return null

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🏫 Школьная столовая</h1>
        <div className="user-info">
          <span>{user.firstName} {user.lastName}</span>
          <button onClick={logout} className="btn btn-danger">Выйти</button>
        </div>
      </header>

      {user.role === 'student' && <StudentDashboard user={user} />}
      {user.role === 'chef' && <ChefDashboard user={user} />}
      {user.role === 'admin' && <AdminDashboard user={user} />}
    </div>
  )
}

export default Dashboard
