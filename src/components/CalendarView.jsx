import { Cake, PartyPopper } from 'lucide-react'
import { parseDate, formatarData } from '../data/utils'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getAniversariantesDoDia(pessoas, dia, mes) {
  return pessoas.filter(p => {
    const { day, month } = parseDate(p.dataAniversario)
    return day === dia && month === mes
  })
}

function WeekView({ pessoas }) {
  const hoje = new Date()
  const dayOfWeek = hoje.getDay()
  const start = new Date(hoje)
  start.setDate(hoje.getDate() - dayOfWeek)

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {dias.map((d, i) => {
        const isHoje = d.toDateString() === hoje.toDateString()
        const aniversariantes = getAniversariantesDoDia(pessoas, d.getDate(), d.getMonth() + 1)
        return (
          <div
            key={i}
            className={`rounded-xl border p-3 min-h-[120px] transition-all ${
              isHoje
                ? 'border-blue-400 bg-blue-50/80 shadow-md shadow-blue-100'
                : 'border-gray-100 bg-white/60'
            }`}
          >
            <div className="text-center mb-2">
              <p className={`text-xs font-medium ${isHoje ? 'text-blue-600' : 'text-gray-400'}`}>
                {DIAS_SEMANA[i]}
              </p>
              <p className={`text-lg font-bold ${isHoje ? 'text-blue-700' : 'text-gray-700'}`}>
                {d.getDate()}
              </p>
            </div>
            <div className="space-y-1.5">
              {aniversariantes.map((p, j) => (
                <div key={j} className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  <Cake size={12} className="text-amber-500 shrink-0" />
                  <span className="text-xs font-medium text-gray-700 truncate">{p.nome}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MonthView({ pessoas }) {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()

  const celulas = []
  for (let i = 0; i < primeiroDia; i++) celulas.push(null)
  for (let d = 1; d <= totalDias; d++) celulas.push(d)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={i} />
          const isHoje = dia === hoje.getDate()
          const aniversariantes = getAniversariantesDoDia(pessoas, dia, mes + 1)
          const tem = aniversariantes.length > 0
          return (
            <div
              key={i}
              className={`rounded-lg border p-1.5 min-h-[80px] transition-all ${
                isHoje
                  ? 'border-blue-400 bg-blue-50/80 shadow-sm shadow-blue-100'
                  : tem
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-50 bg-white/40'
              }`}
            >
              <p className={`text-xs font-bold mb-1 ${
                isHoje ? 'text-blue-700' : tem ? 'text-amber-700' : 'text-gray-400'
              }`}>
                {dia}
              </p>
              <div className="space-y-1">
                {aniversariantes.slice(0, 2).map((p, j) => (
                  <div key={j} className="flex items-center gap-1 bg-amber-100/80 rounded px-1 py-0.5">
                    <Cake size={10} className="text-amber-500 shrink-0" />
                    <span className="text-[10px] font-medium text-gray-700 truncate">{p.nome}</span>
                  </div>
                ))}
                {aniversariantes.length > 2 && (
                  <p className="text-[10px] text-amber-600 font-medium px-1">+{aniversariantes.length - 2} mais</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarView({ pessoas, filtro }) {
  if (filtro === 'hoje') {
    const hoje = new Date()
    const aniversariantes = getAniversariantesDoDia(pessoas, hoje.getDate(), hoje.getMonth() + 1)
    return (
      <div className="flex flex-col items-center py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center mb-4">
          <p className="text-sm text-blue-500 font-medium">{DIAS_SEMANA[hoje.getDay()]}</p>
          <p className="text-4xl font-bold text-blue-700">{hoje.getDate()}</p>
          <p className="text-sm text-blue-400">
            {hoje.toLocaleDateString('pt-BR', { month: 'long' })}
          </p>
        </div>
        {aniversariantes.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            <PartyPopper size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum aniversariante hoje</p>
          </div>
        ) : (
          <div className="space-y-2 w-full max-w-sm">
            {aniversariantes.map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl px-4 py-3">
                <Cake size={18} className="text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{p.nome} 🎉</p>
                  <p className="text-xs text-gray-500">{p.funcao}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (filtro === 'semana') return <WeekView pessoas={pessoas} />
  return <MonthView pessoas={pessoas} />
}
