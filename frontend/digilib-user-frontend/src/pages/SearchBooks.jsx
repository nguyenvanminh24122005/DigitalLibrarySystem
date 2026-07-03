import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RotateCcw, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BookRow from '../components/BookRow';
import EmptyState from '../components/EmptyState';
import { getBooks, searchBooks } from '../services/catalogApi';

export default function SearchBooks() {
  const [searchParams] = useSearchParams();
  const [allBooks, setAllBooks] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: searchParams.get('keyword') || '', category: '', status: '', sort: 'relevant', language: '', fromYear: '', toYear: '', condition: '', location: '' });

  useEffect(() => { getBooks().then(list => { setAllBooks(list); setBooks(list); }); }, []);
  useEffect(() => { setFilters(prev => ({ ...prev, keyword: searchParams.get('keyword') || prev.keyword })); }, [searchParams]);

  const categories = useMemo(() => [...new Set(allBooks.map(b => b.category).filter(Boolean))], [allBooks]);
  const languages = useMemo(() => [...new Set(allBooks.map(b => b.language).filter(Boolean))], [allBooks]);

  async function doSearch(e) {
    e?.preventDefault?.();
    setLoading(true);
    const result = await searchBooks({ keyword: filters.keyword, category: filters.category, available: filters.status === 'available' ? true : undefined });
    let next = result.filter(b => {
      const okStatus = !filters.status || (filters.status === 'available' ? b.availableCopies > 0 : b.availableCopies === 0);
      const okLang = !filters.language || b.language === filters.language;
      const okFrom = !filters.fromYear || Number(b.publishedYear) >= Number(filters.fromYear);
      const okTo = !filters.toYear || Number(b.publishedYear) <= Number(filters.toYear);
      return okStatus && okLang && okFrom && okTo;
    });
    if (filters.sort === 'rating') next = next.sort((a, b) => b.rating - a.rating);
    if (filters.sort === 'newest') next = next.sort((a, b) => Number(b.publishedYear || 0) - Number(a.publishedYear || 0));
    if (filters.sort === 'available') next = next.sort((a, b) => b.availableCopies - a.availableCopies);
    setBooks(next);
    setLoading(false);
  }

  function reset() {
    setFilters({ keyword: '', category: '', status: '', sort: 'relevant', language: '', fromYear: '', toYear: '', condition: '', location: '' });
    setBooks(allBooks);
  }

  return (
    <div className="page-fade">
      <PageHeader title="Tìm kiếm sách" description="Tìm và khám phá sách phù hợp với bạn" />
      <form className="search-panel" onSubmit={doSearch}>
        <label>Từ khóa<input value={filters.keyword} placeholder="Nhập tên sách, tác giả, ISBN..." onChange={e => setFilters({ ...filters, keyword: e.target.value })} /></label>
        <label>Thể loại<select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}><option value="">Tất cả thể loại</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Trạng thái<select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">Tất cả</option><option value="available">Có thể mượn</option><option value="unavailable">Hết sách</option></select></label>
        <label>Sắp xếp theo<select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}><option value="relevant">Liên quan</option><option value="rating">Đánh giá cao</option><option value="newest">Mới nhất</option><option value="available">Còn nhiều bản</option></select></label>
        <button className="btn btn-primary"><Search size={18} /> Tìm kiếm</button>
        <button type="button" className="btn btn-outline" onClick={reset}><RotateCcw size={18} /> Đặt lại</button>
      </form>

      <div className="content-grid with-filter">
        <aside className="filter-card">
          <div className="section-head"><h3>Bộ lọc nâng cao</h3><button onClick={reset}>Xóa lọc</button></div>
          <label>Năm xuất bản<div className="split"><input placeholder="Từ năm" value={filters.fromYear} onChange={e => setFilters({ ...filters, fromYear: e.target.value })} /><input placeholder="Đến năm" value={filters.toYear} onChange={e => setFilters({ ...filters, toYear: e.target.value })} /></div></label>
          <label>Ngôn ngữ<select value={filters.language} onChange={e => setFilters({ ...filters, language: e.target.value })}><option value="">Tất cả</option>{languages.map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Tình trạng sách<select value={filters.condition} onChange={e => setFilters({ ...filters, condition: e.target.value })}><option value="">Tất cả</option><option>Tốt</option><option>Cũ</option><option>Hỏng nhẹ</option></select></label>
          <label>Kho sách<select value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })}><option value="">Tất cả kho</option><option>Kho A</option><option>Kho B</option><option>Kho C</option></select></label>
          <button className="btn btn-primary btn-full" onClick={doSearch}><Filter size={17} /> Áp dụng</button>
        </aside>
        <section className="panel results-panel">
          <div className="section-head"><h2>Tìm thấy {books.length} kết quả</h2><span>Hiển thị 12</span></div>
          {loading ? <div className="skeleton-list"><i /><i /><i /></div> : books.length ? books.map(book => <BookRow key={book.id} book={book} />) : <EmptyState type="search" title="Không tìm thấy kết quả phù hợp" message="Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả." actionLabel="Thử từ khóa khác" onAction={reset} />}
          {books.length > 0 && <div className="pagination"><button>‹</button><b>1</b><button>2</button><button>3</button><span>...</span><button>11</button><button>›</button></div>}
        </section>
      </div>
    </div>
  );
}
