import Home from "./Components/home";
import LoginSignUp from "./Components/Login-SignUp";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<LoginSignUp />} />
            <Route path="/Home/:username" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
