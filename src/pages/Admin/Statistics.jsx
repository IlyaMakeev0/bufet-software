function Statistics() {
  const stats = {
    totalPayments: 125000,
    todayVisits: 245,
    weekVisits: 1230,
    activeSubscriptions: 89
  }

  return (
    <div className="page">
      <h1>Статистика</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Оплаты за месяц</h3>
          <p className="stat-value">{stats.totalPayments.toLocaleString()} ₽</p>
        </div>
        <div className="stat-card">
          <h3>Посещений сегодня</h3>
          <p className="stat-value">{stats.todayVisits}</p>
        </div>
        <div className="stat-card">
          <h3>Посещений за неделю</h3>
          <p className="stat-value">{stats.weekVisits}</p>
        </div>
        <div className="stat-card">
          <h3>Активных абонементов</h3>
          <p className="stat-value">{stats.activeSubscriptions}</p>
        </div>
      </div>

      <div className="chart-placeholder">
        <h2>График посещаемости</h2>
        <p>Здесь будет график посещаемости по дням</p>
      </div>
    </div>
  )
}

export default Statistics
