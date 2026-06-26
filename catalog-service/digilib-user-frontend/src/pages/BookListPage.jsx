import React, { useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BookCard from '../components/BookCard';
import { addFavoriteBook, getBooks, getFavoriteBooks, removeFavoriteBook } from '../services/catalogApi';
import { getFavorites, setFavorites } from '../utils/libraryStore';
import { useToast } from '../components/ToastProvider';

function hasFavorite(ids, id) {
  return ids.some(x => String(x) === String(id));
}

export default function BookListPage({ mode }) {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [favorites, setFavs] = useState(getFavorites());
  const toast = useToast();

  useEffect(() => {
    async function load() {
      setBooks(await getBooks());
      getFavoriteBooks().then(real => {
        const ids = real.map(b => b.id);
        setFavs(ids);
        setFavorites(ids);
      }).catch(() => {});
    }
    load();
  }, []);

  const categories = useMemo(() => [...new Set(books.map(b => b.category).filter(Boolean))], [books]);
  const filtered = books
    .filter(b => mode === 'new' ? b.isNew : b.isFeatured)
    .filter(b => !keyword || `${b.title} ${b.author}`.toLowerCase().includes(keyword.toLowerCase()))
    .filter(b => !category || b.category === category);

  async function toggleFavorite(book) {
    const exists = hasFavorite(favorites, book.id);
    const next = exists ? favorites.filter(id => String(id) !== String(book.id)) : [...favorites, book.id];
    setFavs(next);
    setFavorites(next);
    try {
      if (exists) await removeFavoriteBook(book.id);
      else await addFavoriteBook(book.id);
      toast.show(exists ? `Đã xóa “${book.title}” khỏi yêu thích` : `Đã lưu “${book.title}” vào yêu thích`, 'success');
    } catch (error) {
      toast.show('Đã cập nhật tạm trên máy, nhưng backend chưa đồng bộ.', 'warning');
      console.warn(error.message);
    }
  }

  return (
    <div className="page-fade">
      <PageHeader title={mode === 'new' ? 'Sách mới' : 'Sách nổi bật'} description={mode === 'new' ? 'Khám phá những đầu sách mới được cập nhật gần đây' : 'Khám phá những đầu sách được đọc nhiều và đánh giá cao'} />
      <div className="search-panel slim">
        <label><input placeholder="Tìm theo từ khóa..." value={keyword} onChange={e => setKeyword(e.target.value)} /></label>
        <label><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Tất cả thể loại</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <button className="btn btn-primary"><Filter size={18} /> Lọc</button>
        <button className="btn btn-outline" onClick={() => { setKeyword(''); setCategory(''); }}><RotateCcw size={18} /> Đặt lại</button>
      </div>
      <div className="stat-grid three">
        <div className="quick-stat"><span>{mode === 'new' ? 'Mới hôm nay' : 'Được quan tâm'}</span><b>{mode === 'new' ? filtered.length : filtered.length}</b><small>đầu sách</small></div>
        <div className="quick-stat"><span>{mode === 'new' ? 'Mới tuần này' : 'Đánh giá cao'}</span><b>{filtered.filter(b => b.rating >= 4.5).length}</b><small>đầu sách</small></div>
        <div className="quick-stat"><span>{mode === 'new' ? 'Mới tháng này' : 'Xu hướng tuần này'}</span><b>{filtered.filter(b => b.availableCopies > 0).length}</b><small>còn có thể mượn</small></div>
      </div>
      <div className="book-grid list-page-grid">{filtered.map(book => <BookCard key={book.id} book={book} favorite={hasFavorite(favorites, book.id)} onToggleFavorite={toggleFavorite} />)}</div>
      <div className="pagination"><button>‹</button><b>1</b><button>2</button><button>3</button><button>4</button><button>›</button></div>
    </div>
  );
}
