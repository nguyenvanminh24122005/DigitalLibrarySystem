import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Bookmark, CheckCircle2, Heart, MapPin, Star } from 'lucide-react';
import BookCover from '../components/BookCover';
import EmptyState from '../components/EmptyState';
import { BorrowConfirmModal, BorrowSuccessModal } from '../components/BorrowModals';
import { getBookAvailability, getBookById, getBooks, borrowCopy, getFavoriteBooks, addFavoriteBook, removeFavoriteBook } from '../services/catalogApi';
import { createLoan, getFavorites, getLoans, setFavorites, setHistory, getHistory, setLoans } from '../utils/libraryStore';
import { useToast } from '../components/ToastProvider';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [copies, setCopies] = useState([]);
  const [related, setRelated] = useState([]);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState({ open: false, loan: null });
  const [loading, setLoading] = useState(false);
  const [favorites, setFavs] = useState(getFavorites());
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const b = await getBookById(id);
      const availability = await getBookAvailability(id);
      const list = await getBooks();
      setBook({ ...b, ...availability, copies: availability.copies.length ? availability.copies : b.copies });
      setCopies(availability.copies.length ? availability.copies : b.copies);
      setRelated(list.filter(x => x.category === b.category && String(x.id) !== String(b.id)).slice(0, 4));
      getFavoriteBooks().then(favs => { setFavs(favs.map(x => x.id)); }).catch(() => {});
    }
    load().catch(() => setBook(null));
  }, [id]);

  const availableCopies = useMemo(() => copies.filter(c => c.status === 'Available'), [copies]);

  async function toggleFavorite() {
    const exists = favorites.includes(book.id);
    const next = exists ? favorites.filter(x => x !== book.id) : [...favorites, book.id];
    setFavs(next); setFavorites(next);
    try {
      if (exists) await removeFavoriteBook(book.id);
      else await addFavoriteBook(book.id);
    } catch (error) {
      console.warn('Không đồng bộ được yêu thích với backend:', error.message);
    }
    toast.show(exists ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã lưu vào danh sách yêu thích', 'success');
  }

  function openBorrow(copy = availableCopies[0]) {
    if (!copy) return toast.show('Sách hiện không còn bản sao khả dụng. Vui lòng chọn sách khác.', 'warning', 'Không thể mượn sách');
    setSelectedCopy(copy); setConfirmOpen(true);
  }

  async function confirmBorrow(book, copy) {
    setLoading(true);
    const localPending = {
      ...createLoan(book, copy),
      loanId: `P${Date.now()}`,
      borrowedAt: new Date().toISOString().slice(0, 10),
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'PendingApproval',
      book
    };

    let loan = localPending;
    try {
      const apiLoan = await borrowCopy(book.id, copy.copyId || copy.id);
      loan = {
        ...localPending,
        ...apiLoan,
        status: apiLoan?.status || 'PendingApproval',
        borrowedAt: apiLoan?.borrowedAt || localPending.borrowedAt,
        dueDate: apiLoan?.dueDate || localPending.dueDate,
        barcode: apiLoan?.barcode || copy.barcode,
        location: apiLoan?.location || copy.location || book.location,
        book
      };
    } catch (error) {
      console.warn('Không gửi được yêu cầu mượn lên backend, lưu tạm trên giao diện:', error.message);
      toast.show('Backend chưa nhận yêu cầu. Hệ thống đang lưu tạm trên giao diện.', 'warning', 'Lưu tạm yêu cầu');
    }

    const nextLoans = [loan, ...getLoans().filter(x => String(x.loanId) !== String(loan.loanId))];
    setLoans(nextLoans);
    setHistory([{ id: `H${Date.now()}`, ...loan, status: loan.status }, ...getHistory()]);
    setCopies(prev => prev.map(c => String(c.copyId || c.id) === String(copy.copyId || copy.id) ? { ...c, status: 'PendingApproval', dueDate: loan.dueDate } : c));
    setLoading(false); setConfirmOpen(false); setSuccess({ open: true, loan });
    toast.show(`Đã gửi yêu cầu mượn “${book.title}” đến thủ thư`, 'success', 'Chờ duyệt');
  }

  if (!book) return <EmptyState type="error" title="Không tải được chi tiết sách" message="Vui lòng thử lại sau ít phút." actionLabel="Quay lại tìm kiếm" onAction={() => navigate('/search')} />;

  return (
    <div className="book-detail page-fade">
      <div className="breadcrumb">Trang chủ <span>/</span> Tìm kiếm sách <span>/</span> {book.title}</div>
      <section className="detail-hero">
        <BookCover book={book} className="detail-cover" />
        <div className="detail-info">
          <h1>{book.title}</h1>
          <Link className="blue-text">{book.author}</Link>
          <div className="rating-line"><Star className="star" size={18} /> <b>{book.rating}</b> <span>({book.reviews} đánh giá)</span><span className="tag blue-soft">{book.category}</span></div>
          <dl className="meta-list">
            <dt>Nhà xuất bản:</dt><dd>{book.publisher}</dd>
            <dt>Năm xuất bản:</dt><dd>{book.publishedYear}</dd>
            <dt>Ngôn ngữ:</dt><dd>{book.language}</dd>
            <dt>ISBN:</dt><dd>{book.isbn}</dd>
            <dt>Số trang:</dt><dd>{book.pages} trang</dd>
            <dt>Kích thước:</dt><dd>{book.size}</dd>
          </dl>
          <Link to="#copies" className="blue-link">Xem chi tiết →</Link>
        </div>
        <aside className="borrow-card">
          <span>Trạng thái sách <b className="pill green-soft">{availableCopies.length ? 'Có thể mượn' : 'Hết sách'}</b></span>
          <div className="available-count"><b>{availableCopies.length}</b> / {copies.length || book.totalCopies} <small>còn bản</small></div>
          <p><MapPin size={16} /> Vị trí: <b>{book.location}</b></p>
          <button className="btn btn-primary btn-full" onClick={() => openBorrow()}><BookOpen size={18} /> Gửi yêu cầu mượn</button>
          <button className="btn btn-outline btn-full" onClick={toggleFavorite}><Heart size={18} /> {favorites.includes(book.id) ? 'Bỏ yêu thích' : 'Yêu thích'}</button>
          {book.isEbook && <Link to={`/reader/${book.id}`} className="btn btn-outline btn-full"><Bookmark size={18} /> Đọc eBook</Link>}
        </aside>
      </section>

      <div className="tabbar"><a>Giới thiệu</a><a>Chi tiết</a><a className="active">Danh sách bản sao ({copies.length})</a><a>Đánh giá ({book.reviews})</a><a>Sách cùng chủ đề</a></div>
      <div className="detail-layout">
        <main>
          <section className="panel intro-panel"><h2>Giới thiệu sách</h2><p>{book.description}</p><b>Bạn sẽ học được:</b><ul><li>Cách tạo ấn tượng tốt và gây thiện cảm.</li><li>Cách thuyết phục người khác mà không gây phản cảm.</li><li>Cách xây dựng mối quan hệ tốt đẹp trong học tập và công việc.</li></ul></section>
          <section className="panel copies-panel" id="copies">
            <div className="section-head"><div><h2>Danh sách bản sao ({copies.length})</h2><p>Danh sách cập nhật theo thời gian thực</p></div><label className="toggle">Chỉ hiển thị bản có thể mượn <input type="checkbox" defaultChecked /></label></div>
            <div className="chips"><span>Tất cả ({copies.length})</span><span className="green-soft">Có thể mượn ({availableCopies.length})</span><span className="orange-soft">Đang mượn ({copies.filter(c => c.status === 'Borrowed').length})</span><span>Không khả dụng ({copies.filter(c => c.status === 'Unavailable').length})</span></div>
            <table className="data-table">
              <thead><tr><th>Mã bản sao</th><th>Vị trí</th><th>Tình trạng</th><th>Trạng thái</th><th>Ngày trả dự kiến</th><th>Thao tác</th></tr></thead>
              <tbody>{copies.map(copy => <tr key={copy.copyId || copy.id}><td>{copy.barcode}</td><td>{copy.location}</td><td><span className={`pill ${copy.condition === 'Tốt' ? 'green-soft' : copy.condition?.includes('Hỏng') ? 'red-soft' : 'orange-soft'}`}>{copy.condition}</span></td><td><span className={`pill ${copy.status === 'Available' ? 'green-soft' : copy.status === 'Borrowed' ? 'orange-soft' : copy.status === 'PendingApproval' ? 'blue-soft' : 'gray-soft'}`}>{copy.status === 'Available' ? 'Có thể mượn' : copy.status === 'Borrowed' ? 'Đang mượn' : copy.status === 'PendingApproval' ? 'Chờ duyệt' : 'Không khả dụng'}</span></td><td>{copy.dueDate || '-'}</td><td>{copy.status === 'Available' ? <button className="btn btn-primary sm" onClick={() => openBorrow(copy)}>Gửi yêu cầu</button> : <button className="btn btn-soft sm">Xem chi tiết</button>}</td></tr>)}</tbody>
            </table>
          </section>
        </main>
        <aside className="right-col static-side"><section className="panel"><h2>Thông tin thư viện</h2><p><b>Thể loại:</b> <span className="blue-text">{book.category}</span></p><p><b>Chủ đề:</b> {book.tags?.join(', ')}</p><p><b>Tình trạng sách:</b> Tốt</p><p><b>Lượt xem:</b> {book.views}</p></section><section className="panel"><h2>Vị trí trong thư viện</h2><div className="map-box">📍</div><b>{book.location}</b><br/><a className="blue-link">Xem bản đồ →</a></section></aside>
      </div>
      <section className="panel"><div className="section-head"><h2>Sách cùng chủ đề</h2><Link to="/featured">Xem tất cả →</Link></div><div className="book-grid compact-grid">{related.map(b => <Link to={`/books/${b.id}`} className="small-related" key={b.id}><BookCover book={b} /><b>{b.title}</b><span>{b.author}</span></Link>)}</div></section>
      <BorrowConfirmModal open={confirmOpen} book={book} copy={selectedCopy} onClose={() => setConfirmOpen(false)} onConfirm={confirmBorrow} loading={loading} />
      <BorrowSuccessModal open={success.open} book={book} loan={success.loan} onClose={() => setSuccess({ open: false, loan: null })} onGoLoans={() => navigate('/borrowed')} />
    </div>
  );
}
