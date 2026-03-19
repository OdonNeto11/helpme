// src/pages/EditarPerfil.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, MapPin, Briefcase, Navigation, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/ui/Logo';
import { Heading, Text } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

export function EditarPerfil() {
  const navigate = useNavigate();

  // Estados de Domínio (Listas)
  const [categorias, setCategorias] = useState([]);
  const [profissoes, setProfissoes] = useState([]);
  const [cidades, setCidades] = useState([]);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [profissaoSelecionada, setProfissaoSelecionada] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [bairro, setBairro] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sobre, setSobre] = useState('');

  // Estados de Geolocalização
  const [temLocalSalvo, setTemLocalSalvo] = useState(false);
  const [novaLocalizacao, setNovaLocalizacao] = useState(null);
  const [buscandoLocal, setBuscandoLocal] = useState(false);
  const [erroLocal, setErroLocal] = useState('');

  // Estados de Controle
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [ids, setIds] = useState({ usua_id: null, prfl_id: null });

  const handleWhatsappChange = (valor) => {
    let v = valor.replace(/\D/g, ''); 
    if (v.length > 11) v = v.slice(0, 11); 
    if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`;
    setWhatsapp(v);
  };

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resCat, resProf, resCid] = await Promise.all([
          supabase.from('hm_categoria_profissao').select('*').order('capr_nome'),
          supabase.from('hm_profissao').select('*').order('prfs_nome'),
          supabase.from('hm_cidade').select('*').order('cida_nome')
        ]);
        
        if (resCat.data) setCategorias(resCat.data);
        if (resProf.data) setProfissoes(resProf.data);
        if (resCid.data) setCidades(resCid.data);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        const { data: userData } = await supabase.from('fr_usuario')
          .select('usua_id, usua_nome')
          .eq('usua_auth_id', user.id)
          .single();

        if (userData) {
          setNome(userData.usua_nome || '');
          
          const { data: profData } = await supabase.from('hm_profissional')
            .select(`
              prfl_id, prfl_prfs_id, prfl_cida_id, prfl_bairro, prfl_whatsapp, prfl_sobre, prfl_localizacao,
              hm_profissao (prfs_capr_id)
            `)
            .eq('prfl_usua_id', userData.usua_id)
            .single();

          if (profData) {
            setIds({ usua_id: userData.usua_id, prfl_id: profData.prfl_id });
            if (profData.hm_profissao?.prfs_capr_id) setCategoriaSelecionada(profData.hm_profissao.prfs_capr_id.toString());
            if (profData.prfl_prfs_id) setProfissaoSelecionada(profData.prfl_prfs_id.toString());
            if (profData.prfl_cida_id) setCidadeSelecionada(profData.prfl_cida_id.toString());
            if (profData.prfl_bairro) setBairro(profData.prfl_bairro);
            if (profData.prfl_sobre) setSobre(profData.prfl_sobre);
            if (profData.prfl_whatsapp) handleWhatsappChange(profData.prfl_whatsapp);
            if (profData.prfl_localizacao) setTemLocalSalvo(true);
          }
        }
      } catch (error) {
        setMensagem({ tipo: 'erro', texto: 'Falha ao carregar seus dados.' });
      } finally {
        setLoadingInitial(false);
      }
    }
    carregarDados();
  }, [navigate]);

  const profissoesFiltradas = profissoes.filter(p => p.prfs_capr_id === Number(categoriaSelecionada));

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      setErroLocal('Seu navegador não suporta geolocalização.');
      return;
    }
    
    setBuscandoLocal(true);
    setErroLocal('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNovaLocalizacao({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setBuscandoLocal(false);
      },
      (error) => {
        setBuscandoLocal(false);
        setErroLocal('Você precisa permitir o acesso à localização no navegador.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensagem({ tipo: '', texto: '' });

    if (!profissaoSelecionada) {
      setMensagem({ tipo: 'erro', texto: 'A profissão é obrigatória.' });
      setSaving(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const whatsappLimpo = whatsapp.replace(/\D/g, '');

      // 1. Atualiza Nome
      const { error: errorUser } = await supabase.from('fr_usuario')
        .update({ usua_nome: nome })
        .eq('usua_auth_id', user.id);
      
      if (errorUser) throw errorUser;

      // 2. Atualiza Dados Normais do Profissional
      const { error: errorProf } = await supabase.from('hm_profissional')
        .update({
          prfl_prfs_id: Number(profissaoSelecionada),
          prfl_cida_id: cidadeSelecionada ? Number(cidadeSelecionada) : null,
          prfl_bairro: bairro || null,
          prfl_whatsapp: whatsappLimpo || null,
          prfl_sobre: sobre || null
        })
        .eq('prfl_id', ids.prfl_id);

      if (errorProf) throw errorProf;

      // 3. Atualiza GPS (Se ele clicou no botão para atualizar)
      if (novaLocalizacao) {
        const { error: errorGps } = await supabase.rpc('atualizar_localizacao_profissional', {
          p_lat: novaLocalizacao.lat,
          p_lng: novaLocalizacao.lng
        });
        if (errorGps) throw errorGps;
      }

      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (error) {
      console.error(error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar os dados. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Text className="text-gray-400">Carregando seus dados...</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-sans pb-10">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="icon" />
            <Heading level={6} className="text-gray-200">Editar Perfil</Heading>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        <form onSubmit={handleSalvar} className="space-y-6">
          
          {mensagem.texto && (
            <div className={`p-4 rounded-xl border font-bold text-center text-sm ${
              mensagem.tipo === 'sucesso' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              {mensagem.texto}
            </div>
          )}

          {/* DADOS PESSOAIS */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
              <User className="w-5 h-5 text-orange-500" />
              <Heading level={6}>Dados Pessoais</Heading>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
              <Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome exibido aos clientes" required disabled={saving} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sobre mim (Biografia)</label>
              <textarea 
                value={sobre} 
                onChange={(e) => setSobre(e.target.value)} 
                placeholder="Fale um pouco sobre sua experiência, diferenciais e como você trabalha..."
                rows={4}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                disabled={saving}
              />
              <Text variant="xs" className="text-gray-500 mt-1">Este texto aparecerá no seu perfil para os clientes.</Text>
            </div>
          </div>

          {/* DADOS PROFISSIONAIS */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <Heading level={6}>Atuação Profissional</Heading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categoria *</label>
                <Select value={categoriaSelecionada} onChange={(e) => {
                  setCategoriaSelecionada(e.target.value);
                  setProfissaoSelecionada('');
                }} disabled={saving} required>
                  <option value="">Selecione...</option>
                  {categorias.map(cat => <option key={cat.capr_id} value={cat.capr_id}>{cat.capr_nome}</option>)}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profissão Principal *</label>
                <Select value={profissaoSelecionada} onChange={(e) => setProfissaoSelecionada(e.target.value)} disabled={saving || !categoriaSelecionada} required>
                  <option value="">Selecione...</option>
                  {profissoesFiltradas.map(prof => <option key={prof.prfs_id} value={prof.prfs_id}>{prof.prfs_nome}</option>)}
                </Select>
              </div>
            </div>
          </div>

          {/* LOCALIZAÇÃO E CONTATO */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
              <MapPin className="w-5 h-5 text-green-500" />
              <Heading level={6}>Localização e Contato</Heading>
            </div>

            {/* BOX DE GPS */}
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 mb-2">
              <Text className="font-bold text-gray-200 mb-1 flex items-center gap-2 text-sm">
                <Navigation className="w-4 h-4 text-orange-500" /> Coordenadas GPS
              </Text>
              <Text variant="xs" className="text-gray-400 mb-3">
                {temLocalSalvo 
                  ? 'Sua localização já está registrada no banco de dados. Clique abaixo se você se mudou e precisa atualizar.' 
                  : 'Você ainda não definiu sua localização exata para aparecer no mapa de buscas dos clientes.'}
              </Text>

              {novaLocalizacao ? (
                <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg border border-green-500/20 font-bold text-sm">
                  <CheckCircle className="w-5 h-5" /> Localização capturada! (Será salva ao enviar o formulário)
                </div>
              ) : (
                <Button type="button" onClick={capturarLocalizacao} disabled={buscandoLocal || saving} variant="secondary" className="w-full text-sm py-2">
                  {buscandoLocal ? 'Buscando GPS...' : '📍 Capturar minha localização atual'}
                </Button>
              )}
              {erroLocal && <Text variant="xs" className="text-red-400 mt-2">{erroLocal}</Text>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                <Select value={cidadeSelecionada} onChange={(e) => setCidadeSelecionada(e.target.value)} disabled={saving}>
                  <option value="">Nenhuma / Outra</option>
                  {cidades.map(cid => <option key={cid.cida_id} value={cid.cida_id}>{cid.cida_nome}</option>)}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bairro</label>
                <Input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Centro" disabled={saving} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
              <Input type="tel" value={whatsapp} onChange={(e) => handleWhatsappChange(e.target.value)} placeholder="(XX) XXXXX-XXXX" disabled={saving} />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full flex justify-center items-center gap-2 py-4 text-base" disabled={saving}>
            <Save className="w-5 h-5" />
            {saving ? 'Salvando alterações...' : 'Salvar Perfil'}
          </Button>

        </form>
      </main>
    </div>
  );
}