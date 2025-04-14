import React, { useState } from "react";
import "./Login-SignUp.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginSignUp() {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    setIsLoginActive(false);
  };

  const handleLoginClick = () => {
    setIsLoginActive(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://192.168.1.34:3001/signup", {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
      });

      if (response.status === 200) {
        setErrorMessage("");
        alert(`Registration Successful. Please Login now!`);
        setRegisterUsername("");
        setRegisterEmail("");
        setRegisterPassword("");
        setIsLoginActive(true);
      }
    } catch (error) {
      alert("Registration Failed!")
      setErrorMessage(error.response?.data?.message || "Registration failed");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://192.168.1.34:3001/login", {
        username: loginUsername,
        password: loginPassword,
      });

      if (response.status === 200) {
        navigate(`/Home/${loginUsername}`);
      } else {
      }
    } catch (error) {
      alert("Login Failed!");
      setErrorMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={`container ${isLoginActive ? "" : "active"}`}>
      <div className="form-box login">
        <form action="#">
          <h1>Login</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              name="loginUsername"
              required
              onChange={(e) => setLoginUsername(e.target.value)}
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              name="loginPassword"
              required
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <i className="bx bxs-lock-alt"></i>
          </div>
          <div className="forgot-link">
            <a href="#">Forgot Password?</a>
          </div>
          <button type="submit" className="btn" onClick={handleLoginSubmit}>
            Login
          </button>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <a href="#">
              <i className="bx bxl-google"></i>
            </a>
            <a href="#">
              <i className="bx bxl-facebook"></i>
            </a>
            <a href="#">
              <i className="bx bxl-github"></i>
            </a>
            <a href="#">
              <i className="bx bxl-linkedin"></i>
            </a>
          </div>
        </form>
      </div>

      <div className="form-box register">
        <form action="#">
          <h1>Registration</h1>
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              name="registerUsername"
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
            />
            <i className="bx bxs-user"></i>
          </div>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              name="registerEmail"
              required
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <i className="bx bxs-envelope"></i>
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              name="registerPassword"
              required
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <i className="bx bxs-lock-alt"></i>
          </div>
          <button type="submit" className="btn" onClick={handleRegisterSubmit}>
            Register
          </button>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <a href="#">
              <i className="bx bxl-google"></i>
            </a>
            <a href="#">
              <i className="bx bxl-facebook"></i>
            </a>
            <a href="#">
              <i className="bx bxl-github"></i>
            </a>
            <a href="#">
              <i className="bx bxl-linkedin"></i>
            </a>
          </div>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="btn register-btn" onClick={handleRegisterClick}>
            Register
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="btn login-btn" onClick={handleLoginClick}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginSignUp;
