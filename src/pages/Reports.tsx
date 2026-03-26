
import { useEffect, useState } from 'react'
import { Download, TrendingUp, Users, Calendar, FileText } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { supabase } from '@/lib/supabase'

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [appointmentTrend, setAppointmentTrend] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {

    // 🔥 FETCH COUNTS
    const { count: patients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    const { count: appointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })

    const { count: prescriptions } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true })

    setStats({ patients, appointments, prescriptions })

    // 🔥 FETCH APPOINTMENTS
    const { data: appts } = await supabase
      .from('appointments')
      .select('appointment_date')

    // 🟢 MONTHLY
    const monthMap: any = {
      Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
    }

    appts?.forEach((a) => {
      const m = new Date(a.appointment_date)
        .toLocaleString('default', { month: 'short' })

      if (monthMap[m] !== undefined) monthMap[m]++
    })

    setMonthlyData(
      Object.keys(monthMap).map((m) => ({
        month: m,
        patients: monthMap[m], // KEEP KEY SAME
      }))
    )

    // 🟢 WEEKLY
    const weekMap: any = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    }

    appts?.forEach((a) => {
      const d = new Date(a.appointment_date)
        .toLocaleString('en-US', { weekday: 'short' })

      if (weekMap[d] !== undefined) weekMap[d]++
    })

    setAppointmentTrend(
      Object.keys(weekMap).map((d) => ({
        day: d,
        count: weekMap[d],
      }))
    )

    // 🟢 DEPARTMENT
    const { data: docs } = await supabase
      .from('doctors')
      .select('specialization')

    const deptMap: any = {}

    docs?.forEach((d) => {
      deptMap[d.specialization] = (deptMap[d.specialization] || 0) + 1
    })

    const total = docs?.length || 1

    setDepartmentData(
      Object.keys(deptMap).map((k) => ({
        name: k,
        value: Math.round((deptMap[k] / total) * 100),
        color: getColor(k),
      }))
    )
  }

  const getColor = (name: string) => {
    const colors: any = {
      'General Medicine': 'hsl(174, 72%, 40%)',
      'Cardiology': 'hsl(38, 92%, 50%)',
      'Pediatrics': 'hsl(145, 65%, 42%)',
      'Orthopedics': 'hsl(200, 70%, 50%)',
    }
    return colors[name] || 'hsl(215, 16%, 47%)'
  }

  return (
    <MainLayout title="Reports" subtitle="Analytics and performance insights">

      {/* SUMMARY */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-bold">{stats.patients || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Appointments</p>
            <p className="text-2xl font-bold">{stats.appointments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Prescriptions</p>
            <p className="text-2xl font-bold">{stats.prescriptions || 0}</p>
          </CardContent>
        </Card>

      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* MONTHLY */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="hsl(174,72%,40%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* DEPARTMENT */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer height={200}>
              <PieChart>
                <Pie data={departmentData} dataKey="value">
                  {departmentData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
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
              <LineChart data={appointmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(174,72%,40%)"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}

export default Reports
