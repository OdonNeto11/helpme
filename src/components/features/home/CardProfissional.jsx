// src/components/features/ProfessionalCard.jsx
// Responsabilidade: Exibir o card individual de um profissional no feed de resultados,
// contendo a foto, nome, profissão, nota e o botão para ver mais detalhes.

import { ShieldCheck, MapPin, Star } from 'lucide-react';
import { Heading, Text } from '../../ui/Typography';
import { Button } from '../../ui/Button';
import { cn } from '../../../lib/utils';

export function CardProfissional({ prof, onAbrirDetalhes }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl transition active:scale-[0.98]">
      {prof.verified && (
        <div className="bg-gradient-to-r from-orange-500/10 to-transparent border-b border-orange-500/10 px-4 py-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Identidade Verificada</span>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex gap-4 items-start mb-4">
<img 
  src={prof.avatar} 
  alt={prof.name} 
  loading="lazy" 
  decoding="async"
  className="w-14 h-14 rounded-full border border-gray-800 object-cover" 
/>
          <div className="flex-1">
            <Heading level={5} className="leading-tight mb-1">{prof.name}</Heading>
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
        <Button variant="secondary" onClick={() => onAbrirDetalhes(prof)} className="w-full text-sm py-3 font-medium bg-gray-800 hover:bg-gray-700 text-white">
          Ver perfil completo
        </Button>
      </div>
    </div>
  );
}