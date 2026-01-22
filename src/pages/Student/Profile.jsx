import { useState } from 'react'

function Profile() {
  const [profile, setProfile] = useState({
    name: 'Иван Иванов',
    email: 'ivan@school.ru',
    allergens: [],
    preferences: ''
  })

  const allergensList = ['глютен', 'лактоза', 'яйца', 'орехи', 'рыба', 'соя']

  const handleAllergenToggle = (allergen) => {
    setProfile(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }))
  }

  const handleSave = () => {
    // TODO: Сохранение профиля через API
    alert('Профиль сохранен')
  }

  return (
    <div className="page">
      <h1>Профиль</h1>
      
      <div className="profile-form">
        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Аллергены</label>
          <div className="allergens-list">
            {allergensList.map(allergen => (
              <label key={allergen} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={profile.allergens.includes(allergen)}
                  onChange={() => handleAllergenToggle(allergen)}
                />
                {allergen}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Пищевые предпочтения</label>
          <textarea
            value={profile.preferences}
            onChange={(e) => setProfile({ ...profile, preferences: e.target.value })}
            placeholder="Укажите ваши пищевые предпочтения..."
          />
        </div>

        <button onClick={handleSave}>Сохранить</button>
      </div>
    </div>
  )
}

export default Profile
