// src/pages/EditarPerfilCliente.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, ShieldCheck, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Logo } from '../../components/ui/Logo';
import { Heading, Text } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function EditarPerfilCliente() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ tipo: '', msg: '' });

  useEffect(() => {
    async function carregarDados() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // Adicionamos o usua_avatar_url na busca para o futuro, caso precise
      const { data } = await supabase.from('fr_usuario')
        .select('usua_nome, usua_email, usua_avatar_url')
        .eq('usua_auth_id', user.id)
        .single();

      if (data) {
        setNome(data.usua_nome || '');
        setEmail(data.usua_email || '');
      }
      setLoading(false);
    }
    carregarDados();
  }, [navigate]);

  // Gera a URL da foto baseada no e-mail único do usuário
  const avatarGerado = email ? `https://i.pravatar.cc/150?u=${email}` : '';

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ tipo: '', msg: '' });

    const { data: { user } } = await supabase.auth.getUser();

    // Agora enviamos o nome e a URL da foto (avatarGerado) para o banco!
    const { error } = await supabase.from('fr_usuario')
      .update({ 
        usua_nome: nome,
        usua_avatar_url: avatarGerado 
      })
      .eq('usua_auth_id', user.id);

    if (error) {
      setStatus({ tipo: 'erro', msg: 'Erro ao atualizar perfil.' });
    } else {
      setStatus({ tipo: 'sucesso', msg: 'Perfil atualizado com sucesso!' });
      setTimeout(() => navigate('/home'), 1500);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Text className="text-orange-500 animate-pulse font-bold">Carregando...</Text></div>;

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 text-gray-400 hover:text-white transition bg-gray-800/50 rounded-full"><ArrowLeft size={20} /></button>
          <Heading level={6}>Meu Perfil</Heading>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8 space-y-6 pb-12">
        <div className="flex flex-col items-center mb-8">
          
          {/* FOTO DO PERFIL GERADA PELA API */}
          <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center border-[3px] border-orange-500/80 mb-3 overflow-hidden shadow-xl shadow-orange-500/10">
            {avatarGerado ? (
              <img src={avatarGerado} alt="Avatar do Cliente" className="w-full h-full object-cover" />
            ) : (
              <User size={48} className="text-gray-600" />
            )}
          </div>
          <Text variant="sm" className="text-gray-300 font-bold tracking-wide">Cliente Help-Me</Text>
          
          <div className="flex items-center gap-1.5 mt-3 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 max-w-[280px]">
            <Info size={14} className="shrink-0" />
            <Text variant="xs" className="leading-tight text-center">
              Sua foto de perfil é gerada automaticamente com base no seu e-mail para manter o anonimato seguro.
            </Text>
          </div>
        </div>

        <form onSubmit={handleSalvar} className="space-y-5 bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg">
          {status.msg && (
            <div className={`p-4 rounded-xl text-center text-sm font-bold border ${status.tipo === 'sucesso' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {status.msg}
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nome Completo</label>
            <Input 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              required 
              disabled={saving} 
              className="bg-gray-950 border-gray-800 focus:border-orange-500 h-12"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-2 ml-1">E-mail de Acesso</label>
            <div className="relative">
              <Input 
                value={email} 
                disabled 
                className="bg-gray-950/50 border-gray-800 text-gray-500 cursor-not-allowed pr-10 h-12" 
              />
              <ShieldCheck className="w-5 h-5 text-gray-600 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <Text variant="xs" className="text-gray-600 mt-1.5 ml-1">O e-mail não pode ser alterado por motivos de segurança.</Text>
          </div>

          <Button type="submit" variant="primary" className="w-full py-4 text-base font-bold shadow-xl shadow-orange-500/20 mt-4" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </form>
      </main>
    </div>
  );
}