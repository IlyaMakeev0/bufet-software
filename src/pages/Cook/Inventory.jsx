import { useState } from 'react'

function Inventory() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Мука', quantity: 10, unit: 'кг', minQuantity: 5 },
    { id: 2, name: 'Молоко', quantity: 3, unit: 'л', minQuantity: 5 },
    { id: 3, name: 'Яйца', quantity: 50, unit: 'шт', minQuantity: 30 }
  ])

  const isLowStock = (item) => item.quantity <= item.minQuantity

  return (
    <div className="page">
      <h1>Контроль остатков</h1>
      
      <div className="inventory-list">
        {inventory.map(item => (
          <div 
            key={item.id} 
            className={`inventory-card ${isLowStock(item) ? 'low-stock' : ''}`}
          >
            <h3>{item.name}</h3>
            <p className="quantity">
              {item.quantity} {item.unit}
            </p>
            {isLowStock(item) && (
              <span className="warning">⚠️ Требуется закупка</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Inventory
