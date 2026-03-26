
import { useState, useEffect } from 'react'
import { Plus, Search, FileText, Pill } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [editingRx, setEditingRx] = useState<any>(null)

  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    medicines: '',
    notes: '',
  })

  // 🔥 FETCH DATA
  const fetchData = async () => {
    const { data } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patients(full_name),
        doctors(full_name),
        medicines(*)
      `)
      .order('created_at', { ascending: false })

    const { data: p } = await supabase.from('patients').select('id, full_name')
    const { data: d } = await supabase.from('doctors').select('id, full_name')

    setPrescriptions(data || [])
    setPatients(p || [])
    setDoctors(d || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🔥 CREATE
  const handleCreate = async () => {
    const { data } = await supabase
      .from('prescriptions')
      .insert([
        {
          patient_id: form.patient_id,
          doctor_id: form.doctor_id,
          diagnosis: form.diagnosis,
          notes: form.notes,
        },
      ])
      .select()
      .single()

    const meds = form.medicines
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [name, dosage, duration] = line.split(',')
        return {
          prescription_id: data.id,
          name: name?.trim(),
          dosage: dosage?.trim(),
          duration: duration?.trim(),
        }
      })

    if (meds.length > 0) {
      await supabase.from('medicines').insert(meds)
    }

    fetchData()
    setIsAddOpen(false)
  }

  // 🔥 PRINT
  const handlePrint = (rx: any) => {
    const content = `
Prescription
-------------------------
Patient: ${rx.patients?.full_name}
Doctor: ${rx.doctors?.full_name}
Diagnosis: ${rx.diagnosis}

Medicines:
${rx.medicines.map((m: any) =>
      `- ${m.name} (${m.dosage}, ${m.duration})`
    ).join('\n')}

Notes:
${rx.notes || 'None'}
    `

    const win = window.open('', '', 'width=800,height=600')
    win?.document.write(`<pre>${content}</pre>`)
    win?.print()
  }

  // 🔥 EDIT
  const openEdit = (rx: any) => {
    setEditingRx(rx)
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    await supabase
      .from('prescriptions')
      .update({
        diagnosis: editingRx.diagnosis,
        notes: editingRx.notes,
      })
      .eq('id', editingRx.id)

    setIsEditOpen(false)
    fetchData()
  }

  const filtered = prescriptions.filter((rx) =>
    rx.patients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout title="Prescriptions" subtitle="Manage prescriptions">

      {/* HEADER */}
      <div className="mb-6 flex justify-between">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Prescription</DialogTitle>
            </DialogHeader>

            <Select onValueChange={(v) => setForm({ ...form, patient_id: v })}>
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

            <Select onValueChange={(v) => setForm({ ...form, doctor_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Diagnosis"
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            />

            <Textarea
              placeholder="Medicine, dosage, duration (one per line)"
              onChange={(e) => setForm({ ...form, medicines: e.target.value })}
            />

            <Textarea
              placeholder="Notes"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <Button onClick={handleCreate}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((rx, index) => (
          <div
            key={rx.id}
            className="rounded-xl border bg-card p-5 shadow-card"
          >
            {/* HEADER */}
            <div className="mb-4 flex justify-between">
              <div>
                <h3 className="font-semibold">
                  {rx.patients?.full_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {rx.doctors?.full_name}
                </p>
              </div>

              <div className="text-right text-xs">
                <p>RX{rx.id.slice(0, 4)}</p>
                <p>{rx.created_at?.split('T')[0]}</p>
              </div>
            </div>

            {/* DIAGNOSIS */}
            <Badge>{rx.diagnosis}</Badge>

            {/* MEDICINES */}
            <div className="mt-3 space-y-2">
              {rx.medicines?.map((m: any, i: number) => (
                <div key={i} className="bg-muted p-3 rounded">
                  <p>{m.name}</p>
                  <p className="text-xs">
                    {m.dosage} • {m.duration}
                  </p>
                </div>
              ))}
            </div>

            {/* NOTES */}
            {rx.notes && (
              <div className="mt-3 border p-3 rounded text-sm">
                {rx.notes}
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePrint(rx)}
              >
                Print
              </Button>

              <Button
                className="flex-1"
                onClick={() => openEdit(rx)}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prescription</DialogTitle>
          </DialogHeader>

          <Input
            value={editingRx?.diagnosis || ''}
            onChange={(e) =>
              setEditingRx({ ...editingRx, diagnosis: e.target.value })
            }
          />

          <Textarea
            value={editingRx?.notes || ''}
            onChange={(e) =>
              setEditingRx({ ...editingRx, notes: e.target.value })
            }
          />

          <Button onClick={handleUpdate}>Save</Button>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

export default Prescriptions
