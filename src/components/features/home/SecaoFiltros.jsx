// src/components/features/SecaoFiltros.jsx
// Responsabilidade: Agrupar os campos de selecionar categoria, nota, cidade, bairro e ordenação.

import { ShieldCheck, SlidersHorizontal, ChevronUp, ChevronDown, Star } from 'lucide-react';
import { Text } from '../../ui/Typography';
import { Select } from '../../ui/Select';

export function SecaoFiltros({
  categorias, cidadesUnicas, bairrosUnicos,
  filtros, setFiltros,
  filtrosAbertos, setFiltrosAbertos
}) {
  return (
    <>
      <div className="flex gap-2 mb-3">
        <div className="w-[55%]">
          <Text variant="xs" className="text-gray-400 font-bold uppercase tracking-wider mb-1.5 ml-1">O que precisa?</Text>
          <Select value={filtros.categoria} onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })} className="py-3.5 border-gray-800 bg-gray-900 text-gray-200 focus:border-orange-500">
            <option value="">Todas profissões</option>
            {categorias.map(cat => <option key={cat.capr_id} value={cat.capr_id}>{cat.capr_nome}</option>)}
          </Select>
        </div>
        <div className="w-[45%]">
          <Text variant="xs" className="text-yellow-500 font-bold uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Exigir Nota
          </Text>
          <div className="relative">
            <Select value={filtros.notaMinima} onChange={(e) => setFiltros({ ...filtros, notaMinima: Number(e.target.value) })} className="py-3.5 pl-10 border-yellow-500/30 bg-yellow-500/10 text-gray-200 font-bold">
              <option value={0} className="text-gray-900">Qualquer</option>
              <option value={8} className="text-gray-900">8.0+</option>
              <option value={9} className="text-gray-900">9.0+</option>
              <option value={9.5} className="text-gray-900">9.5+</option>
            </Select>
            <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 fill-yellow-500 text-yellow-500" />
          </div>
        </div>
      </div>

      <button onClick={() => setFiltrosAbertos(!filtrosAbertos)} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 font-medium hover:text-gray-200 transition-colors">
        <SlidersHorizontal className="w-4 h-4" /> Mais filtros (Cidade e Ordem)
        {filtrosAbertos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {filtrosAbertos && (
        <div className="space-y-3 mt-3 animate-in slide-in-from-top-2 fade-in">
          <div className="flex gap-2">
            <Select value={filtros.cidade} onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value, bairro: '' })} className="w-1/2 bg-gray-900 text-gray-200 border-gray-800">
              <option value="">Qualquer cidade</option>
              {cidadesUnicas.map(cid => <option key={cid} value={cid}>{cid}</option>)}
            </Select>
            <Select value={filtros.bairro} onChange={(e) => setFiltros({ ...filtros, bairro: e.target.value })} className="w-1/2 bg-gray-900 text-gray-200 border-gray-800" disabled={!filtros.cidade}>
              <option value="">Qualquer bairro</option>
              {bairrosUnicos.map(b => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
          <Select value={filtros.ordenacao} onChange={(e) => setFiltros({ ...filtros, ordenacao: e.target.value })} className="w-full bg-gray-900 text-gray-200 border-gray-800">
            <option value="nota">Ordenar por: Maior Nota</option>
            <option value="distancia">Ordenar por: Mais Perto</option>
          </Select>
        </div>
      )}
    </>
  );
}