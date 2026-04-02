'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b',
  '#ef4444', '#06b6d4', '#8b5cf6'
];

export default function Reports() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patients ( full_name ),
        doctors ( full_name, specialization )
      `);

    const formatted = data?.map((a: any) => ({
      id: a.id,
      patient: a.patients?.full_name || 'Unknown',
      doctor: a.doctors?.full_name || 'Unknown',
      department: a.doctors?.specialization || 'General',
      date: a.appointment_date,
      time: a.appointment_time?.slice(0, 5),
      status: a.status,
    })) || [];

    setAppointments(formatted);

    // 📊 MONTHLY (FULL YEAR STRUCTURE)
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthMap: any = Object.fromEntries(months.map(m => [m, 0]));

    formatted.forEach(a => {
      const m = new Date(a.date).toLocaleString('default', { month: 'short' });
      monthMap[m]++;
    });

    setMonthlyData(months.map(m => ({ month: m, count: monthMap[m] })));

    // 📊 WEEKLY
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const weekMap: any = Object.fromEntries(days.map(d => [d, 0]));

    formatted.forEach(a => {
      const d = new Date(a.date).toLocaleString('en-US', { weekday: 'short' });
      weekMap[d]++;
    });

    setWeeklyData(days.map(d => ({ day: d, count: weekMap[d] })));

    // 🧠 DEPARTMENT (SMART GROUPING)
    const deptMap: any = {};
    formatted.forEach(a => {
      deptMap[a.department] = (deptMap[a.department] || 0) + 1;
    });

    let deptArray = Object.entries(deptMap).map(([name, value]) => ({
      name,
      value: value as number
    }));

    deptArray.sort((a, b) => b.value - a.value);

    const main = deptArray.slice(0, 4);
    const others = deptArray.slice(4).reduce((sum, d) => sum + d.value, 0);

    if (others > 0) {
      main.push({ name: 'Others', value: others });
    }

    setDepartmentData(main);

    setLoading(false);
  };

  // 📥 EXPORT
  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(appointments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Appointments');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    saveAs(new Blob([buffer]), 'appointments.xlsx');
  };

  // 🌀 LOADING UI
  if (loading) {
    return (
      <MainLayout title="Reports" subtitle="Loading...">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reports" subtitle="Analytics + Data Export">

      {/* DOWNLOAD */}
      <div className="mb-4 flex justify-end">
        <Button onClick={exportExcel}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* TABLE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Appointments (Clear Data View)</CardTitle>
        </CardHeader>
        <CardContent className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={i} className="border-b">
                  <td>{a.patient}</td>
                  <td>{a.doctor}</td>
                  <td>{a.department}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* MONTHLY */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Appointments</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PIE */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={250}>
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {departmentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* WEEKLY */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Appointment Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}