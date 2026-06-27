import React, { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { getBooks, getFavoriteBooks, removeFavoriteBook } from '../services/catalogApi';
import { getFavorites, setFavorites } from '../utils/libraryStore';
import { useToast } from '../components/ToastProvider';

export default function Favorites() {
  const [books, setBooks] = useState([]);
  const [favorites, setFavs] = useState(getFavorites());
  const toast = useToast();

  useEffect(() => {
    async function load() {
      const [all, realFavorites] = await Promise.all([
        getBooks(),
        getFavoriteBooks().catch(() => [])
      ]);
      setBooks(all);
      const ids = realFavorites.map(b => b.id);
      setFavs(ids);
      setFavorites(ids);
    }
    load();
  }, []);

  const favoriteBooks = books.filter(b => favorites.some(id => String(id) === String(b.id)));

  async function toggle(book) {
    const next = favorites.filter(id => String(id) !== String(book.id));
    setFavs(next);
    setFavorites(next);
    try { await removeFavoriteBook(book.id); } catch {}
    toast.show(`Đã xóa “${book.title}” khỏi danh sách yêu thích`, 'success');
  }

  return <div className="page-fade"><PageHeader title="Sách yêu thích" description="Những cuốn sách bạn đã thêm vào danh sách yêu thích." />{favoriteBooks.length ? <div className="book-grid list-page-grid">{favoriteBooks.map(book => <BookCard key={book.id} book={book} favorite onToggleFavorite={toggle}/>)}</div> : <EmptyState type="favorite" title="Bạn chưa có sách yêu thích nào" message="Nhấn vào biểu tượng trái tim trên trang chi tiết sách để thêm vào yêu thích." actionLabel="Khám phá sách" />}</div>;
}
