import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const mockBooks = [
  { id: 1, isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', author: 'Robert C. Martin', copies: 5, available: 2, cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=100' },
  { id: 2, isbn: '978-0201633610', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma', copies: 3, available: 0, cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=100' },
  { id: 3, isbn: '978-1491904244', title: 'You Don\'t Know JS: Up & Going', author: 'Kyle Simpson', copies: 8, available: 8, cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=100' },
];

export function Catalog() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Sách (Catalog)</h2>
          <p className="text-gray-500">Thêm, sửa, xóa và theo dõi số lượng sách</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Thêm sách mới
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input placeholder="Tìm kiếm theo tên sách, tác giả, ISBN..." className="pl-10" />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Lọc
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Ảnh bìa</TableHead>
                <TableHead>Thông tin sách</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead className="text-center">Số bản sao</TableHead>
                <TableHead>Tình trạng</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBooks.map(book => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="w-12 h-16 rounded overflow-hidden border border-gray-200">
                      <ImageWithFallback src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-gray-900 line-clamp-1" title={book.title}>{book.title}</p>
                    <p className="text-sm text-gray-500">{book.author}</p>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600">{book.isbn}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">{book.available}</span> / {book.copies}
                  </TableCell>
                  <TableCell>
                    {book.available > 0 ? (
                      <Badge variant="success">Sẵn sàng ({book.available})</Badge>
                    ) : (
                      <Badge variant="danger">Đang mượn hết</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-[#1976D2] hover:text-[#1565C0] hover:bg-blue-50 px-2">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">Hiển thị 1 - 3 của 125 kết quả</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>Trước</Button>
              <Button variant="outline" size="sm" className="bg-[#E3F2FD] text-[#1976D2] border-[#E3F2FD]">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Sau</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Book Modal (Mock) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white shadow-xl">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl">Thêm sách mới</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>ISBN</Label>
                    <Input className="mt-1" placeholder="Nhập mã ISBN" />
                  </div>
                  <div>
                    <Label>Tên sách</Label>
                    <Input className="mt-1" placeholder="Nhập tên sách" />
                  </div>
                  <div>
                    <Label>Tác giả</Label>
                    <Input className="mt-1" placeholder="Nhập tên tác giả" />
                  </div>
                  <div>
                    <Label>Nhà xuất bản</Label>
                    <Input className="mt-1" placeholder="Nhập NXB" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Thể loại</Label>
                    <select className="mt-1 w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1976D2] focus:outline-none focus:ring-1 focus:ring-[#1976D2]">
                      <option>Công nghệ thông tin</option>
                      <option>Kinh tế</option>
                      <option>Văn học</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Số lượng (bản sao)</Label>
                      <Input type="number" className="mt-1" defaultValue={1} min={1} />
                    </div>
                    <div>
                      <Label>Năm xuất bản</Label>
                      <Input type="number" className="mt-1" placeholder="YYYY" />
                    </div>
                  </div>
                  <div>
                    <Label>Ảnh bìa (URL)</Label>
                    <Input className="mt-1" placeholder="https://..." />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Hủy bỏ</Button>
                <Button onClick={() => setShowAddModal(false)}>Lưu thông tin</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
