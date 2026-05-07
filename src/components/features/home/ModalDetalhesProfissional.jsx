// src/components/features/home/ModalDetalhesProfissional.jsx
// Responsabilidade: Gerenciar a exibição completa dos detalhes de um profissional.
// Este arquivo foi isolado para facilitar melhorias futuras (galeria, comentários, etc).

import { CheckCircle, Star, Quote, MessageCircle } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Heading, Text } from '../../ui/Typography';
import { Button } from '../../ui/Button';

export function ModalDetalhesProfissional({ isOpen, onClose, profissional, onWhatsApp }) {
  // Se não houver profissional selecionado, não renderiza nada
  if (!profissional) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil do Profissional">
      <div className="pb-4">
        
        {/* Topo do Perfil: Foto e Nome */}
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={profissional.avatar} 
            className="w-16 h-16 rounded-full border-2 border-gray-700 object-cover" 
            alt={profissional.name} 
          />
          <div>
            <Heading level={4}>{profissional.name}</Heading>
            <Text variant="sm" className="text-orange-400 font-bold uppercase text-xs tracking-wider">
              {profissional.profession}
            </Text>
            {profissional.verified && (
              <div className="flex items-center gap-1.5 bg-orange-500/10 w-fit px-2 py-1 rounded-md mt-1">
                <CheckCircle className="w-3.5 h-3.5 text-orange-500" />
                <Text variant="xs" className="text-orange-500 font-bold">Verificado</Text>
              </div>
            )}
          </div>
        </div>

        {/* Resumo de Notas */}
        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-2xl mb-6 border border-gray-700 shadow-inner">
          <div>
            <Text variant="xs" className="text-gray-400 uppercase tracking-widest font-bold mb-1">Média de Avaliações</Text>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-extrabold text-white leading-none">{profissional.rating.toFixed(1)}</span>
              <span className="text-sm font-bold text-gray-500 mb-1">/ 10</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-7 h-7 ${i < Math.round(profissional.rating / 2) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} 
              />
            ))}
          </div>
        </div>

        {/* Biografia / Sobre */}
        <div className="mb-6 px-1">
          <Heading level={6} className="mb-2 text-xs text-gray-500 uppercase tracking-wider font-bold">Sobre</Heading>
          <Text variant="sm" className="leading-relaxed text-gray-300">{profissional.about}</Text>
        </div>

        {/* Seção de Comentários/Avaliações */}
        <Heading level={6} className="mb-3 text-xs text-gray-500 uppercase tracking-wider font-bold px-1">Avaliações dos Clientes</Heading>
        <div className="space-y-3 mb-8">
          {profissional.reviews.length > 0 ? profissional.reviews.map((rev, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <img src={rev.avatar} alt={rev.user} className="w-6 h-6 rounded-full object-cover border border-gray-600" />
                  <Text variant="sm" className="font-bold text-white">{rev.user}</Text>
                </div>
                <div className="flex items-center gap-1 bg-gray-950 px-2 py-1 rounded-md border border-gray-700">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-white text-xs font-bold">{rev.nota.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Quote className="w-4 h-4 text-orange-500/40 flex-shrink-0 mt-0.5" />
                <Text variant="sm" className="italic text-gray-400">{rev.text}</Text>
              </div>
            </div>
          )) : (
            <Text variant="xs" className="text-gray-500 px-1 italic">Este profissional ainda não recebeu avaliações.</Text>
          )}
        </div>

        {/* Botão de Contato (WhatsApp) */}
        <Button 
          onClick={() => onWhatsApp(profissional)} 
          variant="primary" 
          className="py-4 text-lg w-full shadow-2xl shadow-orange-500/20 gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Chamar no WhatsApp
        </Button>
      </div>
    </Modal>
  );
}