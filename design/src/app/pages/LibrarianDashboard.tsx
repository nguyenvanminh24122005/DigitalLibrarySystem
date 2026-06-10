import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Search, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const overdueList = [
  { id: 'PM001', reader: 'Nguyễn Văn A', book: 'Clean Code', dueDate: '10/06/2026', days: 2 },
  { id: 'PM002', reader: 'Trần Thị B', book: 'Nhà Giả Kim', dueDate: '08/06/2026', days: 4 },
  { id: 'PM003', reader: 'Lê Văn C', book: 'Sapiens', dueDate: '05/06/2026', days: 7 },
];

const recentTransactions = [
  { id: 'TRX01', type: 'BORROW', reader: 'Phạm D', book: 'Đắc Nhân Tâm', time: '10 phút trước' },
  { id: 'TRX02', type: 'RETURN', reader: 'Hoàng E', book: 'React Up & Running', time: '35 phút trước' },
  { id: 'TRX03', type: 'BORROW', reader: 'Vũ F', book: 'Design Patterns', time: '1 giờ trước' },
  { id: 'TRX04', type: 'RETURN', reader: 'Nguyễn G', book: 'JavaScript: The Good Parts', time: '2 giờ trước' },
];

export function LibrarianDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Thủ thư</h2>
        <p className="text-gray-500">Quản lý giao dịch và hỗ trợ độc giả</p>
      </div>

      <Card className="bg-[#1976D2] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <CardContent className="p-8 relative z-10">
          <h3 className="text-xl font-semibold mb-4">Tra cứu nhanh</h3>
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Nhập ISBN, tên sách, hoặc mã độc giả..." 
                className="pl-10 h-12 text-gray-900 border-none shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="bg-white text-[#1976D2] hover:bg-gray-100">
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-red-600 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Phiếu Mượn Quá Hạn
            </CardTitle>
            <Badge variant="danger">{overdueList.length}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã phiếu</TableHead>
                  <TableHead>Độc giả</TableHead>
                  <TableHead>Sách</TableHead>
                  <TableHead>Quá hạn</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-[#1976D2]">{item.id}</TableCell>
                    <TableCell>{item.reader}</TableCell>
                    <TableCell>{item.book}</TableCell>
                    <TableCell>
                      <span className="text-red-600 font-semibold">{item.days} ngày</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <Button variant="ghost" className="w-full text-[#1976D2]">Xem tất cả phiếu quá hạn</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giao Dịch Gần Đây</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentTransactions.map((trx) => (
                <li key={trx.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${trx.type === 'BORROW' ? 'bg-blue-100 text-[#1976D2]' : 'bg-green-100 text-green-600'}`}>
                      {trx.type === 'BORROW' ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {trx.reader} <span className="font-normal text-gray-500">{trx.type === 'BORROW' ? 'mượn' : 'trả'} sách</span>
                      </p>
                      <p className="text-sm font-semibold text-gray-700">{trx.book}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{trx.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
