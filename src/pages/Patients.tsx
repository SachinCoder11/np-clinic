import { useEffect, useState } from "react";
import { Plus, Search, Filter, MoreVertical, Phone, Mail } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  blood_group: string;
  last_visit: string;
  status: "active" | "inactive";
}

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newPatient, setNewPatient] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    blood_group: "",
  });

  // 🔹 Fetch Patients
  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setPatients(data as Patient[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // 🔹 Add Patient
  const handleAddPatient = async () => {
    if (!newPatient.full_name || !newPatient.age || !newPatient.gender) return;

    const { error } = await supabase.from("patients").insert([
      {
        patient_code: `P${String(patients.length + 1).padStart(3, "0")}`,
        full_name: newPatient.full_name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        phone: newPatient.phone,
        email: newPatient.email,
        blood_group: newPatient.blood_group,
        last_visit: new Date().toISOString().split("T")[0],
        status: "active",
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
    } else {
      setNewPatient({
        full_name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        blood_group: "",
      });
      setIsAddDialogOpen(false);
      fetchPatients();
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Patients" subtitle="Manage patient records and information">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  value={newPatient.full_name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, full_name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, age: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select
                    value={newPatient.gender}
                    onValueChange={(value) =>
                      setNewPatient({ ...newPatient, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>Blood Group</Label>
                <Select
                  value={newPatient.blood_group}
                  onValueChange={(value) =>
                    setNewPatient({ ...newPatient, blood_group: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPatient}>Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Loading patients...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="mb-4 flex justify-between">
                <div>
                  <h3 className="font-semibold">{patient.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {patient.patient_code}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p>{patient.age}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p>{patient.gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blood</p>
                  <p>{patient.blood_group}</p>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {patient.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">
                  Last visit: {patient.last_visit}
                </span>
                <Badge
                  className={cn(
                    patient.status === "active"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {patient.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default Patients;