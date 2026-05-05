import { useState, useRef, useEffect } from 'react'
import { FileSpreadsheet, ChevronDown, Trash2, X } from 'lucide-react'

export default function PlanilhasInfo({ planilhas, onRemover, label }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fechar = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [])

  if (planilhas.length === 0) return null

  const total = planilhas.reduce((acc, p) => acc + (p.dados?.length || 0), 0)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all cursor-pointer"
      >
        <FileSpreadsheet size={11} />
        {planilhas.length} {label} • {total} reg.
        <ChevronDown size={11} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600">Planilhas carregadas</p>
            <button onClick={() => setAberto(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={14} />
            </button>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {planilhas.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-700 truncate">{p.nome}</p>
                  <p className="text-[10px] text-gray-400">
                    {p.dados?.length || 0} registros • {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => { if (confirm(`Remover "${p.nome}"?`)) onRemover(p.id) }}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
