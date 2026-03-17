// src/pages/Home.jsx
import { useState } from 'react';
import { Star, MapPin, MessageCircle, CheckCircle, ShieldCheck, Quote, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { professionals } from '../data/professionals';
import { Heading, Text } from '../components/ui/Typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { cn } from '../lib/utils';

export function Home() {
  const [categoria, setCategoria] = useState('');
  const [notaMinima, setNotaMinima] = useState(0);
  const [cidade, setCidade] = useState('');
  const [ordenacao, setOrdenacao] = useState('nota');
  const [filtrosSecundariosAbertos, setFiltrosSecundariosAbertos] = useState(false);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [profSelecionado, setProfSelecionado] = useState(null);

  const categoriasUnicas = [...new Set(professionals.map(p => p.profession))].sort();
  const cidadesUnicas = [...new Set(professionals.map(p => p.city))].sort();

  const destaques = professionals.filter(p => p.rating >= 9.5).sort((a, b) => b.rating - a.rating).slice(0, 8);

  const profissionaisFiltrados = professionals
    .filter(p => (categoria ? p.profession === categoria : true))
    .filter(p => p.rating >= notaMinima)
    .filter(p => (cidade ? p.city === cidade : true))
    .sort((a, b) => {
      if (ordenacao === 'nota') return b.rating - a.rating;
      if (ordenacao === 'distancia') return a.distance - b.distance;
      return 0;
    });

  const abrirDetalhes = (prof) => {
    setProfSelecionado(prof);
    setModalAberto(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-6 relative font-sans w-full">
      
      {/* 1. APP BAR */}
      <header className="w-full bg-gray-900 border-b border-gray-800 sticky top-0 z-50 pt-4 pb-4 shadow-lg shadow-black/50">
        <div className="max-w-md mx-auto px-4 flex items-center gap-3">
          <Logo size="sm" variant="icon" />
          <div>
            <Heading level={5} className="bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Help-Me
            </Heading>
            <Text variant="xs" className="text-gray-200 font-medium">
              Confiabilidade e Segurança
            </Text>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto relative z-10">
        
        {/* 2. STORIES */}
        <div className="pt-5 pb-2">
          <div className="flex gap-4 overflow-x-auto px-4 snap-x hide-scrollbar">
            {destaques.map((prof) => (
              <div key={`story-${prof.id}`} onClick={() => abrirDetalhes(prof)} className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer snap-start transition active:scale-95">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-orange-500 via-orange-400 to-yellow-500">
                  <img src={prof.avatar} className="w-16 h-16 rounded-full border-[3px] border-gray-900 object-cover" alt={prof.name} />
                </div>
                <Text variant="xs" className="truncate w-full text-center text-gray-300 font-bold">{prof.name.split(' ')[0]}</Text>
                <div className="flex items-center text-[10px] bg-orange-500/10 text-orange-400 px-1.5 rounded-sm font-bold">
                  <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                  {prof.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. BARRA DE FILTROS */}
        <div className="sticky top-[72px] z-40 bg-gray-950/95 backdrop-blur-xl pt-4 pb-4 px-4 border-b border-gray-800 shadow-xl shadow-black/40">
          
          <div className="flex gap-2 mb-3">
            <div className="w-[55%]">
              <Text variant="xs" className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 ml-1">O que precisa?</Text>
              <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="py-3.5 border-gray-700 bg-gray-900 shadow-inner">
                <option value="">Todas profissões</option>
                {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
            </div>
            
            <div className="w-[45%]">
              <Text variant="xs" className="text-yellow-500 font-bold uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Exigir Nota
              </Text>
              <div className="relative">
                <Select value={notaMinima} onChange={(e) => setNotaMinima(Number(e.target.value))} className="py-3.5 pl-10 border-yellow-500/30 bg-yellow-500/10 text-yellow-500 font-bold focus:ring-yellow-500">
                  <option value={0}>Qualquer</option>
                  <option value={8}>8.0 ou mais</option>
                  <option value={9}>9.0 ou mais</option>
                  <option value={9.5}>9.5 ou mais</option>
                  <option value={10}>Apenas 10</option>
                </Select>
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-yellow-500 text-yellow-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => setFiltrosSecundariosAbertos(!filtrosSecundariosAbertos)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 font-medium hover:text-white transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {filtrosSecundariosAbertos ? 'Ocultar filtros extras' : 'Mais filtros (Local e Ordem)'}
            {filtrosSecundariosAbertos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {filtrosSecundariosAbertos && (
            <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2 fade-in">
              <Select value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-1/2 bg-gray-900">
                <option value="">Qualquer cidade</option>
                {cidadesUnicas.map(cid => <option key={cid} value={cid}>{cid}</option>)}
              </Select>
              <Select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="w-1/2 bg-gray-900">
                <option value="nota">Maior Nota</option>
                <option value="distancia">Mais Perto</option>
              </Select>
            </div>
          )}
        </div>

        {/* 4. FEED DE RESULTADOS */}
        <div className="px-4 mt-6 space-y-5">
          <Text variant="xs" className="text-gray-500 font-medium ml-1">
            Exibindo {profissionaisFiltrados.length} profissionais rigorosamente avaliados
          </Text>

          {profissionaisFiltrados.map((prof) => (
            <div key={prof.id} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
              
              {prof.verified && (
                <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/10 px-4 py-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Identidade Verificada • Ambiente Seguro</span>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex gap-4 items-start mb-4">
                  <img src={prof.avatar} alt={prof.name} className="w-14 h-14 rounded-full border border-gray-700 object-cover" />
                  
                  <div className="flex-1">
                    <Heading level={5} className="leading-tight">{prof.name}</Heading>
                    <Text variant="sm" className="text-gray-400 font-medium">{prof.profession}</Text>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {prof.city} ({prof.distance} km)
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
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5">/ 10</span>
                  </div>
                </div>

                <Text variant="sm" className="text-gray-400 line-clamp-2 mb-5">
                  "{prof.about}"
                </Text>

                <Button variant="secondary" onClick={() => abrirDetalhes(prof)} className="w-full text-sm py-3">
                  Ver perfil e avaliações completas
                </Button>
              </div>
            </div>
          ))}

          {profissionaisFiltrados.length === 0 && (
            <div className="text-center py-10">
              <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <Heading level={6} className="text-gray-400">Nenhum profissional encontrado</Heading>
              <Text variant="sm" className="mt-2">Reduza as exigências de nota ou limpe os filtros para ver mais resultados.</Text>
            </div>
          )}
        </div>
      </main>

      {/* MODAL MANTIDO */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title="Perfil Seguro do Profissional">
        {profSelecionado && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img src={profSelecionado.avatar} className="w-16 h-16 rounded-full border-2 border-gray-700" alt="avatar" />
              <div>
                <Heading level={4}>{profSelecionado.name}</Heading>
                <Text variant="sm" className="text-orange-400 font-bold uppercase text-xs tracking-wider mb-1">{profSelecionado.profession}</Text>
                {profSelecionado.verified && (
                  <div className="flex items-center gap-1.5 bg-orange-500/10 w-fit px-2 py-1 rounded-md">
                    <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
                    <Text variant="xs" className="text-orange-500 font-bold">Antecedentes Checados</Text>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl mb-6 border border-gray-700">
              <div>
                <Text variant="xs" className="text-gray-400 uppercase tracking-widest font-bold mb-1">Nota de Confiabilidade</Text>
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

            <div className="mb-6">
              <Heading level={6} className="mb-2 text-sm text-gray-400 uppercase tracking-wider">Sobre o trabalho</Heading>
              <Text variant="sm" className="leading-relaxed text-gray-300">
                {profSelecionado.about}
              </Text>
            </div>

            <Heading level={6} className="mb-3 text-sm text-gray-400 uppercase tracking-wider">Avaliações Verificadas</Heading>
            <div className="space-y-3 mb-6">
              {profSelecionado.reviews.map((rev, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <Text variant="sm" className="font-bold text-white">{rev.user}</Text>
                    <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-md">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-white text-xs font-bold">{rev.nota.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Quote className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <Text variant="sm" className="italic text-gray-400">{rev.text}</Text>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" className="py-4 text-lg w-full sticky bottom-0 z-20 shadow-2xl shadow-orange-500/20">
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}