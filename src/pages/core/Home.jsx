// src/pages/core/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/ui/Logo';
import { Text } from '../../components/ui/Typography';

// Nossas peças de Lego em português!
import { CabecalhoHome } from '../../components/features/home/CabecalhoHome';
import { CarrosselDestaques } from '../../components/features/home/CarrosselDestaques';
import { SecaoFiltros } from '../../components/features/home/SecaoFiltros';
import { FiltroGPS } from '../../components/features/home/FiltroGPS';
import { FeedProfissionais } from '../../components/features/home/FeedProfissionais';
import { ModalDetalhesProfissional } from '../../components/features/home/ModalDetalhesProfissional';

export function Home() {
  const navigate = useNavigate();

  // 1. ESTADOS DE DADOS
  const [professionalsData, setProfessionalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [userAvatar, setUserAvatar] = useState(null);

  // 2. ESTADOS DE FILTROS E CONTROLE
  const [filtros, setFiltros] = useState({
    categoria: '',
    notaMinima: 0,
    cidade: '',
    bairro: '',
    ordenacao: 'nota'
  });
  const [raioKm, setRaioKm] = useState('10');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  
  // 3. ESTADOS DE LOCALIZAÇÃO E MODAL
  const [localizacao, setLocalizacao] = useState(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [profSelecionado, setProfSelecionado] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    realizarBusca();
  }, [localizacao, raioKm]);

  async function fetchInitialData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase.from('fr_usuario')
          .select('usua_avatar_url')
          .eq('usua_auth_id', user.id)
          .single();
        if (userData?.usua_avatar_url) setUserAvatar(userData.usua_avatar_url);
      }

      const { data: catData } = await supabase.from('hm_categoria_profissao').select('*').order('capr_nome');
      if (catData) setCategorias(catData);
      
      await realizarBusca();
    } catch (error) {
      console.error("Erro inicial:", error);
    }
  }

  const realizarBusca = async () => {
    setLoading(true);
    try {
      let idsProximos = null;
      let distanciasMap = {};

      if (localizacao) {
        const { data: proximos } = await supabase.rpc('buscar_profissionais_proximos', {
          p_lat: localizacao.lat,
          p_lon: localizacao.lng,
          p_raio_km: parseFloat(raioKm)
        });
        if (proximos) {
          idsProximos = proximos.map(p => p.id);
          proximos.forEach(p => { distanciasMap[p.id] = p.distancia_km; });
        }
      }

      let query = supabase.from('hm_profissional').select(`
        prfl_id, prfl_sobre, prfl_verificado, prfl_whatsapp, prfl_bairro,
        fr_usuario (usua_nome, usua_avatar_url),
        hm_profissao (prfs_nome, prfs_capr_id),
        hm_cidade (cida_nome),
        hm_avaliacao (aval_nota, aval_comentario, fr_usuario (usua_nome, usua_avatar_url))
      `);

      if (idsProximos) query = query.in('prfl_id', idsProximos);

      const { data, error } = await query;
      if (error) throw error;

      const formatted = data.map(prof => {
        const avaliacoes = prof.hm_avaliacao || [];
        const media = avaliacoes.length > 0 
          ? avaliacoes.reduce((acc, curr) => acc + Number(curr.aval_nota), 0) / avaliacoes.length 
          : 0;

        return {
          id: prof.prfl_id,
          name: prof.fr_usuario.usua_nome,
          profession: prof.hm_profissao.prfs_nome,
          profession_id: prof.hm_profissao.prfs_capr_id,
          rating: media,
          distance: distanciasMap[prof.prfl_id] || null,
          city: prof.hm_cidade?.cida_nome || '',
          bairro: prof.prfl_bairro || '',
          whatsapp: prof.prfl_whatsapp,
          avatar: prof.fr_usuario.usua_avatar_url || `https://i.pravatar.cc/150?u=${prof.fr_usuario.usua_nome}`,
          verified: prof.prfl_verificado,
          about: prof.prfl_sobre || 'Nenhuma descrição fornecida.',
          reviews: avaliacoes.map(a => ({
            user: a.fr_usuario.usua_nome,
            avatar: a.fr_usuario.usua_avatar_url || `https://i.pravatar.cc/150?u=${a.fr_usuario.usua_nome}`,
            text: a.aval_comentario,
            nota: Number(a.aval_nota)
          }))
        };
      });

      setProfessionalsData(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) return alert('GPS não suportado.');
    setBuscandoLocal(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizacao({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBuscandoLocal(false);
      },
      () => setBuscandoLocal(false),
      { enableHighAccuracy: true }
    );
  };

  const handleWhatsApp = async (prof) => {
    if (!prof.whatsapp) return alert("WhatsApp não cadastrado.");
    try { await supabase.rpc('registrar_clique_whatsapp', { p_prfl_id: prof.id }); } catch (err) {}
    const msg = encodeURIComponent(`Olá ${prof.name}! Vi seu perfil no Help-Me para o serviço de ${prof.profession}.`);
    window.open(`https://wa.me/55${prof.whatsapp}?text=${msg}`, '_blank');
  };

  const abrirDetalhes = async (prof) => {
    setProfSelecionado(prof);
    setModalAberto(true);
    try { await supabase.rpc('registrar_visualizacao', { p_prfl_id: prof.id }); } catch (error) {}
  };

  const resetarApp = () => {
    setFiltros({ categoria: '', notaMinima: 0, cidade: '', bairro: '', ordenacao: 'nota' });
    setRaioKm('10');
    setLocalizacao(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSair = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const cidadesUnicas = [...new Set(professionalsData.map(p => p.city))].filter(Boolean).sort();
  const bairrosUnicos = [...new Set(
    professionalsData.filter(p => filtros.cidade === '' || p.city === filtros.cidade).map(p => p.bairro)
  )].filter(Boolean).sort();

  const profissionaisFiltrados = professionalsData
    .filter(p => (filtros.categoria ? p.profession_id === Number(filtros.categoria) : true))
    .filter(p => p.rating >= filtros.notaMinima)
    .filter(p => (filtros.cidade ? p.city === filtros.cidade : true))
    .filter(p => (filtros.bairro ? p.bairro === filtros.bairro : true))
    .sort((a, b) => {
      if (filtros.ordenacao === 'nota') return b.rating - a.rating;
      if (filtros.ordenacao === 'distancia' && a.distance !== null) return a.distance - b.distance;
      return 0;
    });

  const destaques = professionalsData.filter(p => p.rating >= 9).sort((a, b) => b.rating - a.rating).slice(0, 10);

  if (loading && professionalsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Logo size="lg" variant="icon" className="animate-pulse mb-4" />
        <Text className="text-orange-500 font-bold">Buscando profissionais...</Text>
      </div>
    );
  }

  // OLHA COMO FICOU LIMPO:
  return (
    <div className="min-h-screen bg-gray-950 pb-6 relative font-sans w-full">
      <CabecalhoHome 
        avatarUsuario={userAvatar} 
        onResetar={resetarApp} 
        onNavegarPerfil={() => navigate('/perfil-cliente')} 
        onSair={handleSair} 
      />

      <main className="max-w-md mx-auto relative z-10">
        <CarrosselDestaques 
          profissionaisDestaque={destaques} 
          onAbrirDetalhes={abrirDetalhes} 
        />

        <div className="pt-4 pb-4 px-4 border-b border-gray-900 bg-gray-950">
          <FiltroGPS 
            localizacao={localizacao} 
            buscandoLocal={buscandoLocal} 
            raioKm={raioKm} 
            onCapturar={capturarLocalizacao} 
            onChangeRaio={setRaioKm} 
          />
          <SecaoFiltros 
            categorias={categorias} 
            cidadesUnicas={cidadesUnicas} 
            bairrosUnicos={bairrosUnicos} 
            filtros={filtros} 
            setFiltros={setFiltros} 
            filtrosAbertos={filtrosAbertos} 
            setFiltrosAbertos={setFiltrosAbertos} 
          />
        </div>

        <FeedProfissionais 
          profissionais={profissionaisFiltrados} 
          onAbrirDetalhes={abrirDetalhes} 
        />
      </main>

      {/* Todo o código gigante do Modal foi substituído por isso: */}
      <ModalDetalhesProfissional 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        profissional={profSelecionado} 
        onWhatsApp={handleWhatsApp} 
      />
    </div>
  );
}