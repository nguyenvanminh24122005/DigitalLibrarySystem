import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Calendar as CalendarIcon, Filter } from 'lucide-react';

const lineData = [
  { name: 'Tháng 1', borrow: 400, return: 380 },
  { name: 'Tháng 2', borrow: 300, return: 350 },
  { name: 'Tháng 3', borrow: 550, return: 480 },
  { name: 'Tháng 4', borrow: 450, return: 420 },
  { name: 'Tháng 5', borrow: 600, return: 550 },
  { name: 'Tháng 6', borrow: 700, return: 600 },
];

const categoryData = [
  { name: 'Văn học', value: 400 },
  { name: 'Kỹ năng sống', value: 300 },
  { name: 'Công nghệ', value: 500 },
  { name: 'Kinh tế', value: 200 },
];

const COLORS = ['#1976D2', '#4CAF50', '#FF9800', '#9C27B0'];

export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Báo cáo Thống kê</h2>
          <p className="text-gray-500">Phân tích dữ liệu hoạt động của thư viện</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
            <div className="flex items-center border border-gray-300 rounded-md bg-white px-3 py-2">
              <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
              <select className="bg-transparent border-none focus:outline-none text-sm text-gray-700">
                <option>6 tháng gần đây</option>
                <option>Năm nay</option>
                <option>Tháng này</option>
                <option>Tùy chỉnh...</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại báo cáo</label>
            <select className="border border-gray-300 rounded-md bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1976D2]">
              <option>Tổng hợp mượn trả</option>
              <option>Phân tích độc giả</option>
              <option>Thống kê sách</option>
            </select>
          </div>
          <Button className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Áp dụng
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ Xu hướng Mượn - Trả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="borrow" name="Lượt mượn" stroke="#1976D2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="return" name="Lượt trả" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ Sách được Mượn theo Thể loại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Sách được mượn nhiều nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Đắc Nhân Tâm', count: 156 },
                    { name: 'Nhà Giả Kim', count: 142 },
                    { name: 'Clean Code', count: 98 },
                    { name: 'Sapiens', count: 85 },
                    { name: 'Think Fast & Slow', count: 76 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="count" name="Số lượt mượn" fill="#1976D2" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
