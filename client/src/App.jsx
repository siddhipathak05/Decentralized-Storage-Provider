import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { ProviderContextProvider } from './contexts/ProviderContext';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from 'react-hot-toast';
import './App.css'
import './styles/animations.css';


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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          </ProviderContextProvider >
        </AuthProvider>
      </Router>
   </>
  )
}

export default App
