import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/Student/Dashboard'
import CookDashboard from './pages/Cook/Dashboard'
import AdminDashboard from './pages/Admin/Dashboard'
import './styles/App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/student/*" 
          element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cook/*" 
          element={user?.role === 'cook' ? <CookDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/*" 
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
