import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Cake, Plane, PartyPopper, Clock, MapPin } from 'lucide-react'
import { useDatabase } from '../hooks/useDatabase'
import { parseDate } from '../data/utils'

const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const CORES_TIPO = {
  aniversario: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-400' },
  evento: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-400' },
  viagem: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-400' },
}

function getDiasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1)
  const ultimoDia = new Date(ano, mes + 1, 0).getDate()
  const inicioSemana = primeiro.getDay()

  const dias = []
  // Dias do mês anterior
  const diasMesAnterior = new Date(ano, mes, 0).getDate()
  for (let i = inicioSemana - 1; i >= 0; i--) {
    dias.push({ dia: diasMesAnterior - i, mesAtual: false })
  }
  // Dias do mês atual
  for (let d = 1; d <= ultimoDia; d++) {
    dias.push({ dia: d, mesAtual: true })
  }
  // Dias do próximo mês
  const restante = 42 - dias.length
  for (let i = 1; i <= restante; i++) {
    dias.push({ dia: i, mesAtual: false })
  }
  return dias
}

function EventoPill({ item }) {
  const cor = CORES_TIPO[item.tipo]
  const Icon = item.tipo === 'aniversario' ? Cake : item.tipo === 'viagem' ? Plane : PartyPopper

  return (
    <div className={`flex items-center gap-1 ${cor.bg} ${cor.text} rounded px-1.5 py-0.5 text-[10px] font-medium truncate border ${cor.border}`}>
      <Icon size={10} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </div>
  )
}

function DetalhesDia({ data, itens, onFechar, onItemClick }) {
  if (!itens.length) return null

  const dataFormatada = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onFechar}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-800 capitalize">{dataFormatada}</p>
          <p className="text-xs text-gray-400">{itens.length} item(ns)</p>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto max-h-[50vh]">
          {itens.map((item, i) => {
            const cor = CORES_TIPO[item.tipo]
            const Icon = item.tipo === 'aniversario' ? Cake : item.tipo === 'viagem' ? Plane : PartyPopper
            const clicavel = item.tipo === 'viagem' || item.tipo === 'evento'
            return (
              <div
                key={i}
                onClick={() => clicavel && onItemClick(item)}
                className={`flex items-start gap-3 ${cor.bg} border ${cor.border} rounded-xl p-3 transition-all ${
                  clicavel ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${cor.dot} flex items-center justify-center shrink-0`}>
                  <Icon size={14} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${cor.text}`}>{item.label}</p>
                  {item.detalhe && <p className="text-xs text-gray-500 mt-0.5">{item.detalhe}</p>}
                  {item.horario && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={10} /> {item.horario}h
                    </p>
                  )}
                  {item.local && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} /> {item.local}
                    </p>
                  )}
                </div>
                {clicavel && (
                  <ChevronRight size={14} className="text-gray-300 shrink-0 mt-1" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function AgendaPage({ pessoas, onNavegar }) {
  const { items: eventos } = useDatabase('eventos')
  const { items: viagens } = useDatabase('viagens')

  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [diaSelecionado, setDiaSelecionado] = useState(null)
  const [filtros, setFiltros] = useState({ aniversario: true, evento: true, viagem: true })

  const toggleFiltro = (tipo) => setFiltros(prev => ({ ...prev, [tipo]: !prev[tipo] }))

  const navegar = (dir) => {
    let novoMes = mes + dir
    let novoAno = ano
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    setMes(novoMes)
    setAno(novoAno)
  }

  const itensPorDia = useMemo(() => {
    const mapa = {}
    const add = (key, item) => {
      if (!mapa[key]) mapa[key] = []
      mapa[key].push(item)
    }

    if (filtros.aniversario) pessoas.forEach(p => {
      if (!p.dataAniversario) return
      const { day, month } = parseDate(p.dataAniversario)
      const key = `${ano}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      add(key, {
        tipo: 'aniversario',
        label: `🎂 ${p.nome.split(' ')[0]}`,
        detalhe: p.funcao || '',
      })
    })

    if (filtros.evento) eventos.forEach(e => {
      if (e.data) {
        add(e.data, {
          tipo: 'evento',
          id: e.id,
          label: e.titulo,
          detalhe: e.descricao || '',
          horario: e.horario,
          local: e.local,
        })
      }
    })

    if (filtros.viagem) viagens.forEach(v => {
      if (v.dataIda) {
        add(v.dataIda, {
          tipo: 'viagem',
          id: v.id,
          label: `✈️ ${v.viajante.split(' ')[0]} → ${v.destino}`,
          detalhe: `Ida${v.vooIda ? ` • Voo ${v.vooIda}` : ''}`,
          horario: v.horarioIda,
        })
      }
      if (v.dataVolta && v.dataVolta !== v.dataIda) {
        add(v.dataVolta, {
          tipo: 'viagem',
          id: v.id,
          label: `✈️ ${v.viajante.split(' ')[0]} ← ${v.destino}`,
          detalhe: `Volta${v.vooVolta ? ` • Voo ${v.vooVolta}` : ''}`,
          horario: v.horarioVolta,
        })
      }
    })

    return mapa
  }, [pessoas, eventos, viagens, ano, filtros])

  const dias = getDiasDoMes(ano, mes)
  const isHoje = (dia, mesAtual) => mesAtual && dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()

  const getKey = (dia, mesAtual) => {
    let m = mes, a = ano
    if (!mesAtual && dia > 15) { m--; if (m < 0) { m = 11; a-- } }
    if (!mesAtual && dia < 15) { m++; if (m > 11) { m = 0; a++ } }
    return `${a}-${String(m + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  const itensDiaSelecionado = diaSelecionado
    ? (itensPorDia[diaSelecionado.key] || [])
    : []

  // Contadores do mês
  const contadores = useMemo(() => {
    let aniv = 0, ev = 0, viag = 0
    Object.entries(itensPorDia).forEach(([key, itens]) => {
      const [a, m] = key.split('-').map(Number)
      if (a === ano && m === mes + 1) {
        itens.forEach(i => {
          if (i.tipo === 'aniversario') aniv++
          else if (i.tipo === 'evento') ev++
          else if (i.tipo === 'viagem') viag++
        })
      }
    })
    return { aniv, ev, viag }
  }, [itensPorDia, ano, mes])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
          <p className="text-sm text-gray-400 mt-1">Visão geral de todos os compromissos</p>
        </div>
        <button onClick={() => { setMes(hoje.getMonth()); setAno(hoje.getFullYear()) }}
          className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
          Hoje
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {[
          { tipo: 'aniversario', cor: CORES_TIPO.aniversario, label: `Aniversários (${contadores.aniv})`, icon: Cake },
          { tipo: 'evento', cor: CORES_TIPO.evento, label: `Eventos (${contadores.ev})`, icon: PartyPopper },
          { tipo: 'viagem', cor: CORES_TIPO.viagem, label: `Viagens (${contadores.viag})`, icon: Plane },
        ].map(({ tipo, cor, label, icon: Icon }) => (
          <button
            key={tipo}
            onClick={() => toggleFiltro(tipo)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              filtros[tipo]
                ? `${cor.bg} ${cor.text} ${cor.border}`
                : 'bg-gray-50 text-gray-400 border-gray-200 line-through'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${filtros[tipo] ? cor.dot : 'bg-gray-300'}`} />
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Nav do mês */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button onClick={() => navegar(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><ChevronLeft size={18} className="text-gray-500" /></button>
          <h3 className="text-base font-semibold text-gray-800">{MESES[mes]} {ano}</h3>
          <button onClick={() => navegar(1)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><ChevronRight size={18} className="text-gray-500" /></button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7">
          {dias.map((cell, i) => {
            const key = getKey(cell.dia, cell.mesAtual)
            const itens = itensPorDia[key] || []
            const ehHoje = isHoje(cell.dia, cell.mesAtual)

            return (
              <div
                key={i}
                onClick={() => itens.length > 0 && setDiaSelecionado({ key, data: new Date(ano, mes, cell.dia) })}
                className={`min-h-[90px] border-b border-r border-gray-50 p-1.5 transition-all ${
                  cell.mesAtual ? 'bg-white' : 'bg-gray-50/50'
                } ${itens.length > 0 ? 'cursor-pointer hover:bg-blue-50/30' : ''}`}
              >
                <p className={`text-xs font-medium mb-1 ${
                  ehHoje
                    ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : cell.mesAtual ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {cell.dia}
                </p>
                <div className="space-y-0.5">
                  {itens.slice(0, 3).map((item, j) => (
                    <EventoPill key={j} item={item} />
                  ))}
                  {itens.length > 3 && (
                    <p className="text-[10px] text-gray-400 font-medium pl-1">+{itens.length - 3} mais</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de detalhes */}
      {diaSelecionado && (
        <DetalhesDia
          data={diaSelecionado.data}
          itens={itensDiaSelecionado}
          onFechar={() => setDiaSelecionado(null)}
          onItemClick={(item) => {
            setDiaSelecionado(null)
            if (item.tipo === 'viagem') onNavegar('viagens', item.id)
            else if (item.tipo === 'evento') onNavegar('eventos', item.id)
          }}
        />
      )}
    </div>
  )
}
