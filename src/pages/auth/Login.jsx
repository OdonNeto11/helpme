// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/ui/Logo';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Text } from '../../components/ui/Typography';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    // Chamada real de autenticação do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErro('E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      // Lê o perfil escolhido de dentro dos metadados do usuário logado
      const perfil = data.user?.user_metadata?.perfil_escolhido;

      // Direciona para a tela correta com base no perfil
      if (perfil === 'PROFISSIONAL') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/50">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <Text variant="sm" className="mt-2 text-center">Entre para encontrar profissionais perto de você</Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {erro && (
              <Text variant="sm" className="text-red-400 font-bold text-center bg-red-400/10 py-2 rounded-lg">
                {erro}
              </Text>
            )}

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Text variant="sm">
              Não tem uma conta?{' '}
              <button 
                type="button" 
                onClick={() => navigate('/register')} 
                className="text-orange-500 font-bold hover:underline"
              >
                Cadastre-se
              </button>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}