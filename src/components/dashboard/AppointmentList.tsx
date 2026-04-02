'use client';

import { useEffect, useState } from 'react';
import { Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

const statusStyles = {
  scheduled: 'bg-accent text-accent-foreground',
  'in-progress': 'bg-primary text-primary-foreground',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-destructive/15 text-destructive',
};

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          appointment_date,
          status,
          patients ( full_name ),
          doctors ( full_name )
        `)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      const formatted: Appointment[] = data.map((item: any) => ({
        id: item.id,
        patientName: item.patients?.full_name || 'Unknown',
        doctorName: item.doctors?.full_name || 'Unknown',
        time: new Date(`1970-01-01T${item.appointment_time}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'Consultation', // fallback since DB doesn’t include it
        status: item.status,
      }));

      setAppointments(formatted);
    };

    fetchAppointments();

    // 🔥 Realtime subscription
    const channel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Today's Appointments
        </h3>
        <span className="text-sm text-muted-foreground">
          {appointments.length} total
        </span>
      </div>

      <div className="space-y-3">
        {appointments.map((appointment, index) => (
          <div
            key={appointment.id}
            className="flex items-center gap-4 rounded-lg border border-border/50 bg-background p-4 transition-all hover:border-primary/30 hover:shadow-sm animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <User className="h-6 w-6 text-accent-foreground" />
            </div>

            <div className="flex-1">
              <p className="font-medium text-foreground">
                {appointment.patientName}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.doctorName}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {appointment.time}
              </div>

              <Badge className={cn('mt-1', statusStyles[appointment.status])}>
                {appointment.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}