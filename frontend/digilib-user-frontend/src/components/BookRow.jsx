import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import BookCover from './BookCover';

export default function BookRow({ book }) {
  const available = Number(book.availableCopies || 0) > 0;

  return (
    <article className="book-row">
      <Link to={`/books/${book.id}`} className="row-cover-link" aria-label={`Xem chi tiết ${book.title}`}>
        <BookCover book={book} className="row-cover" />
      </Link>

      <div className="row-main">
        <Link to={`/books/${book.id}`} className="row-title">{book.title}</Link>
        <span className="row-author">{book.author}</span>
        <div className="row-meta">
          <span><Star size={14} className="star" /> {book.rating || 4.6}</span>
          {book.publishedYear && <span>• {book.publishedYear}</span>}
          {book.language && <span>• {book.language}</span>}
          {book.publisher && <span>• {book.publisher}</span>}
        </div>
        <p className="row-description line-clamp">
          {book.description || 'Thông tin mô tả sách đang được cập nhật.'}
        </p>
        <div className="tag-list">
          {(book.tags || []).slice(0, 3).map(tag => <span className="tag" key={tag}>{tag}</span>)}
        </div>
      </div>

      <aside className="row-side">
        <b className={`availability ${available ? 'green' : 'red'}`}>{available ? `Còn ${book.availableCopies} bản` : 'Hết sách'}</b>
        <span className="location"><MapPin size={15} /> {book.location || 'Đang cập nhật vị trí'}</span>
        <Link to={`/books/${book.id}`} className="btn btn-soft">Xem chi tiết</Link>
      </aside>
    </article>
  );
}
