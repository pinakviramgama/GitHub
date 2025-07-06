import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/github-mark-white.svg";
import "./auth.css";

// ✅ MUI components (make sure @mui/material is installed)
import { Box, Button } from "@mui/material";

const Signup = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:3000/signup", {
        email,
        password,
        username,
      });

      const token = res.data.token;
      const userId = res.data.userId;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);

      // Optional chaining in case prop is not passed
      setCurrentUser?.(userId);
      setLoading(false);

      // Navigate to home
      window.location.href = "/";
    } catch (err) {

          if (err.response?.status === 409) {
              alert("User already exists. Please login or try a different username.");
          } else {
            alert("Signup failed. Please try again.");
          }
      console.error(err.message);
      alert("Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-logo-container">
        <img className="logo-login" src={logo} alt="Logo" />
      </div>

      <div className="login-box-wrapper">
        <div className="login-heading">
          <Box sx={{ padding: 1 }}>
            <h1 style={{ fontSize: "24px", margin: 0 }}>Sign Up</h1>
          </Box>
        </div>

        <form className="login-box" onSubmit={handleSignup}>
          <div>
            <label className="label">Username</label>
            <input
              autoComplete="off"
              name="Username"
              id="Username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              autoComplete="off"
              name="Email"
              id="Email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              autoComplete="off"
              name="Password"
              id="Password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            variant="contained"
            className="login-btn"
            type="submit"
            disabled={loading}
            fullWidth
            sx={{ marginTop: 2 }}
          >
            {loading ? "Loading..." : "Signup"}
          </Button>
        </form>

        <div className="pass-box" style={{ marginTop: "1rem" }}>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
