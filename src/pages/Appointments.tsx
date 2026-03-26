import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
}

const initialAppointments: Appointment[] = [
  { id: 'A001', patientName: 'Rahul Sharma', doctorName: 'Dr. Priya Patel', date: '2024-12-21', time: '09:00 AM', type: 'General Checkup', status: 'scheduled' },
  { id: 'A002', patientName: 'Anita Singh', doctorName: 'Dr. Amit Kumar', date: '2024-12-21', time: '10:30 AM', type: 'Follow-up', status: 'scheduled' },
  { id: 'A003', patientName: 'Vikram Mehta', doctorName: 'Dr. Sneha Roy', date: '2024-12-21', time: '11:00 AM', type: 'Consultation', status: 'scheduled' },
  { id: 'A004', patientName: 'Meera Joshi', doctorName: 'Dr. Priya Patel', date: '2024-12-21', time: '02:00 PM', type: 'Lab Test Review', status: 'scheduled' },
  { id: 'A005', patientName: 'Arjun Reddy', doctorName: 'Dr. Rajesh Nair', date: '2024-12-20', time: '09:30 AM', type: 'Orthopedic Check', status: 'completed' },
  { id: 'A006', patientName: 'Kavya Menon', doctorName: 'Dr. Ananya Sharma', date: '2024-12-20', time: '11:00 AM', type: 'Skin Consultation', status: 'completed' },
  { id: 'A007', patientName: 'Deepak Verma', doctorName: 'Dr. Vikram Singh', date: '2024-12-20', time: '03:00 PM', type: 'Neurology Check', status: 'cancelled' },
  { id: 'A008', patientName: 'Priyanka Das', doctorName: 'Dr. Priya Patel', date: '2024-12-19', time: '10:00 AM', type: 'General Checkup', status: 'no-show' },
];

const statusConfig = {
  scheduled: { icon: Clock, color: 'bg-primary/15 text-primary', label: 'Scheduled' },
  completed: { icon: CheckCircle, color: 'bg-success/15 text-success', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'bg-destructive/15 text-destructive', label: 'Cancelled' },
  'no-show': { icon: AlertCircle, color: 'bg-warning/15 text-warning', label: 'No Show' },
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: '',
    doctorName: '',
    time: '',
    type: '',
  });

  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const filteredAppointments = appointments.filter(apt => apt.date === selectedDateStr);
  const todayAppointments = appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]);

  const handleAddAppointment = () => {
    if (newAppointment.patientName && newAppointment.doctorName && newAppointment.time && selectedDate) {
      const appointment: Appointment = {
        id: `A${String(appointments.length + 1).padStart(3, '0')}`,
        patientName: newAppointment.patientName,
        doctorName: newAppointment.doctorName,
        date: selectedDate.toISOString().split('T')[0],
        time: newAppointment.time,
        type: newAppointment.type,
        status: 'scheduled',
      };
      setAppointments([appointment, ...appointments]);
      setNewAppointment({ patientName: '', doctorName: '', time: '', type: '' });
      setIsAddDialogOpen(false);
    }
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status } : apt
    ));
  };

  return (
    <MainLayout title="Appointments" subtitle="Schedule and manage patient appointments">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Section */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Today's Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{todayAppointments.filter(a => a.status === 'scheduled').length}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <p className="text-2xl font-bold text-success">{todayAppointments.filter(a => a.status === 'completed').length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Appointments for {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-muted-foreground">{filteredAppointments.length} appointments</p>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Patient Name</Label>
                    <Input
                      value={newAppointment.patientName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Doctor</Label>
                    <Select
                      value={newAppointment.doctorName}
                      onValueChange={(value) => setNewAppointment({ ...newAppointment, doctorName: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Dr. Priya Patel', 'Dr. Amit Kumar', 'Dr. Sneha Roy', 'Dr. Rajesh Nair', 'Dr. Ananya Sharma', 'Dr. Vikram Singh'].map((doc) => (
                          <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Time</Label>
                      <Select
                        value={newAppointment.time}
                        onValueChange={(value) => setNewAppointment({ ...newAppointment, time: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'].map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Type</Label>
                      <Select
                        value={newAppointment.type}
                        onValueChange={(value) => setNewAppointment({ ...newAppointment, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {['General Checkup', 'Follow-up', 'Consultation', 'Lab Test Review', 'Emergency'].map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAppointment}>Schedule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12">
              <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">No appointments</p>
              <p className="text-sm text-muted-foreground">No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment, index) => {
                const StatusIcon = statusConfig[appointment.status].icon;
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:shadow-md animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                      <User className="h-6 w-6 text-accent-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{appointment.patientName}</h4>
                        <Badge className={cn(statusConfig[appointment.status].color)}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[appointment.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </span>
                        <span>{appointment.type}</span>
                      </div>
                    </div>

                    {appointment.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(appointment.id, 'completed')}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => updateStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Appointments;
