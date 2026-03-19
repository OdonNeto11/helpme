// src/pages/EditarPerfilCliente.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/ui/Logo';
import { Heading, Text } from '../components/ui/Typography';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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

      const { data } = await supabase.from('fr_usuario')
        .select('usua_nome, usua_email')
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

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ tipo: '', msg: '' });

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('fr_usuario')
      .update({ usua_nome: nome })
      .eq('usua_auth_id', user.id);

    if (error) {
      setStatus({ tipo: 'erro', msg: 'Erro ao atualizar perfil.' });
    } else {
      setStatus({ tipo: 'sucesso', msg: 'Perfil atualizado!' });
      setTimeout(() => navigate('/home'), 1500);
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Text>Carregando...</Text></div>;

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/home')} className="p-2 text-gray-400 hover:text-white transition"><ArrowLeft /></button>
          <Heading level={6}>Meu Perfil</Heading>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-8 space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-orange-500/50 mb-4">
            <User size={48} className="text-gray-600" />
          </div>
          <Text variant="sm" className="text-gray-400">Cliente Help-Me</Text>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          {status.msg && (
            <div className={`p-3 rounded-lg text-center text-sm font-bold ${status.tipo === 'sucesso' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {status.msg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome Completo</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} required disabled={saving} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">E-mail (Não alterável)</label>
            <div className="relative">
              <Input value={email} disabled className="opacity-50 cursor-not-allowed pr-10" />
              <ShieldCheck className="w-5 h-5 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-4" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </main>
    </div>
  );
}