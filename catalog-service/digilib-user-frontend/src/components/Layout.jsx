import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ChevronDown, Heart, Search } from 'lucide-react';

import QRCodeBox from './QRCode';
import { Icons } from './Icons';
import { useProfile } from '../context/ProfileContext';

const navGroups = [
  {
    items: [
      { to: '/', label: 'Tổng quan', icon: Icons.Home },
      { to: '/search', label: 'Tìm kiếm sách', icon: Icons.Search },
      { to: '/new', label: 'Sách mới', icon: Icons.BookMarked },
      { to: '/featured', label: 'Sách nổi bật', icon: Icons.Star },
      { to: '/categories', label: 'Thể loại', icon: Icons.Grid2X2 }
    ]
  },
  {
    items: [
      { to: '/borrowed', label: 'Sách đang mượn', icon: Icons.BookOpen },
      { to: '/history', label: 'Lịch sử mượn', icon: Icons.History },
      { to: '/favorites', label: 'Sách yêu thích', icon: Icons.Heart },
      { to: '/reader/1', label: 'Đọc sách (eBook)', icon: Icons.BookOpen },
      { to: '/resources', label: 'Tài liệu số', icon: Icons.FileText },
      { to: '/notifications', label: 'Thông báo', icon: Icons.Bell },
      { to: '/profile', label: 'Hồ sơ cá nhân', icon: Icons.User }
    ]
  }
];

export default function Layout() {
  const navigate = useNavigate();
  const { profile: user } = useProfile();

  function submitSearch(e) {
    e.preventDefault();
    const keyword = e.currentTarget.keyword.value.trim();
    navigate(`/search${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand"><BookOpen size={32} /><span>DIGILIB</span></NavLink>
        <nav>
          {navGroups.map((group, idx) => (
            <div className="nav-group" key={idx}>
              {group.items.map(item => {
                const Icon = item.icon;
                return <NavLink to={item.to} key={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{item.label}</span></NavLink>;
              })}
            </div>
          ))}
        </nav>
        <QRCodeBox label={user.readerCode} />
      </aside>
      <main className="main-area">
        <header className="topbar">
          <form className="top-search" onSubmit={submitSearch}>
            <input name="keyword" placeholder="Tìm kiếm sách theo tên, tác giả, ISBN..." />
            <button aria-label="Tìm kiếm"><Search size={20} /></button>
          </form>
          <div className="top-actions">
            <NavLink to="/favorites" className="top-link"><Heart size={20} />Yêu thích</NavLink>
            <NavLink to="/notifications" className="icon-btn badge-btn"><Bell size={21} /><span>3</span></NavLink>
            <NavLink to="/profile" className="profile-mini">
              <img src={user.avatar} alt={user.name} />
              <div><b>{user.name}</b><small>{user.role}</small></div>
              <ChevronDown size={16} />
            </NavLink>
          </div>
        </header>
        <div className="content"><Outlet /></div>
      </main>
    </div>
  );
}
