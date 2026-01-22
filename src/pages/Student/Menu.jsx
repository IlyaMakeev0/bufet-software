import { useState, useEffect } from 'react'
import { api } from '../../api/client'

function Menu() {
  const [menu, setMenu] = useState({ breakfast: [], lunch: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    try {
      const data = await api.getMenu()
      setMenu(data)
    } catch (error) {
      console.error('Ошибка загрузки меню:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="page">Загрузка...</div>

  return (
    <div className="page">
      <h1>Меню столовой</h1>
      
      <section>
        <h2>Завтраки</h2>
        <div className="menu-grid">
          {menu.breakfast.map(item => (
            <div key={item.id} className="menu-card">
              <h3>{item.name}</h3>
              <p className="price">{item.price} ₽</p>
              {item.allergens && (
                <p className="allergens">Аллергены: {item.allergens}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Обеды</h2>
        <div className="menu-grid">
          {menu.lunch.map(item => (
            <div key={item.id} className="menu-card">
              <h3>{item.name}</h3>
              <p className="price">{item.price} ₽</p>
              {item.allergens && (
                <p className="allergens">Аллергены: {item.allergens}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Menu
