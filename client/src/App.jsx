import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ProviderContextProvider } from './contexts/ProviderContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import './App.css'

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <ProviderContextProvider >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Routes>
          </ProviderContextProvider >
        </AuthProvider>
      </Router>
   </>
  )
}

export default App
