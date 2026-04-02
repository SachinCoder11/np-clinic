'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const [loading, setLoading] = useState(true);

  const [clinic, setClinic] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    reminders: true,
    billing: true,
    followup: true,
  });

  const [id, setId] = useState<string | null>(null);

  // 🔥 FETCH
  const fetchSettings = async () => {
    setLoading(true);

    const { data } = await supabase.from('settings').select('*').limit(1);

    if (data && data.length > 0) {
      const s = data[0];

      setId(s.id);

      setClinic({
        name: s.name,
        email: s.email,
        phone: s.phone,
        address: s.address,
        website: s.website,
      });

      setNotifications({
        email: s.email_notifications,
        sms: s.sms_notifications,
        reminders: s.appointment_reminders,
        billing: s.billing_alerts,
        followup: s.followup_reminders,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 💾 SAVE
  const saveSettings = async () => {
    const payload = {
      ...clinic,
      email_notifications: notifications.email,
      sms_notifications: notifications.sms,
      appointment_reminders: notifications.reminders,
      billing_alerts: notifications.billing,
      followup_reminders: notifications.followup,
    };

    if (id) {
      await supabase.from('settings').update(payload).eq('id', id);
    } else {
      const { data } = await supabase.from('settings').insert(payload).select().single();
      setId(data.id);
    }

    alert('Settings saved successfully');
  };

  // 📥 EXPORT DATA
  const exportData = async () => {
    const { data } = await supabase.from('appointments').select('*');

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clinic-data.json';
    a.click();
  };

  if (loading) {
    return (
      <MainLayout title="Settings" subtitle="Loading...">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Settings" subtitle="Live Clinic Settings">

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Clinic Info</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <Input
            value={clinic.name}
            onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
            placeholder="Clinic Name"
          />

          <Input
            value={clinic.email}
            onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
            placeholder="Email"
          />

          <Input
            value={clinic.phone}
            onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
            placeholder="Phone"
          />

          <Input
            value={clinic.website}
            onChange={(e) => setClinic({ ...clinic, website: e.target.value })}
            placeholder="Website"
          />

          <Input
            value={clinic.address}
            onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
            placeholder="Address"
          />

          <Button onClick={saveSettings}>Save Changes</Button>

        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex justify-between">
            <span>Email</span>
            <Switch
              checked={notifications.email}
              onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
            />
          </div>

          <div className="flex justify-between">
            <span>SMS</span>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(v) => setNotifications({ ...notifications, sms: v })}
            />
          </div>

          <div className="flex justify-between">
            <span>Reminders</span>
            <Switch
              checked={notifications.reminders}
              onCheckedChange={(v) => setNotifications({ ...notifications, reminders: v })}
            />
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>

        <CardContent className="flex justify-between">
          <Button onClick={exportData}>Export Data</Button>
          <Button variant="outline">Backup (Coming Soon)</Button>
        </CardContent>
      </Card>

    </MainLayout>
  );
}