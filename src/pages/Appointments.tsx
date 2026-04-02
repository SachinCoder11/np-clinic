'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

const statusConfig = {
  scheduled: { icon: Clock, color: 'bg-primary/15 text-primary', label: 'Scheduled' },
  completed: { icon: CheckCircle, color: 'bg-success/15 text-success', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'bg-destructive/15 text-destructive', label: 'Cancelled' },
  'no-show': { icon: AlertCircle, color: 'bg-warning/15 text-warning', label: 'No Show' },
};

const formatDate = (date: Date) => date.toLocaleDateString('en-CA');

const timeSlots = [
  '09:00','09:30','10:00','10:30',
  '11:00','11:30','14:00','14:30',
  '15:00','15:30','16:00'
];

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    doctorName: '',
    time: '',
  });

  const selectedDateStr = formatDate(selectedDate);

  // 🔥 FETCH APPOINTMENTS
  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        patients ( full_name ),
        doctors ( full_name )
      `);

    const formatted = data?.map((item: any) => ({
      id: item.id,
      patientName: item.patients?.full_name || 'Unknown',
      doctorName: item.doctors?.full_name || 'Unknown',
      date: item.appointment_date,
      time: item.appointment_time,
      status: item.status,
    })) || [];

    setAppointments(formatted);
  };

  const fetchPatients = async () => {
    setLoadingPatients(true);
    const { data } = await supabase.from('patients').select('id, full_name');
    setPatients(data || []);
    setLoadingPatients(false);
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    const { data } = await supabase.from('doctors').select('id, full_name');
    setDoctors(data || []);
    setLoadingDoctors(false);
  };

  const fetchBookedSlots = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('appointment_date', selectedDateStr);

    setBookedSlots(data?.map((d) => d.appointment_time) || []);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();

    const channel = supabase
      .channel('appointments-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        fetchAppointments
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedDate]);

  // 🧠 CALENDAR LOGIC
  const appointmentDates = appointments.map(a => a.date);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const isPast = (date: Date) => {
    const today = new Date();
    return date < new Date(today.setHours(0, 0, 0, 0));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // ➕ ADD APPOINTMENT
  const handleAddAppointment = async () => {
    if (!newAppointment.patientName || !newAppointment.doctorName || !newAppointment.time) return;

    if (bookedSlots.includes(newAppointment.time)) {
      alert('Slot already booked');
      return;
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('full_name', newAppointment.patientName)
      .single();

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('full_name', newAppointment.doctorName)
      .single();

    if (!patient || !doctor) {
      alert('Invalid patient/doctor');
      return;
    }

    await supabase.from('appointments').insert({
      patient_id: patient.id,
      doctor_id: doctor.id,
      appointment_date: selectedDateStr,
      appointment_time: newAppointment.time,
      status: 'scheduled',
    });

    setIsAddDialogOpen(false);
    setNewAppointment({ patientName: '', doctorName: '', time: '' });
  };

  const filteredAppointments = appointments.filter(a => a.date === selectedDateStr);

  return (
    <MainLayout title="Appointments" subtitle="Manage appointments">
      <div className="grid gap-6 lg:grid-cols-3">

        {/* 🔥 CALENDAR WITH MARKINGS */}
        <div className="p-5 border rounded-xl">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            components={{
              DayContent: ({ date }) => {
                const formatted = formatDate(date);
                const hasAppointment = appointmentDates.includes(formatted);

                let style = '';

                if (hasAppointment) {
                  if (isToday(date)) style = 'bg-green-500 text-white';
                  else if (isPast(date)) style = 'bg-gray-400 text-white';
                  else style = 'bg-blue-500 text-white';
                }

                return (
                  <div className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-full relative',
                    style
                  )}>
                    {date.getDate()}

                    {hasAppointment && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white"></span>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>

        {/* 📋 LIST + ADD */}
        <div className="lg:col-span-2">

          <div className="flex justify-between mb-4">
            <h3>Appointments for {selectedDateStr}</h3>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Appointment</DialogTitle>
                </DialogHeader>

                {/* Patient */}
                <Select onValueChange={(v) => setNewAppointment({ ...newAppointment, patientName: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select patient"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPatients
                      ? <SelectItem value="loading">Loading...</SelectItem>
                      : patients.map(p => (
                          <SelectItem key={p.id} value={p.full_name}>
                            {p.full_name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>

                {/* Doctor */}
                <Select onValueChange={(v) => setNewAppointment({ ...newAppointment, doctorName: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors
                      ? <SelectItem value="loading">Loading...</SelectItem>
                      : doctors.map(d => (
                          <SelectItem key={d.id} value={d.full_name}>
                            {d.full_name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>

                {/* Time */}
                <Select onValueChange={(v) => setNewAppointment({ ...newAppointment, time: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => {
                      const booked = bookedSlots.includes(slot);
                      return (
                        <SelectItem key={slot} value={slot} disabled={booked}>
                          {slot} {booked ? '(Booked)' : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Button onClick={handleAddAppointment}>Save</Button>
              </DialogContent>
            </Dialog>
          </div>

          {/* LIST */}
          {filteredAppointments.length === 0 ? (
            <div className="p-10 text-center border rounded-xl">
              No appointments
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const StatusIcon = statusConfig[apt.status].icon;

              return (
                <div key={apt.id} className="p-4 border rounded-xl mb-2 flex justify-between">
                  <div>
                    <p>{apt.patientName}</p>
                    <p className="text-sm">{apt.doctorName}</p>
                  </div>

                  <div className="text-right">
                    <p>{apt.time}</p>
                    <Badge className={statusConfig[apt.status].color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}