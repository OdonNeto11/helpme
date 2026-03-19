// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { DashboardProfissional } from "./pages/DashboardProfissional"; // Importação nova
import { EditarPerfil } from './pages/EditarPerfil';
import { EditarPerfilCliente } from './pages/EditarPerfilCliente';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<DashboardProfissional />} /> {/* Rota nova */}
        <Route path="/perfil" element={<EditarPerfil />} />
        <Route path="/perfil-cliente" element={<EditarPerfilCliente />} />
      </Routes>
    </BrowserRouter>
  );
}