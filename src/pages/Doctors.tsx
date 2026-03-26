
import { useState, useEffect } from 'react'
import { Plus, Search, Star, Clock, Users } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'

interface Doctor {
  id: string
  full_name: string
  specialization: string
  experience: number
  patients_count: number
  rating: number
  available_days: string[]
  phone: string
  email: string
  status: 'available' | 'busy' | 'off-duty'
}

interface Patient {
  id: string
  full_name: string
}

const statusStyles = {
  available: 'bg-success/15 text-success',
  busy: 'bg-warning/15 text-warning',
  'off-duty': 'bg-muted text-muted-foreground',
}

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const [bookingData, setBookingData] = useState({
    patient_id: '',
    date: '',
    time: '',
  })

  // 🔥 FETCH DATA
  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select('*')
    setDoctors(data || [])
  }

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select('id, full_name')
    setPatients(data || [])
  }

  useEffect(() => {
    fetchDoctors()
    fetchPatients()
  }, [])

  // 🔥 BOOK APPOINTMENT
  const handleBooking = async () => {
    if (!selectedDoctor) return

    const { error } = await supabase.from('appointments').insert([
      {
        patient_id: bookingData.patient_id,
        doctor_id: selectedDoctor.id,
        appointment_date: bookingData.date,
        appointment_time: bookingData.time,
        status: 'scheduled',
      },
    ])

    if (!error) {
      // 🔥 increment patient count
      await supabase
        .from('doctors')
        .update({
          patients_count: selectedDoctor.patients_count + 1,
        })
        .eq('id', selectedDoctor.id)

      fetchDoctors()
      setIsBookingOpen(false)
      setBookingData({ patient_id: '', date: '', time: '' })
    }
  }

  const filteredDoctors = doctors.filter(
    (d) =>
      d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout title="Doctors" subtitle="Manage doctors and their schedules">

      {/* SEARCH */}
      <div className="mb-6 flex justify-between">
        <Input
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>

      {/* GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="rounded-xl border p-5 shadow">

            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{doctor.full_name}</h3>
                <p className="text-sm text-primary">{doctor.specialization}</p>
              </div>
              <Badge className={statusStyles[doctor.status]}>
                {doctor.status}
              </Badge>
            </div>

            {/* STATS */}
            <div className="mt-4 grid grid-cols-3 text-center">
              <div>
                <Clock className="mx-auto h-4" />
                <p>{doctor.experience}</p>
                <span className="text-xs">Years</span>
              </div>
              <div>
                <Users className="mx-auto h-4" />
                <p>{doctor.patients_count}</p>
                <span className="text-xs">Patients</span>
              </div>
              <div>
                <Star className="mx-auto h-4 text-yellow-500" />
                <p>{doctor.rating}</p>
                <span className="text-xs">Rating</span>
              </div>
            </div>

            {/* AVAILABILITY */}
            <div className="mt-3 flex gap-1 flex-wrap">
              {doctor.available_days?.map((d) => (
                <span key={d} className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {d}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedDoctor(doctor)
                  setIsProfileOpen(true)
                }}
              >
                View Profile
              </Button>

              <Button
                className="flex-1"
                onClick={() => {
                  setSelectedDoctor(doctor)
                  setIsBookingOpen(true)
                }}
              >
                Book Slot
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* PROFILE MODAL */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          {selectedDoctor && (
            <div>
              <h2 className="text-lg font-bold">
                {selectedDoctor.full_name}
              </h2>
              <p>{selectedDoctor.specialization}</p>
              <p>{selectedDoctor.experience} years</p>
              <p>Patients: {selectedDoctor.patients_count}</p>
              <p>Rating: ⭐ {selectedDoctor.rating}</p>
              <p>Phone: {selectedDoctor.phone}</p>
              <p>Email: {selectedDoctor.email}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* BOOKING MODAL */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>

          <Select
            onValueChange={(val) =>
              setBookingData({ ...bookingData, patient_id: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            onChange={(e) =>
              setBookingData({ ...bookingData, date: e.target.value })
            }
          />

          <Input
            type="time"
            onChange={(e) =>
              setBookingData({ ...bookingData, time: e.target.value })
            }
          />

          <Button onClick={handleBooking}>Confirm Booking</Button>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

export default Doctors
