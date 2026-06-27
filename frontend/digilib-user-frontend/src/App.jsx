import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SearchBooks from './pages/SearchBooks';
import BookListPage from './pages/BookListPage';
import Categories from './pages/Categories';
import BorrowedBooks from './pages/BorrowedBooks';
import BorrowHistory from './pages/BorrowHistory';
import Favorites from './pages/Favorites';
import EbookReader from './pages/EbookReader';
import DigitalResources from './pages/DigitalResources';
import DigitalResourceDetail from './pages/DigitalResourceDetail';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import BookDetail from './pages/BookDetail';
import StatusExamples from './pages/StatusExamples';
import NotFound from './pages/NotFound';

function loginUrl() {
  const url = new URL(window.location.href);
  url.port = '5173';
  url.pathname = '/login';
  url.search = '';
  url.hash = '';
  return url.toString();
}

function acceptSessionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('session');
  if (!encoded) return Boolean(localStorage.getItem('digilib_token') || localStorage.getItem('reader_token'));

  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (!payload?.token) return false;
    localStorage.setItem('reader_token', payload.token);
    localStorage.setItem('digilib_token', payload.token);
    if (payload.user) localStorage.setItem('digilib_user', JSON.stringify(payload.user));
    window.history.replaceState({}, document.title, window.location.pathname || '/');
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!acceptSessionFromUrl()) {
      window.location.href = loginUrl();
      return;
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchBooks />} />
        <Route path="/new" element={<BookListPage mode="new" />} />
        <Route path="/featured" element={<BookListPage mode="featured" />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/borrowed" element={<BorrowedBooks />} />
        <Route path="/history" element={<BorrowHistory />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/reader/:id" element={<EbookReader />} />
        <Route path="/resources" element={<DigitalResources />} />
        <Route path="/resources/:id" element={<DigitalResourceDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/states" element={<StatusExamples />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
