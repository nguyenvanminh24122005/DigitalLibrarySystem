import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth, Role } from '../context/AuthContext';
import { 
  BookOpen, LayoutDashboard, Users, Library, 
  RefreshCcw, BarChart3, Settings, LogOut, 
  UserCircle, FileText, Bookmark
} from 'lucide-react';
import { cn } from '../utils/cn';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const ROLES_MENU: Record<Exclude<Role, null>, SidebarItem[]> = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Library, label: 'Quản lý sách', href: '/catalog' },
    { icon: RefreshCcw, label: 'Mượn / Trả sách', href: '/borrow-return' },
    { icon: BarChart3, label: 'Báo cáo thống kê', href: '/reports' },
    { icon: Settings, label: 'Cấu hình hệ thống', href: '/config' },
  ],
  LIBRARIAN: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/librarian' },
    { icon: Library, label: 'Quản lý sách', href: '/catalog' },
    { icon: RefreshCcw, label: 'Mượn / Trả sách', href: '/borrow-return' },
  ],
  READER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/reader' },
    { icon: BookOpen, label: 'Sách đang mượn', href: '/reader/borrowed' },
    { icon: Bookmark, label: 'Lịch sử mượn', href: '/reader/history' },
    { icon: FileText, label: 'Thông tin thẻ', href: '/reader/profile' },
  ]
};

export function MainLayout() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  // If no role, navigate to login
  React.useEffect(() => {
    if (!role) {
      navigate('/');
    }
  }, [role, navigate]);

  if (!role) return null;

  const menuItems = ROLES_MENU[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <BookOpen className="w-8 h-8 text-[#1976D2] mr-3" />
          <span className="text-xl font-bold text-[#1976D2]">DigiLib</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive 
                  ? "bg-[#E3F2FD] text-[#1976D2]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 mr-3 transition-colors",
                    isActive ? "text-[#1976D2]" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center mb-4 px-2">
            <UserCircle className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {role === 'ADMIN' ? 'Quản trị viên' : role === 'LIBRARIAN' ? 'Thủ thư' : 'Nguyễn Văn Độc Giả'}
              </p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            Hệ thống Quản lý Thư viện Số
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-[#1976D2] transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
