import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/github-mark-white.svg";
import "./login.css";
// import { Box, Button } from "@mui/material"; // Uncomment if using MUI components
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://github-3-667e.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("token", data.token);

        navigate("/profile");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="github-login-wrapper">
      <div className="github-login-box">
        <img src={logo} alt="GitHub Logo" className="github-logo" />

        <h1 className="github-login-title">Sign in to GitHub</h1>

        <form onSubmit={handleLogin} className="github-login-form">
          <label htmlFor="email" className="github-label">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="github-input"
          />

          <label htmlFor="password" className="github-label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="github-input"
          />

          <button type="submit" disabled={loading} className="github-button">
            {loading ? "Logging in..." : "Sign in"}
          </button>
        </form>

        <p className="github-footer-text">
          New to GitHub? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
