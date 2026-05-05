import { useState, useRef, useEffect } from 'react'
import { Bell, Cake, X } from 'lucide-react'
import { formatarData } from '../data/utils'

export default function NotificationBell({ aniversariantes }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)
  const total = aniversariantes.length

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (total === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-xl hover:bg-amber-50 transition-all cursor-pointer"
      >
        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
          {total}
        </div>
        <div className={aberto ? '' : 'animate-bounce'}>
          <Bell size={20} className="text-amber-500" />
        </div>
      </button>

      {aberto && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <p className="text-sm font-semibold text-amber-800">
              🎉 Aniversariantes de Hoje
            </p>
            <button onClick={() => setAberto(false)} className="text-amber-400 hover:text-amber-600 cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {aniversariantes.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Cake size={16} className="text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.nome}</p>
                  <p className="text-xs text-gray-400">{p.funcao} • {formatarData(p.dataAniversario)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center">
              {total} pessoa{total > 1 ? 's' : ''} fazendo aniversário hoje
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
