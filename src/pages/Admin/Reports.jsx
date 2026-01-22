function Reports() {
  const handleGenerateReport = (type) => {
    // TODO: Генерация отчета через API
    alert(`Генерация отчета: ${type}`)
  }

  return (
    <div className="page">
      <h1>Отчеты</h1>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3>Отчет по питанию</h3>
          <p>Статистика выданных завтраков и обедов</p>
          <button onClick={() => handleGenerateReport('питание')}>
            Сформировать
          </button>
        </div>

        <div className="report-card">
          <h3>Отчет по затратам</h3>
          <p>Расходы на закупку продуктов</p>
          <button onClick={() => handleGenerateReport('затраты')}>
            Сформировать
          </button>
        </div>

        <div className="report-card">
          <h3>Отчет по посещаемости</h3>
          <p>Статистика посещений столовой</p>
          <button onClick={() => handleGenerateReport('посещаемость')}>
            Сформировать
          </button>
        </div>

        <div className="report-card">
          <h3>Финансовый отчет</h3>
          <p>Оплаты и абонементы</p>
          <button onClick={() => handleGenerateReport('финансы')}>
            Сформировать
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reports
