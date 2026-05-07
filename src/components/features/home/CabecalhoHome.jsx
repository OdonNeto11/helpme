// src/components/features/HomeHeader.jsx
// Responsabilidade: Renderizar o cabeçalho superior fixo da Home, contendo a logo, 
// o botão de recarregar a página, a foto do usuário e a opção de sair (logout).

import { LogOut, User } from 'lucide-react';
import { Logo } from '../../ui/Logo';
import { Heading, Text } from '../../ui/Typography';

export function CabecalhoHome({ userAvatar, onReset, onNavigateProfile, onLogout }) {
  return (
    <header className="w-full bg-gray-900 border-b border-gray-800 sticky top-0 z-50 pt-4 pb-4 shadow-lg shadow-black/50">
      <div className="max-w-md mx-auto px-4 flex items-center justify-between gap-3">
        
        {/* Logo e Nome (Clica para resetar filtros) */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <Logo size="sm" variant="icon" />
          <div>
            <Heading level={5} className="bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text text-transparent leading-none">
              Help-Me
            </Heading>
            <Text variant="xs" className="text-gray-400 font-medium">Confiabilidade e Segurança</Text>
          </div>
        </div>
        
        {/* Botões de Perfil e Logout */}
        <div className="flex items-center gap-1">
          <button onClick={onNavigateProfile} className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-full hover:bg-gray-800 flex items-center justify-center w-9 h-9 overflow-hidden">
            {userAvatar ? (
              <img src={userAvatar} alt="Meu Perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>
          <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-800">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}