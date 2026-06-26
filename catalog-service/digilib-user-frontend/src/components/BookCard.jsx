import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import BookCover from './BookCover';

export default function BookCard({ book, favorite, onToggleFavorite }) {
  const detailUrl = `/books/${encodeURIComponent(book.id)}`;

  function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(book);
  }

  return (
    <article className="book-card">
      <button
        type="button"
        className={`heart-btn ${favorite ? 'active' : ''}`}
        onClick={handleFavorite}
        aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        title={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart size={16} />
      </button>
      <Link to={detailUrl} className="cover-link"><BookCover book={book} /></Link>
      <div className="book-info">
        <Link to={detailUrl} className="book-title">{book.title}</Link>
        <span className="book-author">{book.author}</span>
        <div className="book-meta"><Star size={14} className="star" /> {book.rating} <span>({book.reviews || 0})</span></div>
        <div className={`book-status ${book.availableCopies > 0 ? '' : 'red'}`}>{book.availableCopies > 0 ? `Còn ${book.availableCopies} bản` : 'Hết sách'}</div>
      </div>
      <Link className="btn btn-soft btn-full" to={detailUrl}>Xem chi tiết</Link>
    </article>
  );
}
