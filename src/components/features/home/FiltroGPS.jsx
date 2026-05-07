// src/components/features/FiltroGPS.jsx
// Responsabilidade: Controlar exclusivamente a captura de localização do usuário 
// e o raio de distância em KM para buscar profissionais próximos.

import { Navigation, CheckCircle } from 'lucide-react';
import { Text } from '../../ui/Typography';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';

export function FiltroGPS({ 
  localizacao, 
  buscandoLocal, 
  raioKm, 
  onCapturar, 
  onChangeRaio 
}) {
  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/30 shadow-inner mb-3">
      <Text className="font-extrabold text-orange-500 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
        <Navigation size={14} /> Buscar perto de mim
      </Text>
      
      {!localizacao ? (
        <Button 
          onClick={onCapturar} 
          disabled={buscandoLocal} 
          variant="secondary" 
          className="w-full text-sm py-3 font-bold bg-gray-900 hover:bg-gray-800 border-gray-800 text-gray-300"
        >
          {buscandoLocal ? 'Localizando...' : '📍 Ativar GPS para filtrar distância'}
        </Button>
      ) : (
        <div className="flex gap-2">
          <Select 
            value={raioKm} 
            onChange={(e) => onChangeRaio(e.target.value)} 
            className="bg-gray-900 flex-1 text-gray-200 border-orange-500/30"
          >
            <option value="5">Até 5km</option>
            <option value="10">Até 10km</option>
            <option value="50">Até 50km</option>
          </Select>
          <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold bg-green-500/10 px-3 rounded-lg border border-green-500/20">
            <CheckCircle size={14} className="fill-current"/> ATIVO
          </div>
        </div>
      )}
    </div>
  );
}