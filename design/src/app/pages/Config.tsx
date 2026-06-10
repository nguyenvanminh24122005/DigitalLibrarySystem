import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Save, Plus, Edit, Trash2 } from 'lucide-react';

const mockLibrarians = [
  { id: 'L01', name: 'Trần Thủ Thư A', email: 'thuthu.a@digilib.com', status: 'Đang làm việc' },
  { id: 'L02', name: 'Lê Thủ Thư B', email: 'thuthu.b@digilib.com', status: 'Đang làm việc' },
  { id: 'L03', name: 'Phạm Thủ Thư C', email: 'thuthu.c@digilib.com', status: 'Nghỉ phép' },
];

export function Config() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Cấu hình hệ thống</h2>
        <p className="text-gray-500">Quản lý tham số và nhân sự thư viện</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quy tắc Mượn / Trả</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Số sách tối đa mỗi lần mượn</Label>
                <div className="flex items-center mt-1">
                  <Input type="number" defaultValue={5} className="w-full rounded-r-none" />
                  <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-sm text-gray-600 rounded-r-md">cuốn</span>
                </div>
              </div>
              
              <div>
                <Label>Thời gian mượn tối đa</Label>
                <div className="flex items-center mt-1">
                  <Input type="number" defaultValue={14} className="w-full rounded-r-none" />
                  <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-sm text-gray-600 rounded-r-md">ngày</span>
                </div>
              </div>

              <div>
                <Label>Số lần gia hạn tối đa</Label>
                <div className="flex items-center mt-1">
                  <Input type="number" defaultValue={2} className="w-full rounded-r-none" />
                  <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-sm text-gray-600 rounded-r-md">lần</span>
                </div>
              </div>

              <div>
                <Label>Phí phạt quá hạn</Label>
                <div className="flex items-center mt-1">
                  <Input type="number" defaultValue={5000} className="w-full rounded-r-none" />
                  <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-sm text-gray-600 rounded-r-md">VNĐ/ngày</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50/50 border-t border-gray-100 rounded-b-[16px] justify-end">
              <Button className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Lưu quy tắc
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tên thư viện</Label>
                <Input defaultValue="Thư viện Số Quốc gia" className="mt-1" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="mb-0">Gửi email nhắc nhở quá hạn</Label>
                  <p className="text-xs text-gray-500">Tự động gửi trước 1 ngày</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#1976D2] checked:right-0 checked:border-[#1976D2]" checked readOnly />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-[#1976D2] cursor-pointer"></label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
              <CardTitle>Danh sách Thủ thư</CardTitle>
              <Button size="sm" className="flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Thêm tài khoản
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã NV</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLibrarians.map(lib => (
                    <TableRow key={lib.id}>
                      <TableCell className="font-medium text-gray-900">{lib.id}</TableCell>
                      <TableCell>{lib.name}</TableCell>
                      <TableCell>{lib.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lib.status === 'Đang làm việc' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lib.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" className="text-[#1976D2] px-2 h-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 px-2 h-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
