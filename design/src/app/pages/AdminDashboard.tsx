import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Book, Users, AlertTriangle, BookCopy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../components/ui/Badge';

const weeklyData = [
  { name: 'Thứ 2', borrows: 45 },
  { name: 'Thứ 3', borrows: 52 },
  { name: 'Thứ 4', borrows: 38 },
  { name: 'Thứ 5', borrows: 65 },
  { name: 'Thứ 6', borrows: 48 },
  { name: 'Thứ 7', borrows: 85 },
  { name: 'CN', borrows: 70 },
];

const topBooks = [
  { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', borrows: 156 },
  { id: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho', borrows: 142 },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', borrows: 98 },
  { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', borrows: 85 },
];

const lowStockAlerts = [
  { id: 1, title: 'Design Patterns', remaining: 1, total: 10 },
  { id: 2, title: 'JavaScript The Good Parts', remaining: 0, total: 5 },
  { id: 3, title: 'You Don\'t Know JS', remaining: 2, total: 8 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Quản trị</h2>
        <p className="text-gray-500">Tổng quan tình hình hoạt động của thư viện</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-[#E3F2FD] rounded-full text-[#1976D2]">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng đầu sách</p>
              <h3 className="text-2xl font-bold text-gray-900">12,450</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <BookCopy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng bản sao</p>
              <h3 className="text-2xl font-bold text-gray-900">45,820</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Độc giả đang mượn</p>
              <h3 className="text-2xl font-bold text-gray-900">845</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phiếu quá hạn</p>
              <h3 className="text-2xl font-bold text-red-600">32</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lượt mượn sách trong tuần</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="borrows" fill="#1976D2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Sách Mượn Nhiều</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {topBooks.map((book, index) => (
                  <li key={book.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-400 w-4">{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{book.title}</p>
                        <p className="text-xs text-gray-500">{book.author}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[#1976D2]">{book.borrows} lượt</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cảnh báo sắp hết sách</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {lowStockAlerts.map((alert) => (
                  <li key={alert.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-xs text-gray-500">Còn lại: {alert.remaining}/{alert.total}</p>
                    </div>
                    <Badge variant={alert.remaining === 0 ? 'danger' : 'warning'}>
                      {alert.remaining === 0 ? 'Hết sách' : 'Sắp hết'}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
