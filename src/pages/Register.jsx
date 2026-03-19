// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Text, Heading } from '../components/ui/Typography';
import { Select } from '../components/ui/Select';

export function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState('CLIENTE');
  
  const [categorias, setCategorias] = useState([]);
  const [profissoes, setProfissoes] = useState([]);
  const [cidades, setCidades] = useState([]);
  
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [profissaoSelecionada, setProfissaoSelecionada] = useState('');
  const [cidadeSelecionada, setCidadeSelecionada] = useState('');
  const [bairro, setBairro] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDominios() {
      const { data: catData } = await supabase.from('hm_categoria_profissao').select('capr_id, capr_nome').order('capr_nome');
      const { data: profData } = await supabase.from('hm_profissao').select('prfs_id, prfs_nome, prfs_capr_id').order('prfs_nome');
      const { data: cidData } = await supabase.from('hm_cidade').select('cida_id, cida_nome').order('cida_nome');
      
      if (catData) setCategorias(catData);
      if (profData) setProfissoes(profData);
      if (cidData) setCidades(cidData);
    }
    fetchDominios();
  }, []);

  const profissoesFiltradas = profissoes.filter(p => p.prfs_capr_id === Number(categoriaSelecionada));

  const handleWhatsappChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 11) value = value.slice(0, 11); 
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 10) value = `${value.slice(0, 10)}-${value.slice(10)}`;
    setWhatsapp(value);
  };

// Função inteligente para traduzir os erros do Supabase
  const traduzirErro = (mensagemOriginal) => {
    if (!mensagemOriginal) return 'Erro desconhecido. Tente novamente.';
    
    // Converte para minúsculo para garantir que vai encontrar a palavra
    const msg = mensagemOriginal.toLowerCase();

    if (msg.includes('already registered')) {
      return 'Este e-mail já está em uso. Clique em "Faça login" abaixo.';
    }
    if (msg.includes('at least 6 characters')) {
      return 'Sua senha é muito curta. Digite pelo menos 6 caracteres.';
    }
    if (msg.includes('invalid email')) {
      return 'Por favor, digite um endereço de e-mail válido.';
    }
    if (msg.includes('database error')) {
      return 'Tivemos um problema técnico ao criar sua conta. Tente novamente em instantes.';
    }
    if (msg.includes('invalid login')) {
      return 'E-mail ou senha incorretos.';
    }
    if (msg.includes('rate limit')) {
      return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.';
    }

    // Fallback genérico melhorado
    return 'Verifique seus dados e tente novamente.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (perfil === 'PROFISSIONAL' && !profissaoSelecionada) {
      setErro('Você precisa selecionar uma categoria e uma profissão.');
      setLoading(false);
      return;
    }

    const whatsappLimpo = whatsapp.replace(/\D/g, '');

    // Monta o objeto de metadados de forma limpa, só enviando o que foi preenchido
    const metadata = {
      full_name: nome,
      perfil_escolhido: perfil,
    };

    if (perfil === 'PROFISSIONAL') {
      metadata.prfs_id = Number(profissaoSelecionada);
      if (cidadeSelecionada) metadata.cida_id = Number(cidadeSelecionada);
      if (bairro) metadata.bairro = bairro;
      if (whatsappLimpo) metadata.whatsapp = whatsappLimpo;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: metadata }
    });

    if (error) {
      setErro(traduzirErro(error.message));
      setLoading(false);
    } else {
      setSucesso(true);
      setLoading(false);
      setTimeout(() => {
        if (perfil === 'PROFISSIONAL') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/50">
          <div className="flex flex-col items-center mb-6">
            <Logo size="md" />
            <Heading level={4} className="mt-4">Criar Conta</Heading>
            <Text variant="sm" className="mt-1 text-center">Junte-se ao Help-Me</Text>
          </div>

          {sucesso ? (
            <div className="bg-green-500/10 border border-green-500 p-4 rounded-xl text-center">
              <Text className="text-green-500 font-bold">Cadastro realizado com sucesso!</Text>
              <Text variant="sm" className="mt-2">Entrando na sua conta...</Text>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                <Input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" required disabled={loading} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required disabled={loading} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required disabled={loading} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">O que você deseja fazer?</label>
                <Select value={perfil} onChange={(e) => {
                  setPerfil(e.target.value);
                  setCategoriaSelecionada('');
                  setProfissaoSelecionada('');
                }} disabled={loading}>
                  <option value="CLIENTE">Quero contratar serviços</option>
                  <option value="PROFISSIONAL">Quero prestar serviços</option>
                </Select>
              </div>

              {perfil === 'PROFISSIONAL' && (
                <div className="space-y-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-orange-400 mb-2">Categoria do Serviço *</label>
                    <Select value={categoriaSelecionada} onChange={(e) => {
                        setCategoriaSelecionada(e.target.value);
                        setProfissaoSelecionada('');
                      }} disabled={loading} required>
                      <option value="">Selecione uma categoria...</option>
                      {categorias.map(cat => <option key={cat.capr_id} value={cat.capr_id}>{cat.capr_nome}</option>)}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-400 mb-2">Sua Profissão *</label>
                    <Select value={profissaoSelecionada} onChange={(e) => setProfissaoSelecionada(e.target.value)} disabled={loading || !categoriaSelecionada} required>
                      <option value="">Selecione uma profissão...</option>
                      {profissoesFiltradas.map(prof => <option key={prof.prfs_id} value={prof.prfs_id}>{prof.prfs_nome}</option>)}
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                      <Select value={cidadeSelecionada} onChange={(e) => setCidadeSelecionada(e.target.value)} disabled={loading}>
                        <option value="">Selecione...</option>
                        {cidades.map(cid => <option key={cid.cida_id} value={cid.cida_id}>{cid.cida_nome}</option>)}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bairro</label>
                      <Input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Opcional" disabled={loading} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp</label>
                    <Input type="tel" value={whatsapp} onChange={handleWhatsappChange} placeholder="(67) 99999-9999" disabled={loading} />
                  </div>
                </div>
              )}

              {erro && <Text variant="sm" className="text-red-400 font-bold text-center bg-red-400/10 py-2 rounded-lg">{erro}</Text>}

              <Button type="submit" variant="primary" className="mt-2" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Text variant="sm">
              Já tem uma conta? <button onClick={() => navigate('/login')} className="text-orange-500 font-bold hover:underline">Faça login</button>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}