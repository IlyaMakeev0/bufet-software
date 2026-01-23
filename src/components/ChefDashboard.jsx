import { useState, useEffect } from 'react'

function ChefDashboard({ user }) {
  const [pendingMeals, setPendingMeals] = useState([])
  const [issuedToday, setIssuedToday] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pendingRes, issuedRes] = await Promise.all([
        fetch('/api/chef/pending-meals'),
        fetch('/api/chef/issued-today')
      ])

      if (pendingRes.ok) setPendingMeals(await pendingRes.json())
      if (issuedRes.ok) setIssuedToday(await issuedRes.json())
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const issueMeal = async (mealId) => {
    try {
      const res = await fetch('/api/chef/issue-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId })
      })

      if (res.ok) {
        alert('Блюдо выдано успешно!')
        loadData()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка выдачи блюда')
      }
    } catch (error) {
      alert('Ошибка подключения к серверу')
    }
  }

  return (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{pendingMeals.length}</div>
          <div className="stat-label">Ожидают выдачи</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{issuedToday.length}</div>
          <div className="stat-label">Выдано сегодня</div>
        </div>
      </div>

      <div className="section">
        <h2>⏳ Ожидают выдачи</h2>
        {pendingMeals.length === 0 ? (
          <p>Нет блюд, ожидающих выдачи</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Класс</th>
                  <th>Блюдо</th>
                  <th>Тип</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {pendingMeals.map(meal => (
                  <tr key={meal.id}>
                    <td>{meal.studentName}</td>
                    <td>{meal.className}</td>
                    <td>{meal.menuName}</td>
                    <td>
                      <span className={`meal-type ${meal.mealType}`}>
                        {meal.mealType}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-success"
                        onClick={() => issueMeal(meal.id)}
                      >
                        Выдать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section">
        <h2>✅ Выдано сегодня</h2>
        {issuedToday.length === 0 ? (
          <p>Сегодня еще ничего не выдано</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Класс</th>
                  <th>Блюдо</th>
                  <th>Тип</th>
                  <th>Время</th>
                </tr>
              </thead>
              <tbody>
                {issuedToday.map(meal => (
                  <tr key={meal.id}>
                    <td>{meal.studentName}</td>
                    <td>{meal.className}</td>
                    <td>{meal.menuName}</td>
                    <td>
                      <span className={`meal-type ${meal.mealType}`}>
                        {meal.mealType}
                      </span>
                    </td>
                    <td>{new Date(meal.issuedAt).toLocaleTimeString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChefDashboard
