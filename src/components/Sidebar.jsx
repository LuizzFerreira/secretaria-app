import { Home, CalendarDays, CalendarRange, PartyPopper, StickyNote, Plane } from 'lucide-react'
import logoOns from '../logo-ons.png'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'agenda', label: 'Agenda', icon: CalendarRange },
  { id: 'viagens', label: 'Viagens', icon: Plane },
  { id: 'anotacoes', label: 'Anotações', icon: StickyNote },
  { id: 'eventos', label: 'Eventos', icon: PartyPopper },
  { id: 'calendario', label: 'Calendário Comp', icon: CalendarDays },
]

export default function Sidebar({ paginaAtual, onNavegar, topOffset = 0 }) {
  const hoje = new Date()

  return (
    <aside
      className="fixed left-0 bottom-0 w-56 bg-white border-r border-gray-100 flex flex-col z-20"
      style={{ top: topOffset }}
    >
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <img src={logoOns} alt="ONS" className="h-14 w-18" />
          Secretaria
        </h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = paginaAtual === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavegar(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-300 text-center">Secretaria App v1.0</p>
      </div>
    </aside>
  )
}
