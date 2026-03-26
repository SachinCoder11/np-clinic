// import { useState } from 'react';
// import { Plus, Search, Download, Eye, IndianRupee } from 'lucide-react';
// import { MainLayout } from '@/components/layout/MainLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { cn } from '@/lib/utils';

// interface Bill {
//   id: string;
//   patientName: string;
//   date: string;
//   consultationFee: number;
//   labCharges: number;
//   medicineCharges: number;
//   roomCharges: number;
//   totalAmount: number;
//   status: 'paid' | 'pending' | 'partial';
// }

// const initialBills: Bill[] = [
//   { id: 'B001', patientName: 'Arjun Reddy', date: '2024-12-21', consultationFee: 500, labCharges: 1200, medicineCharges: 350, roomCharges: 0, totalAmount: 2050, status: 'pending' },
//   { id: 'B002', patientName: 'Kavya Menon', date: '2024-12-20', consultationFee: 800, labCharges: 2500, medicineCharges: 890, roomCharges: 0, totalAmount: 4190, status: 'paid' },
//   { id: 'B003', patientName: 'Deepak Verma', date: '2024-12-20', consultationFee: 600, labCharges: 0, medicineCharges: 450, roomCharges: 3000, totalAmount: 4050, status: 'partial' },
//   { id: 'B004', patientName: 'Priyanka Das', date: '2024-12-19', consultationFee: 500, labCharges: 800, medicineCharges: 220, roomCharges: 0, totalAmount: 1520, status: 'paid' },
//   { id: 'B005', patientName: 'Rohit Sharma', date: '2024-12-19', consultationFee: 1000, labCharges: 3500, medicineCharges: 1200, roomCharges: 6000, totalAmount: 11700, status: 'pending' },
//   { id: 'B006', patientName: 'Sneha Iyer', date: '2024-12-18', consultationFee: 500, labCharges: 450, medicineCharges: 180, roomCharges: 0, totalAmount: 1130, status: 'paid' },
// ];

// const statusStyles = {
//   paid: 'bg-success/15 text-success',
//   pending: 'bg-warning/15 text-warning',
//   partial: 'bg-primary/15 text-primary',
// };

// const Billing = () => {
//   const [bills, setBills] = useState<Bill[]>(initialBills);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [newBill, setNewBill] = useState({
//     patientName: '',
//     consultationFee: '',
//     labCharges: '',
//     medicineCharges: '',
//     roomCharges: '',
//   });

//   const filteredBills = bills.filter(
//     (bill) =>
//       bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       bill.id.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalPending = bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0);
//   const totalCollected = bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);

//   const handleAddBill = () => {
//     if (newBill.patientName) {
//       const consultation = parseInt(newBill.consultationFee) || 0;
//       const lab = parseInt(newBill.labCharges) || 0;
//       const medicine = parseInt(newBill.medicineCharges) || 0;
//       const room = parseInt(newBill.roomCharges) || 0;
      
//       const bill: Bill = {
//         id: `B${String(bills.length + 1).padStart(3, '0')}`,
//         patientName: newBill.patientName,
//         date: new Date().toISOString().split('T')[0],
//         consultationFee: consultation,
//         labCharges: lab,
//         medicineCharges: medicine,
//         roomCharges: room,
//         totalAmount: consultation + lab + medicine + room,
//         status: 'pending',
//       };
//       setBills([bill, ...bills]);
//       setNewBill({ patientName: '', consultationFee: '', labCharges: '', medicineCharges: '', roomCharges: '' });
//       setIsAddDialogOpen(false);
//     }
//   };

//   const updateStatus = (id: string, status: Bill['status']) => {
//     setBills(bills.map(bill => 
//       bill.id === id ? { ...bill, status } : bill
//     ));
//   };

//   return (
//     <MainLayout title="Billing" subtitle="Manage patient bills and payments">
//       {/* Summary Cards */}
//       <div className="mb-6 grid gap-4 sm:grid-cols-3">
//         <div className="rounded-xl border border-border bg-success/10 p-5">
//           <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
//           <p className="mt-1 flex items-center text-2xl font-bold text-success">
//             <IndianRupee className="h-6 w-6" />
//             {totalCollected.toLocaleString()}
//           </p>
//         </div>
//         <div className="rounded-xl border border-border bg-warning/10 p-5">
//           <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
//           <p className="mt-1 flex items-center text-2xl font-bold text-warning">
//             <IndianRupee className="h-6 w-6" />
//             {totalPending.toLocaleString()}
//           </p>
//         </div>
//         <div className="rounded-xl border border-border bg-card p-5">
//           <p className="text-sm font-medium text-muted-foreground">Total Bills</p>
//           <p className="mt-1 text-2xl font-bold text-foreground">{bills.length}</p>
//         </div>
//       </div>

//       {/* Header Actions */}
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             placeholder="Search bills..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-64 pl-9"
//           />
//         </div>

//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Create Bill
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Create New Bill</DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <Label>Patient Name</Label>
//                 <Input
//                   value={newBill.patientName}
//                   onChange={(e) => setNewBill({ ...newBill, patientName: e.target.value })}
//                   placeholder="Enter patient name"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="grid gap-2">
//                   <Label>Consultation Fee (₹)</Label>
//                   <Input
//                     type="number"
//                     value={newBill.consultationFee}
//                     onChange={(e) => setNewBill({ ...newBill, consultationFee: e.target.value })}
//                     placeholder="500"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label>Lab Charges (₹)</Label>
//                   <Input
//                     type="number"
//                     value={newBill.labCharges}
//                     onChange={(e) => setNewBill({ ...newBill, labCharges: e.target.value })}
//                     placeholder="0"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="grid gap-2">
//                   <Label>Medicine Charges (₹)</Label>
//                   <Input
//                     type="number"
//                     value={newBill.medicineCharges}
//                     onChange={(e) => setNewBill({ ...newBill, medicineCharges: e.target.value })}
//                     placeholder="0"
//                   />
//                 </div>
//                 <div className="grid gap-2">
//                   <Label>Room Charges (₹)</Label>
//                   <Input
//                     type="number"
//                     value={newBill.roomCharges}
//                     onChange={(e) => setNewBill({ ...newBill, roomCharges: e.target.value })}
//                     placeholder="0"
//                   />
//                 </div>
//               </div>
//               <div className="rounded-lg bg-muted p-3">
//                 <div className="flex items-center justify-between">
//                   <span className="font-medium">Total Amount</span>
//                   <span className="flex items-center text-xl font-bold text-primary">
//                     <IndianRupee className="h-5 w-5" />
//                     {(
//                       (parseInt(newBill.consultationFee) || 0) +
//                       (parseInt(newBill.labCharges) || 0) +
//                       (parseInt(newBill.medicineCharges) || 0) +
//                       (parseInt(newBill.roomCharges) || 0)
//                     ).toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex justify-end gap-3">
//               <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddBill}>Create Bill</Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Bills Table */}
//       <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-border bg-muted/30">
//                 <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Bill ID</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Patient</th>
//                 <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
//                 <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Consultation</th>
//                 <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Lab</th>
//                 <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Medicine</th>
//                 <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Room</th>
//                 <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
//                 <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Status</th>
//                 <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredBills.map((bill, index) => (
//                 <tr
//                   key={bill.id}
//                   className="border-b border-border/50 transition-colors hover:bg-muted/30 animate-fade-in"
//                   style={{ animationDelay: `${index * 30}ms` }}
//                 >
//                   <td className="px-4 py-3 font-mono text-sm">{bill.id}</td>
//                   <td className="px-4 py-3 font-medium">{bill.patientName}</td>
//                   <td className="px-4 py-3 text-sm text-muted-foreground">{bill.date}</td>
//                   <td className="px-4 py-3 text-right text-sm">₹{bill.consultationFee}</td>
//                   <td className="px-4 py-3 text-right text-sm">₹{bill.labCharges}</td>
//                   <td className="px-4 py-3 text-right text-sm">₹{bill.medicineCharges}</td>
//                   <td className="px-4 py-3 text-right text-sm">₹{bill.roomCharges}</td>
//                   <td className="px-4 py-3 text-right font-semibold">₹{bill.totalAmount.toLocaleString()}</td>
//                   <td className="px-4 py-3 text-center">
//                     <Badge className={cn(statusStyles[bill.status])}>
//                       {bill.status}
//                     </Badge>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center justify-center gap-1">
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Download className="h-4 w-4" />
//                       </Button>
//                       {bill.status === 'pending' && (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="h-8 text-xs"
//                           onClick={() => updateStatus(bill.id, 'paid')}
//                         >
//                           Mark Paid
//                         </Button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default Billing;
