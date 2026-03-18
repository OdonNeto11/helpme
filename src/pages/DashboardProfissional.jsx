// src/pages/DashboardProfissional.jsx
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Star, MessageSquare, TrendingUp, Bell, LogOut } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Heading, Text } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';

export function DashboardProfissional() {
  const navigate = useNavigate();

  // Dados simulados para a interface inicial
  const metricas = {
    contatos: 12,
    visualizacoes: 48,
    nota: 9.8
  };

  const ultimosContatos = [
    { id: 1, cliente: "Marcos Silva", servico: "Orçamento de Pintura", data: "Hoje, 14:30", status: "Novo" },
    { id: 2, cliente: "Ana Souza", servico: "Dúvida sobre valores", data: "Ontem, 09:15", status: "Respondido" },
    { id: 3, cliente: "Roberto Alves", servico: "Agendamento de visita", data: "15/03/2026", status: "Fechado" },
  ];

  // Função para encerrar a sessão
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      {/* APP BAR - Painel Administrativo */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="icon" />
            <Heading level={6} className="text-gray-200">Painel do Profissional</Heading>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-white transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-800"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <Heading level={4} className="mb-1">Olá, Profissional</Heading>
          <Text variant="sm" className="text-gray-400">Aqui está o resumo do seu desempenho nesta semana.</Text>
        </div>

        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <Text variant="xs" className="text-gray-400 font-bold uppercase tracking-wider">Contatos Recebidos</Text>
              <div className="flex items-end gap-2">
                <Heading level={3}>{metricas.contatos}</Heading>
                <span className="flex items-center text-xs text-green-500 font-bold mb-1"><TrendingUp className="w-3 h-3 mr-1" /> +3</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <Text variant="xs" className="text-gray-400 font-bold uppercase tracking-wider">Visualizações do Perfil</Text>
              <Heading level={3}>{metricas.visualizacoes}</Heading>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <Text variant="xs" className="text-gray-400 font-bold uppercase tracking-wider">Sua Nota Atual</Text>
              <Heading level={3}>{metricas.nota}</Heading>
            </div>
          </div>
        </div>

        {/* LISTA DE CONTATOS RECENTES */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <Heading level={6}>Últimas Solicitações</Heading>
            <Button variant="secondary" className="py-1.5 px-3 text-xs">Ver todas</Button>
          </div>
          
          <div className="divide-y divide-gray-800">
            {ultimosContatos.map((contato) => (
              <div key={contato.id} className="p-5 hover:bg-gray-800/50 transition flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold">
                    {contato.cliente.charAt(0)}
                  </div>
                  <div>
                    <Text className="font-bold text-gray-200">{contato.cliente}</Text>
                    <Text variant="xs" className="text-gray-500">{contato.servico} • {contato.data}</Text>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                  contato.status === 'Novo' ? 'bg-orange-500/10 text-orange-500' : 
                  contato.status === 'Respondido' ? 'bg-blue-500/10 text-blue-400' : 
                  'bg-gray-800 text-gray-400'
                }`}>
                  {contato.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}