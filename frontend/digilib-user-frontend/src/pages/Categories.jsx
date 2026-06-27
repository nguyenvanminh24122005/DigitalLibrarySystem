import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { CategoryIcon } from '../components/Icons';
import BookCover from '../components/BookCover';
import { categories } from '../data/mockData';
import { getBooks } from '../services/catalogApi';

export default function Categories() {
  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState('');
  useEffect(() => { getBooks().then(setBooks); }, []);
  const list = categories.filter(c => c.name.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div className="page-fade two-col-page">
      <main>
        <PageHeader title="Thể loại" description="Khám phá sách theo từng nhóm chủ đề phù hợp với bạn" />
        <div className="search-panel slim">
          <label><input placeholder="Tìm thể loại..." value={keyword} onChange={e => setKeyword(e.target.value)} /></label>
          <label><select><option>Ngôn ngữ</option><option>Tiếng Việt</option><option>Tiếng Anh</option></select></label>
          <label><select><option>Sắp xếp theo</option><option>Nhiều sách nhất</option><option>Cập nhật gần đây</option></select></label>
          <button className="btn btn-primary"><Filter size={18} /> Lọc</button>
          <button className="btn btn-outline" onClick={() => setKeyword('')}><RotateCcw size={18} /> Đặt lại</button>
        </div>
        <div className="stat-grid three"><div className="quick-stat"><span>Tổng thể loại</span><b>24</b></div><div className="quick-stat"><span>Được quan tâm</span><b>8</b></div><div className="quick-stat"><span>Cập nhật gần đây</span><b>5</b></div></div>
        <div className="category-grid">
          {list.map(cat => {
            const sample = books.filter(b => b.category === cat.name).slice(0, 3);
            return <Link className="category-card" key={cat.name} to={`/search?category=${encodeURIComponent(cat.name)}`}>
              <div className="cat-head"><span><CategoryIcon type={cat.icon} /></span><div><h3>{cat.name}</h3><p>{cat.hint}</p><b>{cat.count} đầu sách</b></div></div>
              <div className="cover-stack">{sample.map(book => <BookCover key={book.id} book={book} className="tiny-cover" />)}</div>
              <em>Xem chi tiết →</em>
            </Link>;
          })}
        </div>
      </main>
      <aside className="right-col static-side">
        <section className="panel"><h2>Thể loại phổ biến</h2>{categories.slice(0, 4).map(c => <Link className="category-line" to={`/search?category=${c.name}`} key={c.name}><span>{c.name}</span><b>{c.count} đầu sách ›</b></Link>)}</section>
        <section className="panel"><h2>Gợi ý cho bạn</h2><p>Nếu bạn thích “Công nghệ” → thử xem “Khoa học”.</p><p>Nếu bạn thích “Văn học” → thử xem “Lịch sử”.</p><p>Nếu bạn thích “Kỹ năng sống” → thử xem “Tâm lý học”.</p></section>
      </aside>
    </div>
  );
}
