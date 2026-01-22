import { useState } from 'react'

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ dish: '', rating: 5, comment: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Отправка отзыва через API
    setReviews([...reviews, { ...newReview, id: Date.now(), date: new Date() }])
    setNewReview({ dish: '', rating: 5, comment: '' })
  }

  return (
    <div className="page">
      <h1>Отзывы о блюдах</h1>
      
      <form onSubmit={handleSubmit} className="review-form">
        <h2>Оставить отзыв</h2>
        <input
          type="text"
          placeholder="Название блюда"
          value={newReview.dish}
          onChange={(e) => setNewReview({ ...newReview, dish: e.target.value })}
          required
        />
        <div className="rating-input">
          <label>Оценка:</label>
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n} ⭐</option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Ваш комментарий..."
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          required
        />
        <button type="submit">Отправить отзыв</button>
      </form>

      <div className="reviews-list">
        <h2>Мои отзывы</h2>
        {reviews.length === 0 ? (
          <p>Вы еще не оставили ни одного отзыва</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <h3>{review.dish}</h3>
              <p className="rating">{'⭐'.repeat(review.rating)}</p>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews
