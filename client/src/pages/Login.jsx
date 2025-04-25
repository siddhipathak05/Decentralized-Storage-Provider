import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
