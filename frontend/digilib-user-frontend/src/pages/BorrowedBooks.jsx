import { Link } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import { Filter, RotateCcw, Clock3 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ReturnConfirmModal from '../components/ReturnModal';
import BookCover from '../components/BookCover';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { getBooks, getCurrentBorrowings, returnCopy, renewLoanReal, returnLoanReal } from '../services/catalogApi';
import { getHistory, getLoans, setHistory, setLoans } from '../utils/libraryStore';
import { daysLeft, formatDate, todayISO } from '../utils/storage';
import { BookOpen, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

function isBorrowed(status) {
  return status === 'Borrowed';
}

function isPending(status) {
  return status === 'PendingApproval' || status === 'Pending';
}

function statusView(loan) {
  if (isPending(loan.status)) return { text: 'Chờ thủ thư duyệt', cls: 'blue-soft' };
  if (loan.status === 'Rejected') return { text: 'Bị từ chối', cls: 'red-soft' };
  const left = daysLeft(loan.dueDate);
  if (left < 0) return { text: `Quá ${Math.abs(left)} ngày`, cls: 'red-soft' };
  if (left <= 7) return { text: `Còn ${left} ngày`, cls: 'orange-soft' };
  return { text: 'Đang mượn', cls: 'green-soft' };
}

export default function BorrowedBooks() {
  const [books, setBooks] = useState([]);
  const [loans, setLocalLoans] = useState(getLoans());
  const [modal, setModal] = useState({ open: false, loan: null, book: null });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const all = await getBooks();
      setBooks(all);
      try {
        const current = await getCurrentBorrowings();
        setLocalLoans(current);
        setLoans(current);
      } catch (error) {
        console.warn('Không tải được sách đang mượn từ backend:', error.message);
      }
    }
    load();
  }, []);

  const rows = useMemo(() => loans.map(loan => ({ loan, book: loan.book || books.find(b => String(b.id) === String(loan.bookId)) })).filter(x => x.book), [loans, books]);
  const borrowedRows = rows.filter(r => isBorrowed(r.loan.status));
  const pendingRows = rows.filter(r => isPending(r.loan.status));

  async function renew(loan) {
    if (!isBorrowed(loan.status)) return toast.show('Yêu cầu này chưa được thủ thư duyệt nên chưa thể gia hạn.', 'warning');
    if (loan.renewed) return toast.show('Sách này đã được gia hạn trước đó.', 'warning');
    try {
      const apiLoan = await renewLoanReal(loan.loanId);
      const updated = loans.map(x => String(x.loanId) === String(loan.loanId) ? { ...x, ...apiLoan } : x);
      setLocalLoans(updated); setLoans(updated);
    } catch {
      const nextDue = new Date(loan.dueDate); nextDue.setDate(nextDue.getDate() + 7);
      const updated = loans.map(x => String(x.loanId) === String(loan.loanId) ? { ...x, dueDate: nextDue.toISOString().slice(0, 10), renewed: true } : x);
      setLocalLoans(updated); setLoans(updated);
    }
    toast.show('Gia hạn sách thành công thêm 7 ngày.', 'success', 'Gia hạn thành công');
  }

  async function confirmReturn(loan) {
    if (!isBorrowed(loan.status)) return toast.show('Yêu cầu này chưa được duyệt nên không thể trả sách.', 'warning');
    setLoading(true);
    try { await returnLoanReal(loan.loanId); } catch { await returnCopy(loan.bookId, loan.copyId, loan.loanId); }
    const updatedLoans = loans.filter(x => String(x.loanId) !== String(loan.loanId));
    const returned = { ...loan, returnedAt: todayISO(), status: 'Returned', id: `H${Date.now()}` };
    setLoans(updatedLoans); setLocalLoans(updatedLoans); setHistory([returned, ...getHistory()]);
    setLoading(false); setModal({ open: false, loan: null, book: null });
    toast.show('Cảm ơn bạn! Sách đã được trả thành công.', 'success', 'Trả sách thành công');
  }

  return (
    <div className="page-fade two-col-page">
      <main>
        <PageHeader title="Sách đang mượn" description="Theo dõi sách đang mượn, yêu cầu chờ duyệt, hạn trả và trạng thái gia hạn." />
        <div className="search-panel slim"><label><input placeholder="Tìm theo tên sách..." /></label><label><select><option>Trạng thái</option><option>Chờ duyệt</option><option>Đang mượn</option><option>Sắp đến hạn</option></select></label><label><select><option>Sắp xếp theo</option></select></label><button className="btn btn-primary"><Filter size={18}/>Lọc</button><button className="btn btn-outline"><RotateCcw size={18}/>Đặt lại</button></div>
        <div className="stat-grid three"><StatCard icon={<Clock3/>} value={pendingRows.length} label="Chờ duyệt"/><StatCard icon={<BookOpen/>} value={borrowedRows.length} label="Đang mượn"/><StatCard icon={<CalendarDays/>} value={borrowedRows.filter(r => daysLeft(r.loan.dueDate) <= 7).length} label="Sắp đến hạn"/></div>
        <section className="panel">
          {rows.length ? <table className="data-table loan-table"><thead><tr><th>Sách</th><th>Thông tin bản sao</th><th>Hạn trả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(({ book, loan }) => { const status = statusView(loan); return <tr key={loan.loanId}><td><Link to={`/books/${book.id}`} className="table-book clickable"><BookCover book={book} className="mini-cover"/><div><b>{book.title}</b><span>{book.author}</span></div></Link></td><td>Mã bản sao: <b>{loan.barcode || '-'}</b><br/>{isPending(loan.status) ? 'Ngày gửi yêu cầu' : 'Ngày mượn'}: {formatDate(loan.borrowedAt)} · {loan.location || book.location}</td><td>{isPending(loan.status) ? 'Dự kiến sau khi duyệt' : 'Hạn trả'}<br/><b>{formatDate(loan.dueDate)}</b></td><td><span className={`pill ${status.cls}`}>{status.text}</span></td><td className="action-cell"><Link to={`/books/${book.id}`} className="btn btn-soft sm">Xem chi tiết</Link>{isBorrowed(loan.status) ? <><button className="btn btn-outline sm" onClick={() => setModal({ open: true, loan, book })}>Trả sách</button><button className="btn btn-outline sm" onClick={() => renew(loan)} disabled={loan.renewed}>Gia hạn</button></> : <span className="pill blue-soft">Đang chờ duyệt</span>}</td></tr>})}</tbody></table> : <EmptyState type="books" title="Bạn chưa có sách hoặc yêu cầu mượn nào" message="Khám phá thư viện và gửi yêu cầu mượn những cuốn sách yêu thích nhé!" actionLabel="Tìm sách để mượn" />}
        </section>
      </main>
      <aside className="right-col static-side"><section className="panel"><h2>Nhắc hạn trả</h2>{borrowedRows.slice(0, 3).map(({ book, loan }) => <div className="side-book" key={loan.loanId}><BookCover book={book} className="mini-cover"/><div><b>{book.title}</b><span>Hạn trả: {formatDate(loan.dueDate)}</span></div><small className="orange-text">Còn {daysLeft(loan.dueDate)} ngày</small></div>)}{!borrowedRows.length && <p className="muted">Chưa có sách đã được duyệt mượn.</p>}</section><section className="panel"><h2>Lưu ý</h2><ul><li>Gửi yêu cầu mượn xong phải chờ thủ thư duyệt.</li><li>Chỉ được trả / gia hạn khi yêu cầu đã được duyệt.</li><li>Quá hạn sẽ phát sinh phí theo quy định.</li></ul></section></aside>
      <ReturnConfirmModal open={modal.open} book={modal.book} loan={modal.loan} onClose={() => setModal({ open: false, loan: null, book: null })} onConfirm={confirmReturn} loading={loading} />
    </div>
  );
}
