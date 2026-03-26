import { Calendar, Receipt, UserPlus, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  {
    icon: UserPlus,
    label: 'Add Patient',
    description: 'Register a new patient',
    path: '/patients',
    color: 'bg-primary',
  },
  {
    icon: Calendar,
    label: 'Book Appointment',
    description: 'Schedule a visit',
    path: '/appointments',
    color: 'bg-success',
  },
  {
    icon: Receipt,
    label: 'Create Bill',
    description: 'Generate invoice',
    path: '/billing',
    color: 'bg-warning',
  },
  {
    icon: ClipboardList,
    label: 'Write Prescription',
    description: 'Create prescription',
    path: '/prescriptions',
    color: 'bg-accent-foreground',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.path}
            className="group flex items-center gap-3 rounded-lg border border-border/50 bg-background p-3 transition-all hover:border-primary/30 hover:shadow-md animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`rounded-lg p-2 ${action.color} text-primary-foreground`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
