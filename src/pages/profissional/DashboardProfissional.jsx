// src/pages/DashboardProfissional.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Eye, Star, MessageSquare, TrendingUp, 
  Bell, LogOut, MapPin, Settings, CheckCircle 
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Heading, Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export function DashboardProfissional() {
  const navigate = useNavigate();

  // Estados de métricas reais (Zera tudo no início)
  const [metricas, setMetricas] = useState({ 
    total_cliques: 0, 
    total_cliques_mes: 0, 
    total_visualizacoes: 0 
  });
  const [loadingMetricas, setLoadingMetricas] = useState(true);
  
  // Estados de Localização
  const [localSalvo, setLocalSalvo] = useState(true); // Evita "piscar" o aviso antes de checar o banco
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erroLocal, setErroLocal] = useState('');

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        // 1. Busca métricas reais (Cliques e Visualizações) via RPC
        const { data: metData, error: metError } = await supabase.rpc('get_metricas_dashboard', { 
          p_usua_auth_id: user.id 
        });

        if (!metError && metData && metData.length > 0) {
          setMetricas(metData[0]);
        }
        setLoadingMetricas(false);

        // 2. Checa se o profissional já tem GPS salvo no banco
        // Buscamos o ID interno do usuário primeiro
        const { data: userData } = await supabase
          .from('fr_usuario')
          .select('usua_id')
          .eq('usua_auth_id', user.id)
          .single();

        if (userData) {
          const { data: profData } = await supabase
            .from('hm_profissional')
            .select('prfl_localizacao')
            .eq('prfl_usua_id', userData.usua_id)
            .maybeSingle();

          // Se a localização for nula, mostramos o aviso de ativação
          if (!profData || !profData.prfl_localizacao) {
            setLocalSalvo(false);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }
    }

    carregarDadosIniciais();
  }, [navigate]);

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      setErroLocal('Seu navegador não suporta geolocalização.');
      return;
    }
    
    setBuscandoLocal(true);
    setErroLocal('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Chama o RPC para salvar o ponto geográfico (PostGIS)
        const { error } = await supabase.rpc('atualizar_localizacao_profissional', {
          p_lat: latitude,
          p_lng: longitude
        });

        if (error) {
          setErroLocal('Erro ao salvar localização no banco.');
        } else {
          setLocalSalvo(true); // Esconde o aviso após sucesso
        }
        setBuscandoLocal(false);
      },
      (error) => {
        setBuscandoLocal(false);
        setErroLocal('Permissão de GPS negada pelo navegador.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      {/* HEADER FIXO */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size="sm" variant="icon" />
            <Heading level={6} className="text-gray-200">Dashboard Profissional</Heading>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/perfil')} 
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-800"
              title="Configurações"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-800"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* BOAS VINDAS */}
        <div className="flex justify-between items-end">
          <div>
            <Heading level={3}>Meu Desempenho</Heading>
            <Text variant="sm" className="text-gray-400">Dados reais de acessos e contatos no seu perfil.</Text>
          </div>
        </div>

        {/* AVISO DE GPS (Opcional - Só aparece se não tiver salvo) */}
        {!localSalvo && (
          <div className="bg-orange-600/10 border border-orange-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in duration-500">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-orange-500/20 rounded-full text-orange-500">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <Text className="text-orange-500 font-bold text-lg mb-1">Localização não configurada!</Text>
                <Text variant="sm" className="text-gray-300">
                  Ative sua localização GPS para que mais clientes da sua região encontrem o seu perfil usando o filtro de distância.
                </Text>
                {erroLocal && <Text variant="xs" className="text-red-400 font-bold mt-2">{erroLocal}</Text>}
              </div>
            </div>
            <Button 
              onClick={capturarLocalizacao} 
              disabled={buscandoLocal} 
              className="w-full md:w-auto px-8 py-4 whitespace-nowrap"
            >
              {buscandoLocal ? 'Salvando...' : 'Ativar Localização'}
            </Button>
          </div>
        )}

        {/* GRIDS DE MÉTRICAS REAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD WHATSAPP */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquare size={80} />
            </div>
            <Text variant="xs" className="text-gray-500 font-bold uppercase tracking-widest mb-3">Cliques no WhatsApp</Text>
            <div className="flex items-end gap-3">
              <Heading level={1} className="leading-none">
                {loadingMetricas ? '...' : metricas.total_cliques}
              </Heading>
              <div className="flex items-center text-xs text-green-500 font-bold mb-1 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +{metricas.total_cliques_mes}
              </div>
            </div>
            <Text variant="xs" className="text-gray-500 mt-2 italic">Contatos totais acumulados</Text>
          </div>

          {/* CARD VISUALIZAÇÕES */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Eye size={80} />
            </div>
            <Text variant="xs" className="text-gray-500 font-bold uppercase tracking-widest mb-3">Visualizações de Perfil</Text>
            <Heading level={1} className="leading-none">
              {loadingMetricas ? '...' : metricas.total_visualizacoes}
            </Heading>
            <Text variant="xs" className="text-gray-500 mt-2 italic">Vezes que abriram seus detalhes</Text>
          </div>

          {/* CARD NOTA */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Star size={80} />
            </div>
            <Text variant="xs" className="text-gray-500 font-bold uppercase tracking-widest mb-3">Sua Avaliação</Text>
            <div className="flex items-center gap-3">
              <Heading level={1} className="leading-none text-yellow-500">5.0</Heading>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            </div>
            <Text variant="xs" className="text-gray-500 mt-2 italic">Baseado nas últimas avaliações</Text>
          </div>

        </div>

        {/* FEEDBACK DO STATUS */}
        {localSalvo && (
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <Text variant="xs" className="text-gray-400 font-medium">
              Seu perfil está visível e sua localização está atualizada nas buscas por proximidade.
            </Text>
          </div>
        )}

      </main>
    </div>
  );
}