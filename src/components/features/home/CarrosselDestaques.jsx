// src/components/features/CarrosselDestaques.jsx
import { Star } from 'lucide-react';
import { Text } from '../../ui/Typography';

// Aqui nós "recebemos" as variáveis que a Home está mandando para nós
export function CarrosselDestaques({ profissionaisDestaque, onAbrirDetalhes }) {
  
  // Se não tiver ninguém com nota alta, ele esconde os stories
  if (!profissionaisDestaque || profissionaisDestaque.length === 0) return null;

  return (
    <div className="pt-5 pb-4 border-b border-gray-900">
      <div className="flex gap-4 overflow-x-auto px-4 snap-x hide-scrollbar">
        {profissionaisDestaque.map((prof) => (
          <div key={`destaque-${prof.id}`} onClick={() => onAbrirDetalhes(prof)} className="flex flex-col items-center gap-1.5 min-w-[72px] cursor-pointer snap-start transition active:scale-95">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-orange-500 via-orange-400 to-yellow-500 shadow-md">
              <img src={prof.avatar} className="w-16 h-16 rounded-full border-[3px] border-gray-950 object-cover" alt={prof.name} />
            </div>
            <Text variant="xs" className="truncate w-full text-center text-gray-300 font-bold">
              {prof.name.split(' ')[0]}
            </Text>
            <div className="flex items-center text-[10px] bg-orange-500/10 text-orange-400 px-1.5 rounded-sm font-bold border border-orange-500/20">
              <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
              {prof.rating.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}