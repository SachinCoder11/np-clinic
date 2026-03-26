import { Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

const appointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Rahul Sharma',
    doctorName: 'Dr. Priya Patel',
    time: '09:00 AM',
    type: 'General Checkup',
    status: 'completed',
  },
  {
    id: '2',
    patientName: 'Anita Singh',
    doctorName: 'Dr. Amit Kumar',
    time: '10:30 AM',
    type: 'Follow-up',
    status: 'in-progress',
  },
  {
    id: '3',
    patientName: 'Vikram Mehta',
    doctorName: 'Dr. Sneha Roy',
    time: '11:00 AM',
    type: 'Consultation',
    status: 'scheduled',
  },
  {
    id: '4',
    patientName: 'Meera Joshi',
    doctorName: 'Dr. Priya Patel',
    time: '02:00 PM',
    type: 'Lab Test Review',
    status: 'scheduled',
  },
  {
    id: '5',
    patientName: 'Suresh Nair',
    doctorName: 'Dr. Amit Kumar',
    time: '03:30 PM',
    type: 'General Checkup',
    status: 'scheduled',
  },
];

const statusStyles = {
  scheduled: 'bg-accent text-accent-foreground',
  'in-progress': 'bg-primary text-primary-foreground',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-destructive/15 text-destructive',
};

export function AppointmentList() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Today's Appointments</h3>
        <span className="text-sm text-muted-foreground">{appointments.length} total</span>
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
              <p className="font-medium text-foreground">{appointment.patientName}</p>
              <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
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
