// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, MessageCircle, CheckCircle, ShieldCheck, Quote, SlidersHorizontal, ChevronDown, ChevronUp, LogOut, User, Navigation } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Heading, Text } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function Home() {
  const navigate = useNavigate();

  // Estados de Dados
  const [professionalsData, setProfessionalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);

  // Estados de Filtro
  const [categoria, setCategoria] = useState('');
  const [notaMinima, setNotaMinima] = useState(0);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [raioKm, setRaioKm] = useState('10');
  const [ordenacao, setOrdenacao] = useState('nota');
  const [filtrosSecundariosAbertos, setFiltrosSecundariosAbertos] = useState(false);
  
  // Estados de Localização
  const [localizacao, setLocalizacao] = useState(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  
  // Estados de Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [profSelecionado, setProfSelecionado] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
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
        hm_avaliacao (aval_nota, aval_comentario, fr_usuario (usua_nome))
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
          avatar: prof.fr_usuario.usua_avatar_url || `https://ui-avatars.com/api/?name=${prof.fr_usuario.usua_nome}&background=random`,
          verified: prof.prfl_verificado,
          about: prof.prfl_sobre || 'Nenhuma descrição fornecida.',
          reviews: avaliacoes.map(a => ({
            user: a.fr_usuario.usua_nome,
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

  useEffect(() => {
    realizarBusca();
  }, [localizacao, raioKm]);

  // Listas Dinâmicas para Filtros
  const cidadesUnicas = [...new Set(professionalsData.map(p => p.city))].filter(Boolean).sort();
  const bairrosUnicos = [...new Set(
    professionalsData.filter(p => cidade === '' || p.city === cidade).map(p => p.bairro)
  )].filter(Boolean).sort();

  const profissionaisFiltrados = professionalsData
    .filter(p => (categoria ? p.profession_id === Number(categoria) : true))
    .filter(p => p.rating >= notaMinima)
    .filter(p => (cidade ? p.city === cidade : true))
    .filter(p => (bairro ? p.bairro === bairro : true))
    .sort((a, b) => {
      if (ordenacao === 'nota') return b.rating - a.rating;
      if (ordenacao === 'distancia' && a.distance !== null) return a.distance - b.distance;
      return 0;
    });

  const destaques = professionalsData.filter(p => p.rating >= 9).sort((a, b) => b.rating - a.rating).slice(0, 10);

  // Ações
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
    
    try {
      const { error } = await supabase.rpc('registrar_clique_whatsapp', { p_prfl_id: prof.id });
      if (error) {
        console.error("Detalhes do erro Supabase:", error);
      }
    } catch (err) {
      console.error("Erro no código: " + err.message);
    }

    const msg = encodeURIComponent(`Olá ${prof.name}! Vi seu perfil no Help-Me para o serviço de ${prof.profession}.`);
    window.open(`https://wa.me/55${prof.whatsapp}?text=${msg}`, '_blank');
  };

  const abrirDetalhes = async (prof) => {
    setProfSelecionado(prof);
    setModalAberto(true);
    try {
      await supabase.rpc('registrar_visualizacao', { p_prfl_id: prof.id });
    } catch (error) {
      console.error(error);
    }
  };

  const resetarApp = () => {
    setCategoria('');
    setNotaMinima(0);
    setCidade('');
    setBairro('');
    setRaioKm('10');
    setOrdenacao('nota');
    setLocalizacao(null); // Reseta a localização também
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && professionalsData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <Logo size="lg" variant="icon" className="animate-pulse mb-4" />
        <Text className="text-orange-500 font-bold">Buscando profissionais...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-6 relative font-sans w-full">
      {/* 1. HEADER (Fixo no topo) */}
      <header className="w-full bg-gray-900 border-b border-gray-800 sticky top-0 z-50 pt-4 pb-4 shadow-lg shadow-black/50">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetarApp}>
            <Logo size="sm" variant="icon" />
            <div>
              <Heading level={5} className="bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text text-transparent leading-none">
                Help-Me
              </Heading>
              <Text variant="xs" className="text-gray-400 font-medium">Confiabilidade e Segurança</Text>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/perfil-cliente')} className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-800">
              <User className="w-5 h-5" />
            </button>
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-800">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto relative z-10">
        {/* 2. STORIES (DESTAQUES) */}
        <div className="pt-5 pb-4 border-b border-gray-900">
          <div className="flex gap-4 overflow-x-auto px-4 snap-x hide-scrollbar">
            {destaques.map((prof) => (
              <div key={`story-${prof.id}`} onClick={() => abrirDetalhes(prof)} className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer snap-start transition active:scale-95">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-orange-500 via-orange-400 to-yellow-500 shadow-md">
                  <img src={prof.avatar} className="w-16 h-16 rounded-full border-[3px] border-gray-950 object-cover" alt={prof.name} />
                </div>
                <Text variant="xs" className="truncate w-full text-center text-gray-300 font-bold">{prof.name.split(' ')[0]}</Text>
                <div className="flex items-center text-[10px] bg-orange-500/10 text-orange-400 px-1.5 rounded-sm font-bold border border-orange-500/20">
                  <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                  {prof.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. BARRA DE FILTROS (Agora rola com a tela) */}
        <div className="pt-4 pb-4 px-4 border-b border-gray-900 bg-gray-950">
          
          <div className="flex gap-2 mb-3">
            <div className="w-[55%]">
              <Text variant="xs" className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 ml-1">O que precisa?</Text>
              <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="py-3.5 border-gray-800 bg-gray-900 text-gray-200 focus:border-orange-500">
                <option value="">Todas profissões</option>
                {categorias.map(cat => <option key={cat.capr_id} value={cat.capr_id}>{cat.capr_nome}</option>)}
              </Select>
            </div>
            <div className="w-[45%]">
              <Text variant="xs" className="text-yellow-500 font-bold uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Exigir Nota
              </Text>
              <div className="relative">
                <Select 
                  value={notaMinima} 
                  onChange={(e) => setNotaMinima(Number(e.target.value))} 
                  className="py-3.5 pl-10 border-yellow-500/30 bg-yellow-500/10 text-gray-200 font-bold"
                >
                  <option value={0} className="text-gray-900">Qualquer</option>
                  <option value={8} className="text-gray-900">8.0+</option>
                  <option value={9} className="text-gray-900">9.0+</option>
                  <option value={9.5} className="text-gray-900">9.5+</option>
                </Select>
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-yellow-500 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* GPS - AGORA FICA FIXO COMO FILTRO PRINCIPAL */}
          <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/30 shadow-inner mb-3">
            <Text className="font-extrabold text-orange-500 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Navigation size={14} /> Buscar perto de mim
            </Text>
            
            {!localizacao ? (
              <Button 
                onClick={capturarLocalizacao} 
                disabled={buscandoLocal} 
                variant="secondary" 
                className="w-full text-sm py-3 font-bold bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-300"
              >
                {buscandoLocal ? 'Localizando...' : '📍 Ativar GPS para filtrar distância'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Select value={raioKm} onChange={(e) => setRaioKm(e.target.value)} className="bg-gray-900 flex-1 text-gray-200 border-orange-500/30">
                  <option value="5">Até 5km</option>
                  <option value="10">Até 10km</option>
                  <option value="50">Até 50km</option>
                </Select>
                <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold bg-green-500/10 px-3 rounded-lg border border-green-500/20">
                  <CheckCircle size={14} className="fill-current"/> ATIVO
                </div>
              </div>
            )}
          </div>

          <button onClick={() => setFiltrosSecundariosAbertos(!filtrosSecundariosAbertos)} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 font-medium hover:text-gray-200 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Mais filtros (Cidade e Ordem)
            {filtrosSecundariosAbertos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {filtrosSecundariosAbertos && (
            <div className="space-y-3 mt-3 animate-in slide-in-from-top-2 fade-in">
              <div className="flex gap-2">
                <Select value={cidade} onChange={(e) => { setCidade(e.target.value); setBairro(''); }} className="w-1/2 bg-gray-900 text-gray-200 border-gray-800">
                  <option value="">Qualquer cidade</option>
                  {cidadesUnicas.map(cid => <option key={cid} value={cid}>{cid}</option>)}
                </Select>
                <Select value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-1/2 bg-gray-900 text-gray-200 border-gray-800" disabled={!cidade}>
                  <option value="">Qualquer bairro</option>
                  {bairrosUnicos.map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
              </div>

              <Select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="w-full bg-gray-900 text-gray-200 border-gray-800">
                <option value="nota">Ordenar por: Maior Nota</option>
                <option value="distancia">Ordenar por: Mais Perto</option>
              </Select>
            </div>
          )}
        </div>

        {/* 4. FEED DE RESULTADOS */}
        <div className="px-4 mt-6 space-y-6">
          <Text variant="xs" className="text-gray-500 font-medium ml-1">
            Exibindo {profissionaisFiltrados.length} profissionais disponíveis
          </Text>

          {profissionaisFiltrados.map((prof) => (
            <div key={prof.id} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl transition active:scale-[0.98]">
              {prof.verified && (
                <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/10 px-4 py-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Identidade Verificada</span>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex gap-4 items-start mb-4">
                  <img src={prof.avatar} alt={prof.name} className="w-14 h-14 rounded-full border border-gray-800 object-cover" />
                  <div className="flex-1">
                    <Heading level={5} className="leading-tight mb-1">{prof.name}</Heading>
                    
                    {/* NOVO DESTAQUE DA PROFISSÃO (Badge Style) */}
                    <div className="inline-flex items-center bg-orange-500/15 border border-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                      {prof.profession}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {prof.bairro ? `${prof.bairro}, ${prof.city}` : prof.city} {prof.distance !== null && `(${prof.distance} km)`}
                    </div>
                  </div>
                  <div className={cn(
                    "flex flex-col items-center justify-center border rounded-xl p-2 min-w-[60px]",
                    prof.rating >= 9.5 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-gray-800/80 border-gray-700"
                  )}>
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500 mb-0.5" />
                    <span className={cn("font-extrabold text-lg leading-none", prof.rating >= 9.5 ? "text-yellow-500" : "text-white")}>
                      {prof.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <Text variant="sm" className="text-gray-400 line-clamp-2 mb-5">"{prof.about}"</Text>

                <Button variant="secondary" onClick={() => abrirDetalhes(prof)} className="w-full text-sm py-3 font-medium bg-gray-800 hover:bg-gray-700 text-white">
                  Ver perfil completo
                </Button>
              </div>
            </div>
          ))}

          {profissionaisFiltrados.length === 0 && (
            <div className="text-center py-10 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
              <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <Heading level={6} className="text-gray-400">Nenhum profissional encontrado</Heading>
              <Text variant="sm" className="mt-2 text-gray-500">Tente mudar os filtros ou aumentar o raio de busca.</Text>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE DETALHES */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title="Perfil do Profissional">
        {profSelecionado && (
          <div className="pb-4">
            <div className="flex items-center gap-4 mb-6">
              <img src={profSelecionado.avatar} className="w-16 h-16 rounded-full border-2 border-gray-700 object-cover" alt="avatar" />
              <div>
                <Heading level={4}>{profSelecionado.name}</Heading>
                <Text variant="sm" className="text-orange-400 font-bold uppercase text-xs tracking-wider">{profSelecionado.profession}</Text>
                {profSelecionado.verified && (
                  <div className="flex items-center gap-1.5 bg-orange-500/10 w-fit px-2 py-1 rounded-md mt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
                    <Text variant="xs" className="text-orange-500 font-bold">Verificado</Text>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl mb-6 border border-gray-700 shadow-inner">
              <div>
                <Text variant="xs" className="text-gray-400 uppercase tracking-widest font-bold mb-1">Média de Avaliações</Text>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white leading-none">{profSelecionado.rating.toFixed(1)}</span>
                  <span className="text-sm font-bold text-gray-500 mb-1">/ 10</span>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-7 h-7 ${i < Math.round(profSelecionado.rating / 2) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                ))}
              </div>
            </div>

            <div className="mb-6 px-1">
              <Heading level={6} className="mb-2 text-xs text-gray-500 uppercase tracking-wider font-bold">Sobre</Heading>
              <Text variant="sm" className="leading-relaxed text-gray-300">{profSelecionado.about}</Text>
            </div>

            <Heading level={6} className="mb-3 text-xs text-gray-500 uppercase tracking-wider font-bold px-1">Avaliações dos Clientes</Heading>
            <div className="space-y-3 mb-8">
              {profSelecionado.reviews.length > 0 ? profSelecionado.reviews.map((rev, index) => (
                <div key={index} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <Text variant="sm" className="font-bold text-white">{rev.user}</Text>
                    <div className="flex items-center gap-1 bg-gray-950 px-2 py-1 rounded-md border border-gray-700">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-white text-xs font-bold">{rev.nota.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Quote className="w-4 h-4 text-orange-500/40 flex-shrink-0 mt-0.5" />
                    <Text variant="sm" className="italic text-gray-400">{rev.text}</Text>
                  </div>
                </div>
              )) : <Text variant="xs" className="text-gray-500 px-1 italic">Este profissional ainda não recebeu avaliações.</Text>}
            </div>

            <Button onClick={() => handleWhatsApp(profSelecionado)} variant="primary" className="py-4 text-lg w-full shadow-2xl shadow-orange-500/20 gap-2">
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
} 