// src/components/features/EmptyState.jsx
// Responsabilidade: Exibir uma mensagem amigável quando os filtros do usuário 
// não retornarem nenhum profissional (ex: buscou no GPS e não tinha ninguém num raio de 5km).

import { ShieldCheck } from 'lucide-react';
import { Heading, Text } from '../../ui/Typography';

export function NenhumResultado() {
  return (
    <div className="text-center py-10 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
      <ShieldCheck className="w-12 h-12 text-gray-700 mx-auto mb-3" />
      <Heading level={6} className="text-gray-400">Nenhum profissional encontrado</Heading>
      <Text variant="sm" className="mt-2 text-gray-500">Tente mudar os filtros ou aumentar o raio de busca.</Text>
    </div>
  );
}