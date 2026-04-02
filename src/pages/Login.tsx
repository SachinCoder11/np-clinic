import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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

    if (!data?.user) {
      alert("Login failed. No user returned.");
      setLoading(false);
      return;
    }

    // 🧠 Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      alert("Error fetching profile");
      setLoading(false);
      return;
    }

    if (!profile) {
      alert("No profile found");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (profile.role !== "admin") {
      alert("Access denied");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // 🚀 success
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 border rounded-xl bg-white shadow space-y-4">

        <h2 className="text-2xl font-bold text-center">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* 🔗 REGISTER LINK */}
        <p className="text-sm text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}