import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { BookOpen, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const borrowedBooks = [
  { 
    id: 1, 
    title: 'The Pragmatic Programmer', 
    author: 'Andrew Hunt', 
    borrowDate: '01/06/2026', 
    dueDate: '15/06/2026', 
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
    daysLeft: 3 
  },
  { 
    id: 2, 
    title: 'Clean Architecture', 
    author: 'Robert C. Martin', 
    borrowDate: '05/06/2026', 
    dueDate: '19/06/2026', 
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200',
    daysLeft: 7 
  }
];

const borrowHistory = [
  { id: 'H1', title: 'JavaScript The Good Parts', borrowDate: '01/05/2026', returnDate: '10/05/2026', status: 'Đã trả' },
  { id: 'H2', title: 'You Don\'t Know JS', borrowDate: '15/04/2026', returnDate: '25/04/2026', status: 'Đã trả' },
  { id: 'H3', title: 'Design Patterns', borrowDate: '01/04/2026', returnDate: '16/04/2026', status: 'Trả muộn (Phạt 10k)' },
];

export function ReaderDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Xin chào, Nguyễn Văn Độc Giả</h2>
        <p className="text-gray-500">Xem thông tin thẻ và quản lý sách đang mượn của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#1976D2] to-[#1565C0] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-blue-100 text-sm">Thẻ Thư Viện</p>
                <h3 className="text-xl font-bold mt-1">Nguyễn Văn Độc Giả</h3>
              </div>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Mã thẻ:</span>
                <span className="font-mono">LIB-2026-8942</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Hạng thẻ:</span>
                <span className="font-semibold text-yellow-300">Vàng</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Ngày hết hạn:</span>
                <span>31/12/2026</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-center h-full items-center text-center">
            <div className="p-4 bg-[#E3F2FD] rounded-full text-[#1976D2] mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-500">Đang mượn</p>
            <h3 className="text-3xl font-bold text-gray-900">2 <span className="text-lg font-normal text-gray-500">/ 5 cuốn</span></h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-center h-full items-center text-center">
            <div className="p-4 bg-red-100 rounded-full text-red-600 mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-500">Nợ phạt</p>
            <h3 className="text-3xl font-bold text-red-600">0đ</h3>
            <Button variant="outline" size="sm" className="mt-4">Xem chi tiết</Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-[#1976D2]" />
          Sách đang mượn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {borrowedBooks.map(book => (
            <Card key={book.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 overflow-hidden relative">
                <ImageWithFallback 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={book.daysLeft <= 3 ? 'warning' : 'success'}>
                    Còn {book.daysLeft} ngày
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{book.author}</p>
                <div className="flex justify-between text-xs text-gray-600 mb-4">
                  <span>Mượn: {book.borrowDate}</span>
                  <span className="font-semibold text-[#1976D2]">Hạn: {book.dueDate}</span>
                </div>
                <Button className="w-full" variant="secondary">Gia hạn</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử mượn trả</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sách</TableHead>
                <TableHead>Ngày mượn</TableHead>
                <TableHead>Ngày trả</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowHistory.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.borrowDate}</TableCell>
                  <TableCell>{item.returnDate}</TableCell>
                  <TableCell>
                    <Badge variant={item.status.includes('muộn') ? 'danger' : 'success'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
