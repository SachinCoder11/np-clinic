import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
}

const patients: Patient[] = [
  { id: '1', name: 'Arjun Reddy', age: 34, gender: 'Male', lastVisit: '2024-12-20', condition: 'Hypertension' },
  { id: '2', name: 'Kavya Menon', age: 28, gender: 'Female', lastVisit: '2024-12-19', condition: 'Diabetes Type 2' },
  { id: '3', name: 'Deepak Verma', age: 45, gender: 'Male', lastVisit: '2024-12-19', condition: 'Back Pain' },
  { id: '4', name: 'Priyanka Das', age: 52, gender: 'Female', lastVisit: '2024-12-18', condition: 'Arthritis' },
];

export function RecentPatients() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Patients</h3>
        <Link to="/patients">
          <Button variant="ghost" size="sm" className="text-primary">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Age/Gender</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Last Visit</th>
              <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Condition</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <tr
                key={patient.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="py-3">
                  <span className="font-medium text-foreground">{patient.name}</span>
                </td>
                <td className="py-3 text-sm text-muted-foreground">
                  {patient.age} / {patient.gender}
                </td>
                <td className="py-3 text-sm text-muted-foreground">{patient.lastVisit}</td>
                <td className="py-3">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    {patient.condition}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
