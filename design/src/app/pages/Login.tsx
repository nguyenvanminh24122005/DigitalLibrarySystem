import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, Role } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { BookOpen } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Login() {
  const [role, setRole] = useState<Role>('ADMIN');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    if (role === 'ADMIN') navigate('/admin');
    if (role === 'LIBRARIAN') navigate('/librarian');
    if (role === 'READER') navigate('/reader');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-[#1976D2]" />
            <h2 className="text-3xl font-extrabold text-gray-900">DigiLib</h2>
          </div>
          <h3 className="mt-6 text-2xl font-bold text-gray-900">Đăng nhập hệ thống</h3>
          <p className="mt-2 text-sm text-gray-600">
            Chọn vai trò để tiếp tục (Bản Demo Frontend)
          </p>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    className="block w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1976D2] focus:outline-none focus:ring-1 focus:ring-[#1976D2]"
                    value={role || ''}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                    <option value="LIBRARIAN">Thủ thư (Librarian)</option>
                    <option value="READER">Độc giả (Reader)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email / Tài khoản</Label>
                <div className="mt-1">
                  <Input id="email" type="text" placeholder="admin@digilib.com" required />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="mt-1">
                  <Input id="password" type="password" placeholder="••••••••" required />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-[#1976D2] focus:ring-[#1976D2]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-[#1976D2] hover:text-[#1565C0]">
                    Quên mật khẩu?
                  </a>
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full h-12 text-lg">
                  Đăng nhập
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1 bg-[#1976D2]">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply"
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Thư viện"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1976D2] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-12 left-12 text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Khám phá tri thức vô tận</h1>
          <p className="text-lg text-blue-100">
            Hệ thống quản lý thư viện số hiện đại, giúp bạn dễ dàng tìm kiếm, mượn trả và theo dõi kho tàng kiến thức.
          </p>
        </div>
      </div>
    </div>
  );
}
