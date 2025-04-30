import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Login failed. Please try again.");

      // Trigger shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500); // remove shake after animation ends
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div
        className={`bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transition-all ${shake ? "shake" : ""}`}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold py-3 rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
