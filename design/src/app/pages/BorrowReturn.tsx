import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Search, UserPlus, BookPlus, Trash2, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export function BorrowReturn() {
  const [activeTab, setActiveTab] = useState<'BORROW' | 'RETURN'>('BORROW');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Mượn / Trả sách</h2>
        <p className="text-gray-500">Tạo phiếu mượn và xử lý trả sách cho độc giả</p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${
            activeTab === 'BORROW' 
              ? 'border-[#1976D2] text-[#1976D2]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('BORROW')}
        >
          <BookPlus className="w-4 h-4 mr-2" />
          Tạo phiếu mượn
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm flex items-center border-b-2 transition-colors ${
            activeTab === 'RETURN' 
              ? 'border-[#1976D2] text-[#1976D2]' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('RETURN')}
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Xử lý trả sách
        </button>
      </div>

      {activeTab === 'BORROW' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chi tiết phiếu mượn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reader Selection */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <Label className="text-base font-semibold mb-2 block">1. Thông tin độc giả</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Nhập mã thẻ hoặc số điện thoại..." className="pl-9" />
                  </div>
                  <Button variant="secondary">Tìm kiếm</Button>
                </div>
                {/* Mock Selected Reader */}
                <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#E3F2FD] text-[#1976D2] rounded-full flex items-center justify-center font-bold mr-3">
                      NA
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Nguyễn Văn A</p>
                      <p className="text-xs text-gray-500">Mã thẻ: LIB-2026-1234 • Hạn thẻ: 31/12/2026</p>
                    </div>
                  </div>
                  <Badge variant="success">Đủ điều kiện</Badge>
                </div>
              </div>

              {/* Books Selection */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                <Label className="text-base font-semibold mb-2 block">2. Thêm sách mượn</Label>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Quét mã vạch hoặc nhập ISBN..." className="pl-9" />
                  </div>
                  <Button variant="secondary">Thêm sách</Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên sách</TableHead>
                      <TableHead>Mã bản sao</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium text-gray-900">Clean Code</TableCell>
                      <TableCell className="font-mono text-sm">CP-10023</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 px-2 h-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-gray-900">Design Patterns</TableCell>
                      <TableCell className="font-mono text-sm">CP-10542</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 px-2 h-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="h-fit">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle>Tổng kết phiếu</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ngày mượn:</span>
                <span className="font-medium">10/06/2026</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hạn trả (14 ngày):</span>
                <span className="font-bold text-[#1976D2]">24/06/2026</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Số lượng sách:</span>
                <span className="font-medium">2 cuốn</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button className="w-full h-12 text-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Xác nhận cho mượn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Quét mã vạch hoặc nhập mã phiếu / mã sách</h3>
                <div className="flex gap-3">
                  <Input placeholder="Nhập mã phiếu mượn (VD: PM-2026-001)..." className="h-14 text-lg text-center" autoFocus />
                  <Button size="lg" className="h-14 px-8">Tìm kiếm</Button>
                </div>
              </div>

              {/* Mock Return Detail - usually hidden until searched */}
              <div className="mt-12 border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg text-[#1976D2]">Phiếu mượn: PM-2026-088</h4>
                    <p className="text-sm text-gray-500">Độc giả: Trần Thị B • Ngày mượn: 20/05/2026</p>
                  </div>
                  <Badge variant="danger" className="text-sm px-3 py-1">Quá hạn 6 ngày</Badge>
                </div>
                <div className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên sách</TableHead>
                        <TableHead>Hạn trả</TableHead>
                        <TableHead>Tình trạng sách lúc mượn</TableHead>
                        <TableHead>Tiền phạt (5k/ngày)</TableHead>
                        <TableHead className="text-center">Xác nhận trả</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-gray-900">Nhà Giả Kim (CP-8821)</TableCell>
                        <TableCell>03/06/2026</TableCell>
                        <TableCell>Bình thường</TableCell>
                        <TableCell className="text-red-600 font-semibold">30,000đ</TableCell>
                        <TableCell className="text-center">
                          <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#1976D2] focus:ring-[#1976D2]" defaultChecked />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tổng tiền phạt:</p>
                    <p className="text-xl font-bold text-red-600">30,000đ</p>
                  </div>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    Hoàn tất trả sách
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
