// Middleware для проверки аутентификации и ролей

export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Не авторизован. Войдите в систему' })
  }
  next()
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Не авторизован. Войдите в систему' })
    }
    
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ 
        error: 'Доступ запрещен. Недостаточно прав',
        required: roles,
        current: req.session.user.role
      })
    }
    
    next()
  }
}

export const requireStudent = requireRole('student')
export const requireChef = requireRole('chef')
export const requireAdmin = requireRole('admin')
export const requireStaff = requireRole('chef', 'admin')
