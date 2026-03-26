
import { useEffect, useState } from 'react'
import { Users, UserCog, Calendar, Receipt } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { StatCard } from '@/components/dashboard/StatCard'
import { AppointmentList } from '@/components/dashboard/AppointmentList'
import { RecentPatients } from '@/components/dashboard/RecentPatients'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { supabase } from '@/lib/supabase'

const Index = () => {
  const [stats, setStats] = useState<any[]>([])

  const fetchStats = async () => {
    // 🔥 Patients count
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    // 🔥 Doctors count
    const { count: doctorCount } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })

    // 🔥 Today's appointments
    const today = new Date().toISOString().split('T')[0]

    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)

    // 🔥 Pending bills (fake for now if removed)
    const pendingBills = 0

    setStats([
      {
        title: 'Total Patients',
        value: patientCount || 0,
        icon: Users,
        variant: 'primary',
      },
      {
        title: 'Active Doctors',
        value: doctorCount || 0,
        icon: UserCog,
        variant: 'success',
      },
      {
        title: "Today's Appointments",
        value: appointmentCount || 0,
        icon: Calendar,
        variant: 'warning',
      },
      {
        title: 'Pending Bills',
        value: `₹${pendingBills}`,
        icon: Receipt,
        variant: 'default',
      },
    ])
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening today."
    >
      {/* Stats Grid */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AppointmentList />
        </div>

        <div>
          <QuickActions />
        </div>
      </div>

      <div className="mt-6">
        <RecentPatients />
      </div>
    </MainLayout>
  )
}

export default Index
