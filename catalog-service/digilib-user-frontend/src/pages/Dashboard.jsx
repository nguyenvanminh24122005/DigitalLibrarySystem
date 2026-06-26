import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Heart, TrendingUp } from 'lucide-react';
import { addFavoriteBook, getBooks, getCurrentBorrowings, getFavoriteBooks, getNotifications, getReadingProgress, removeFavoriteBook } from '../services/catalogApi';
import { mockNotifications } from '../data/mockData';
import { getFavorites, getLoans, getReadProgress, setFavorites } from '../utils/libraryStore';
import { daysLeft } from '../utils/storage';
import BookCard from '../components/BookCard';
import BookCover from '../components/BookCover';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/ToastProvider';
import { useProfile } from '../context/ProfileContext';

function hasFavorite(ids, id) {
  return ids.some(x => String(x) === String(id));
}

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(getFavorites());
  const [loans, setLoansState] = useState(getLoans());
  const [progress, setProgress] = useState(getReadProgress());
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();
  const toast = useToast();
  const { profile } = useProfile();

  useEffect(() => {
    async function load() {
      const list = await getBooks();
      setBooks(list);
      getCurrentBorrowings().then(real => { setLoansState(real); }).catch(() => {});
      getFavoriteBooks().then(real => {
        const ids = real.map(b => b.id);
        setFavoriteIds(ids);
        setFavorites(ids);
      }).catch(() => {});
      getReadingProgress().then(real => { if (Object.keys(real).length) setProgress(real); }).catch(() => {});
      getNotifications().then(real => { setNotifications(real); }).catch(() => {});
    }
    load();
  }, []);

  async function toggleFavorite(book) {
    const exists = hasFavorite(favoriteIds, book.id);
    const next = exists ? favoriteIds.filter(id => String(id) !== String(book.id)) : [...favoriteIds, book.id];
    setFavoriteIds(next);
    setFavorites(next);
    try {
      if (exists) await removeFavoriteBook(book.id);
      else await addFavoriteBook(book.id);
      toast.show(exists ? `Đã xóa “${book.title}” khỏi yêu thích` : `Đã lưu “${book.title}” vào yêu thích`, 'success');
    } catch (error) {
      toast.show('Đã cập nhật trên máy, nhưng chưa đồng bộ được backend.', 'warning', 'Lưu tạm yêu thích');
      console.warn(error.message);
    }
  }

  const featured = books.filter(b => b.isFeatured).slice(0, 5);
  const recommended = books.slice(1, 6);
  const loanBooks = loans.map(loan => ({ loan, book: loan.book || books.find(b => String(b.id) === String(loan.bookId)) })).filter(x => x.book);
  const reading = Object.entries(progress).map(([bookId, percent]) => ({ book: books.find(b => String(b.id) === String(bookId)), percent })).filter(x => x.book).slice(0, 3);

  const stats = useMemo(() => [
    { icon: <BookOpen />, value: loans.filter(x => x.status === 'Borrowed').length, label: 'Sách đang mượn', note: 'Đã được duyệt' },
    { icon: <CalendarDays />, value: `${loanBooks.filter(x => x.loan.status === 'Borrowed' && daysLeft(x.loan.dueDate) <= 7).length || 0} cuốn`, label: 'Sắp đến hạn', note: 'Theo dõi hạn trả' },
    { icon: <Heart />, value: favoriteIds.length, label: 'Sách yêu thích', note: 'Danh sách đã lưu' },
    { icon: <TrendingUp />, value: '68%', label: 'Mục tiêu đọc tháng 6', note: 'Đang tiến bộ' }
  ], [loans, favoriteIds.length, loanBooks]);

  return (
    <div className="dashboard-grid page-fade">
      <section className="dashboard-main">
        <div className="hero-card">
          <div>
            <h1>Xin chào, {profile.name}! 👋</h1>
            <p>Chào mừng bạn quay trở lại thư viện số</p>
          </div>
          <div className="hero-art"><BookOpen size={74} /></div>
        </div>

        <div className="stat-grid four">
          {stats.map((item) => <StatCard key={item.label} {...item} />)}
        </div>

        <section className="panel">
          <div className="section-head"><h2>Sách nổi bật</h2><Link to="/featured">Xem tất cả →</Link></div>
          {featured.length ? <div className="book-grid compact-grid">{featured.map(book => <BookCard key={book.id} book={book} favorite={hasFavorite(favoriteIds, book.id)} onToggleFavorite={toggleFavorite} />)}</div> : <EmptyState type="books" title="Chưa có sách nổi bật" message="Dữ liệu sách sẽ hiển thị khi API sẵn sàng." />}
        </section>

        <section className="panel">
          <div className="section-head"><h2>Gợi ý dành riêng cho bạn</h2><Link to="/search">Xem tất cả →</Link></div>
          <div className="book-grid compact-grid">{recommended.map(book => <BookCard key={book.id} book={book} favorite={hasFavorite(favoriteIds, book.id)} onToggleFavorite={toggleFavorite} />)}</div>
        </section>

        <section className="panel">
          <div className="section-head"><h2>Đọc tiếp eBook</h2><Link to="/reader/1">Xem tất cả →</Link></div>
          {reading.length ? <div className="reading-list">
            {reading.map(({ book, percent }) => (
              <div className="reading-row" key={book.id}>
                <BookCover book={book} className="mini-cover" />
                <div><b>{book.title}</b><span>{book.author}</span><div className="progress"><i style={{ width: `${percent}%` }} /></div></div>
                <span>{percent}%</span><Link className="btn btn-soft" to={`/reader/${book.id}`}>Tiếp tục</Link>
              </div>
            ))}
          </div> : <EmptyState type="books" title="Chưa có tiến độ đọc" message="Mở một eBook để bắt đầu theo dõi tiến độ." />}
        </section>
      </section>

      <aside className="right-col">
        <section className="panel">
          <div className="section-head"><h2>Sách đang mượn</h2><Link to="/borrowed">Xem tất cả →</Link></div>
          <div className="side-list">
            {loanBooks.slice(0, 3).map(({ book, loan }) => {
              const left = daysLeft(loan.dueDate);
              return <div className="side-book" key={loan.loanId}><BookCover book={book} className="mini-cover" /><div><b>{book.title}</b><span>{book.author}</span></div><small className={loan.status === 'PendingApproval' ? 'blue-text' : left <= 7 ? 'orange-text' : 'green'}>{loan.status === 'PendingApproval' ? 'Chờ duyệt' : left < 0 ? `Quá ${Math.abs(left)} ngày` : `Còn ${left} ngày`}</small></div>;
            })}
          </div>
          <button className="btn btn-soft btn-full" onClick={() => navigate('/borrowed')}>Xem sách đang mượn</button>
        </section>

        <section className="panel">
          <div className="section-head"><h2>Sự kiện sắp diễn ra</h2><a>Xem tất cả →</a></div>
          <div className="event-list">
            <div><b>Workshop: Kỹ năng đọc sách hiệu quả</b><span>25/06/2025 · 14:00</span><button className="btn btn-primary sm">Đăng ký</button></div>
            <div><b>Ngày hội đọc sách 2025</b><span>05/07/2025 · 08:00</span><button className="btn btn-outline sm">Đăng ký</button></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head"><h2>Thông báo mới</h2><Link to="/notifications">Xem tất cả →</Link></div>
          <div className="notify-mini">
            {notifications.slice(0, 3).map(n => <div key={n.id}><b>{n.title}</b><span>{n.message}</span><small>{n.time}</small></div>)}
          </div>
        </section>
      </aside>
    </div>
  );
}
