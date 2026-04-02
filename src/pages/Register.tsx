import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    // 🧠 Validation
    if (!email || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 🔐 Step 1: Signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const user = data?.user;

      if (!user) {
        alert("Check your email (confirmation may be enabled)");
        setLoading(false);
        return;
      }

      // 🧩 Step 2: Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: "Admin",
          role: "admin",
        });

      if (profileError) throw profileError;

      alert("Admin registered successfully!");

      // 🚀 Redirect
      navigate("/login");

    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white border rounded-xl shadow space-y-4">

        <h2 className="text-2xl font-bold text-center">
          Admin Register
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

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-2 rounded"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </button>

      </div>
    </div>
  );
} 