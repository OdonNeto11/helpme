// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Páginas de Autenticação
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Páginas Compartilhadas (Core)
import { Home } from "./pages/core/Home";

// Páginas do Cliente
import { EditarPerfilCliente } from "./pages/cliente/EditarPerfilCliente";

// Páginas do Profissional
import { DashboardProfissional } from "./pages/profissional/DashboardProfissional";
import { EditarPerfilProfissional } from "./pages/profissional/EditarPerfilProfissional";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/home" element={<Home />} />
        
        <Route path="/perfil-cliente" element={<EditarPerfilCliente />} />
        
        <Route path="/dashboard" element={<DashboardProfissional />} />
        <Route path="/perfil" element={<EditarPerfilProfissional />} />
      </Routes>
    </BrowserRouter>
  );
}