import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BookCover from '../components/BookCover';
import StatCard from '../components/StatCard';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { getBooks, getBorrowingHistory } from '../services/catalogApi';
import { getHistory, setHistory } from '../utils/libraryStore';
import { formatDate } from '../utils/storage';


function statusLabel(status) {
  if (status === 'PendingApproval' || status === 'Pending') return { text: 'Chờ duyệt', cls: 'blue-soft' };
  if (status === 'Rejected') return { text: 'Bị từ chối', cls: 'red-soft' };
  if (status === 'Borrowed') return { text: 'Đang mượn', cls: 'orange-soft' };
  if (status === 'Overdue' || status === 'OverdueReturned') return { text: 'Trả trễ', cls: 'red-soft' };
  if (status === 'Renewed') return { text: 'Đã gia hạn', cls: 'blue-soft' };
  return { text: 'Đã trả', cls: 'green-soft' };
}

export default function BorrowHistory() {
  const [books, setBooks] = useState([]);
  const [history, setLocalHistory] = useState(getHistory());

  useEffect(() => {
    async function load() {
      const all = await getBooks();
      setBooks(all);
      try {
        const real = await getBorrowingHistory();
        setLocalHistory(real);
        setHistory(real);
      } catch (error) {
        console.warn('Không tải được lịch sử mượn từ backend:', error.message);
      }
    }
    load();
  }, []);

  const rows = history.map(item => ({ item, book: item.book || books.find(b => String(b.id) === String(item.bookId)) })).filter(x => x.book);
  const returnedCount = rows.filter(r => ['Returned', 'OverdueReturned'].includes(r.item.status)).length;
  const overdueCount = rows.filter(r => ['Overdue', 'OverdueReturned'].includes(r.item.status)).length;
  const pendingCount = rows.filter(r => ['PendingApproval', 'Pending'].includes(r.item.status)).length;

  return <div className="page-fade two-col-page"><main><PageHeader title="Lịch sử mượn" description="Xem lại lịch sử mượn sách, ngày trả và trạng thái mượn của bạn."/><div className="search-panel slim"><label><input placeholder="Tìm theo tên sách..."/></label><label><select><option>Trạng thái</option><option>Đã trả</option><option>Trả trễ</option><option>Đã gia hạn</option></select></label><label><select><option>Thời gian</option><option>Tháng này</option><option>3 tháng qua</option></select></label><button className="btn btn-primary"><Filter size={18}/>Lọc</button><button className="btn btn-outline"><RotateCcw size={18}/>Đặt lại</button></div><div className="stat-grid three"><StatCard icon={<BookOpen/>} value={rows.length} label="Đã mượn"/><StatCard icon={<CheckCircle2/>} value={returnedCount} label="Đã trả"/><StatCard icon={<Clock/>} value={overdueCount} label="Quá hạn"/></div><section className="panel"><table className="data-table"><thead><tr><th>Sách</th><th>Thông tin bản sao</th><th>Ngày mượn</th><th>Ngày trả / Hạn trả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(({ book, item }) => <tr key={item.id || item.loanId}><td><Link to={`/books/${book.id}`} className="table-book clickable"><BookCover book={book} className="mini-cover"/><div><b>{book.title}</b><span>{book.author}</span></div></Link></td><td>Mã bản sao: <b>{item.barcode}</b><br/>Vị trí: {item.location || book.location}</td><td>{formatDate(item.borrowedAt)}</td><td>{formatDate(item.returnedAt || item.dueDate)}{['Overdue', 'OverdueReturned'].includes(item.status) && <div className="red">(Trễ hạn)</div>}</td><td>{(() => { const s = statusLabel(item.status); return <span className={`pill ${s.cls}`}>{s.text}</span>; })()}</td><td><Link to={`/books/${book.id}`} className="btn btn-soft sm">Xem chi tiết</Link></td></tr>)}</tbody></table><div className="pagination"><button>‹</button><b>1</b><button>2</button><button>›</button></div></section></main><aside className="right-col static-side"><section className="panel"><h2>Tổng kết tháng này</h2><div className="metric-line"><b>{rows.length}</b><span>Sách đã mượn</span></div><div className="metric-line"><b>{returnedCount}</b><span>Sách đã trả</span></div><div className="metric-line"><b>{pendingCount}</b><span>Yêu cầu chờ duyệt</span></div><div className="metric-line"><b>{rows.filter(r => r.item.renewed).length}</b><span>Lần gia hạn</span></div></section><section className="panel"><h2>Ghi chú</h2><ul><li>Lịch sử mượn được lưu trong 24 tháng.</li><li>Bạn sẽ nhận thông báo khi sách đến hạn trả hoặc quá hạn.</li><li>Lịch sử gia hạn được ghi nhận đầy đủ.</li></ul></section></aside></div>;
}
