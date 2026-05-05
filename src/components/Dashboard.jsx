import { useState, useMemo } from 'react'
import { CalendarDays, Users, PartyPopper, CalendarRange, List, LayoutGrid, Search, Copy, Download, Check, X } from 'lucide-react'
import BirthdayCard from './BirthdayCard'
import CalendarView from './CalendarView'
import { filtrarAniversariantes, parseDate, getGerenciasUnicas, copiarNomes, gerarTextoExportacao } from '../data/utils'

const FILTROS = [
  { id: 'hoje', label: 'Hoje', icon: PartyPopper },
  { id: 'semana', label: 'Esta Semana', icon: CalendarRange },
  { id: 'mes', label: 'Este Mês', icon: CalendarDays },
]

export default function Dashboard({ pessoas, busca, setBusca, gerenciaSelecionada, setGerenciaSelecionada }) {
  const [filtro, setFiltro] = useState('hoje')
  const [view, setView] = useState('lista')
  const [copiado, setCopiado] = useState(false)

  const hoje = new Date()
  const gerencias = useMemo(() => getGerenciasUnicas(pessoas), [pessoas])

  const pessoasFiltradas = useMemo(() => {
    let lista = pessoas
    if (gerenciaSelecionada) {
      lista = lista.filter(p => p.funcao === gerenciaSelecionada)
    }
    if (busca.trim()) {
      const termo = busca.toLowerCase()
      lista = lista.filter(p => p.nome.toLowerCase().includes(termo))
    }
    return lista
  }, [pessoas, gerenciaSelecionada, busca])

  const contagens = useMemo(() => ({
    hoje: filtrarAniversariantes(pessoasFiltradas, 'hoje').length,
    semana: filtrarAniversariantes(pessoasFiltradas, 'semana').length,
    mes: filtrarAniversariantes(pessoasFiltradas, 'mes').length,
  }), [pessoasFiltradas])

  const filtrados = useMemo(
    () => filtrarAniversariantes(pessoasFiltradas, filtro).sort((a, b) => {
      const da = parseDate(a.dataAniversario)
      const db = parseDate(b.dataAniversario)
      return (da.month * 100 + da.day) - (db.month * 100 + db.day)
    }),
    [pessoasFiltradas, filtro]
  )

  const isToday = (p) => {
    const { day, month } = parseDate(p.dataAniversario)
    return day === hoje.getDate() && month === hoje.getMonth() + 1
  }

  const handleCopiarNomes = async () => {
    await navigator.clipboard.writeText(copiarNomes(filtrados))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleExportar = () => {
    const label = FILTROS.find(f => f.id === filtro)?.label
    const texto = gerarTextoExportacao(filtrados, label)
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aniversariantes-${filtro}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const temFiltrosAtivos = busca || gerenciaSelecionada

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FILTROS.map(f => {
          const Icon = f.icon
          const isActive = filtro === f.id
          return (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-gray-700 border border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-500' : 'bg-blue-50'}`}>
                <Icon size={24} className={isActive ? 'text-white' : 'text-blue-600'} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                  {contagens[f.id]}
                </p>
                <p className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                  {f.label}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Conteúdo */}
      <div className="bg-white/60 backdrop-blur rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users size={20} />
            Aniversariantes — {FILTROS.find(f => f.id === filtro)?.label}
            {gerenciaSelecionada && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {gerenciaSelecionada}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">{filtrados.length} pessoa(s)</span>

            {filtrados.length > 0 && (
              <>
                <button
                  onClick={handleCopiarNomes}
                  title="Copiar nomes"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    copiado
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  {copiado ? <Check size={12} /> : <Copy size={12} />}
                  {copiado ? 'Copiado!' : 'Copiar nomes'}
                </button>
                <button
                  onClick={handleExportar}
                  title="Exportar lista"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer"
                >
                  <Download size={12} />
                  Exportar
                </button>
              </>
            )}

            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('lista')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  view === 'lista'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={14} />
                Lista
              </button>
              <button
                onClick={() => setView('calendario')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  view === 'calendario'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid size={14} />
                Calendário
              </button>
            </div>
          </div>
        </div>

        {view === 'lista' ? (
          filtrados.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <PartyPopper size={48} className="mx-auto mb-3 opacity-30" />
              <p>
                {temFiltrosAtivos
                  ? 'Nenhum aniversariante encontrado com esses filtros'
                  : `Nenhum aniversariante ${filtro === 'hoje' ? 'hoje' : filtro === 'semana' ? 'esta semana' : 'este mês'}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtrados.map((p, i) => (
                <BirthdayCard key={i} pessoa={p} isToday={isToday(p)} />
              ))}
            </div>
          )
        ) : (
          <CalendarView pessoas={pessoasFiltradas} filtro={filtro} />
        )}
      </div>
    </div>
  )
}
