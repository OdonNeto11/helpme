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
  
  // Novos estados para Categorias e Profissões
  const [categorias, setCategorias] = useState([]);
  const [profissoes, setProfissoes] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [profissaoSelecionada, setProfissaoSelecionada] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  // Busca as categorias e profissões do banco ao abrir a tela
  useEffect(() => {
    async function fetchDominios() {
      const { data: catData } = await supabase.from('hm_categoria_profissao').select('capr_id, capr_nome').order('capr_nome');
      const { data: profData } = await supabase.from('hm_profissao').select('prfs_id, prfs_nome, prfs_capr_id').order('prfs_nome');
      
      if (catData) setCategorias(catData);
      if (profData) setProfissoes(profData);
    }
    fetchDominios();
  }, []);

  // Filtra as profissões baseadas na categoria escolhida
  const profissoesFiltradas = profissoes.filter(p => p.prfs_capr_id === Number(categoriaSelecionada));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // Validação extra para o prestador
    if (perfil === 'PROFISSIONAL' && !profissaoSelecionada) {
      setErro('Você precisa selecionar uma categoria e uma profissão.');
      setLoading(false);
      return;
    }

    // Chamada real de cadastro do Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: nome,
          perfil_escolhido: perfil,
          prfs_id: perfil === 'PROFISSIONAL' ? Number(profissaoSelecionada) : null
        }
      }
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
    } else {
      setSucesso(true);
      setLoading(false);
      setTimeout(() => navigate('/'), 2000);
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
              <Text variant="sm" className="mt-2">Redirecionando para o login...</Text>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                <Input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
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

              {/* Só exibe os campos abaixo se for PROFISSIONAL */}
              {perfil === 'PROFISSIONAL' && (
                <div className="space-y-4 p-4 bg-gray-900/50 border border-gray-700 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-orange-400 mb-2">Categoria do Serviço</label>
                    <Select 
                      value={categoriaSelecionada} 
                      onChange={(e) => {
                        setCategoriaSelecionada(e.target.value);
                        setProfissaoSelecionada(''); // Reseta a profissão ao trocar a categoria
                      }} 
                      disabled={loading}
                      required
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categorias.map(cat => (
                        <option key={cat.capr_id} value={cat.capr_id}>{cat.capr_nome}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-400 mb-2">Sua Profissão</label>
                    <Select 
                      value={profissaoSelecionada} 
                      onChange={(e) => setProfissaoSelecionada(e.target.value)} 
                      disabled={loading || !categoriaSelecionada}
                      required
                    >
                      <option value="">Selecione uma profissão...</option>
                      {profissoesFiltradas.map(prof => (
                        <option key={prof.prfs_id} value={prof.prfs_id}>{prof.prfs_nome}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              )}

              {erro && (
                <Text variant="sm" className="text-red-400 font-bold text-center bg-red-400/10 py-2 rounded-lg">
                  {erro}
                </Text>
              )}

              <Button type="submit" variant="primary" className="mt-2" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Text variant="sm">
              Já tem uma conta?{' '}
              <button onClick={() => navigate('/login')} className="text-orange-500 font-bold hover:underline">
                Faça login
              </button>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}