'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 🔐 check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'admin') {
      alert('Access denied');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    window.location.href = '/'; // go to dashboard
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-xl space-y-4">

        <h2 className="text-xl font-bold text-center">
          Admin Login
        </h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </div>
    </div>
  );
}