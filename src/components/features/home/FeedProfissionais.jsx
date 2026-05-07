// src/components/features/home/FeedProfissionais.jsx
import { Text } from '../../ui/Typography';
import { CardProfissional } from './CardProfissional';
import { NenhumResultado } from './NenhumResultado';

export function FeedProfissionais({ profissionais, onAbrirDetalhes }) {
  // Se a lista estiver vazia (nenhum profissional passou nos filtros), mostra o aviso
  if (!profissionais || profissionais.length === 0) {
    return (
      <div className="px-4 mt-6">
        <NenhumResultado />
      </div>
    );
  }

  // Se tiver profissionais, mostra a quantidade e renderiza os cards
  return (
    <div className="px-4 mt-6 space-y-6">
      <Text variant="xs" className="text-gray-500 font-medium ml-1">
        Exibindo {profissionais.length} profissionais disponíveis
      </Text>

      {profissionais.map((prof) => (
        <CardProfissional 
          key={prof.id} 
          prof={prof} 
          onAbrirDetalhes={onAbrirDetalhes} 
        />
      ))}
    </div>
  );
}