import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, X, Trash2, Edit3, Check, Plane, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useDatabase } from '../hooks/useDatabase'
import { usePlanilhas } from '../hooks/usePlanilhas'

const STATUS_OPTIONS = [
  { id: 'planejada', label: 'Planejada', color: 'bg-blue-100 text-blue-700' },
  { id: 'confirmada', label: 'Confirmada', color: 'bg-green-100 text-green-700' },
  { id: 'em_andamento', label: 'Em andamento', color: 'bg-amber-100 text-amber-700' },
  { id: 'concluida', label: 'Concluída', color: 'bg-gray-100 text-gray-600' },
  { id: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-700' },
]

function formatarDataBR(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      />
    </div>
  )
}

function FormViagem({ viagem, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    viajante: '', cargo: '',
    origem: '', destino: '', motivoViagem: '',
    dataIda: '', dataVolta: '',
    vooIda: '', ciaIda: '', horarioIda: '', aeroportoIda: '',
    vooVolta: '', ciaVolta: '', horarioVolta: '', aeroportoVolta: '',
    hotel: '', enderecoHotel: '', checkIn: '', checkOut: '', reservaHotel: '',
    status: 'planejada',
    observacoes: '',
    ...viagem,
  })

  const set = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.viajante.trim() || !form.destino.trim()) return
    onSalvar({
      ...form,
      id: form.id || Date.now(),
      criadoEm: form.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">{viagem ? 'Editar Viagem' : 'Nova Viagem'}</h3>
        <button type="button" onClick={onCancelar} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* Viajante */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">👤 Viajante</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField label="Nome do viajante *" placeholder="Ex: João Silva" value={form.viajante} onChange={set('viajante')} />
          <InputField label="Cargo / Gerência" placeholder="Ex: Analista - ITI" value={form.cargo} onChange={set('cargo')} />
        </div>
      </div>

      {/* Trajeto */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📍 Trajeto</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputField label="Origem" placeholder="Ex: Rio de Janeiro" value={form.origem} onChange={set('origem')} />
          <InputField label="Destino *" placeholder="Ex: Brasília" value={form.destino} onChange={set('destino')} />
          <InputField label="Motivo da viagem" placeholder="Ex: Reunião técnica" value={form.motivoViagem} onChange={set('motivoViagem')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <InputField label="Data de ida" type="date" value={form.dataIda} onChange={set('dataIda')} />
          <InputField label="Data de volta" type="date" value={form.dataVolta} onChange={set('dataVolta')} />
        </div>
      </div>

      {/* Voo de ida */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">✈️ Voo de Ida</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <InputField label="Companhia aérea" placeholder="Ex: LATAM" value={form.ciaIda} onChange={set('ciaIda')} />
          <InputField label="Nº do voo" placeholder="Ex: LA3456" value={form.vooIda} onChange={set('vooIda')} />
          <InputField label="Horário" type="time" value={form.horarioIda} onChange={set('horarioIda')} />
          <InputField label="Aeroporto" placeholder="Ex: GIG → BSB" value={form.aeroportoIda} onChange={set('aeroportoIda')} />
        </div>
      </div>

      {/* Voo de volta */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">✈️ Voo de Volta</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <InputField label="Companhia aérea" placeholder="Ex: GOL" value={form.ciaVolta} onChange={set('ciaVolta')} />
          <InputField label="Nº do voo" placeholder="Ex: G31234" value={form.vooVolta} onChange={set('vooVolta')} />
          <InputField label="Horário" type="time" value={form.horarioVolta} onChange={set('horarioVolta')} />
          <InputField label="Aeroporto" placeholder="Ex: BSB → GIG" value={form.aeroportoVolta} onChange={set('aeroportoVolta')} />
        </div>
      </div>

      {/* Hospedagem */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🏨 Hospedagem</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField label="Hotel" placeholder="Ex: Hotel Nacional" value={form.hotel} onChange={set('hotel')} />
          <InputField label="Nº da reserva" placeholder="Ex: RES-123456" value={form.reservaHotel} onChange={set('reservaHotel')} />
          <InputField label="Endereço do hotel" placeholder="Ex: SHS Quadra 1, Brasília" value={form.enderecoHotel} onChange={set('enderecoHotel')} />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Check-in" type="date" value={form.checkIn} onChange={set('checkIn')} />
            <InputField label="Check-out" type="date" value={form.checkOut} onChange={set('checkOut')} />
          </div>
        </div>
      </div>

      {/* Status e obs */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">📋 Detalhes</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={form.status}
              onChange={set('status')}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
            <textarea
              placeholder="Informações adicionais..."
              value={form.observacoes}
              onChange={set('observacoes')}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          Cancelar
        </button>
        <button type="submit" className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 cursor-pointer">
          <Check size={14} />
          Salvar Viagem
        </button>
      </div>
    </form>
  )
}

function CardViagem({ viagem, onEditar, onExcluir, expandido, onToggle }) {
  const statusConfig = STATUS_OPTIONS.find(s => s.id === viagem.status) || STATUS_OPTIONS[0]

  return (
    <div className={`bg-white/80 backdrop-blur border rounded-2xl overflow-hidden transition-all hover:shadow-md ${expandido ? 'border-blue-300 shadow-md' : 'border-gray-100'}`}>
      {/* Header do card */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => onToggle(viagem.id)}
      >
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Plane size={20} className="text-blue-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-gray-800 text-sm truncate">{viagem.viajante || 'Sem nome'}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <MapPin size={11} />
            {viagem.origem || '?'} → {viagem.destino || '?'}
            {viagem.dataIda && <span className="ml-2">• {formatarDataBR(viagem.dataIda)}</span>}
            {viagem.dataVolta && <span>— {formatarDataBR(viagem.dataVolta)}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEditar(viagem) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer">
            <Edit3 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExcluir(viagem.id) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 cursor-pointer">
            <Trash2 size={14} />
          </button>
          {expandido ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-50 space-y-4">
          {viagem.motivoViagem && (
            <p className="text-xs text-gray-500 italic pt-3">Motivo: {viagem.motivoViagem}</p>
          )}

          {/* Voos */}
          {(viagem.vooIda || viagem.vooVolta) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {viagem.vooIda && (
                <div className="bg-blue-50/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-blue-500 uppercase mb-1.5">✈️ Voo de Ida</p>
                  <p className="text-sm font-medium text-gray-700">{viagem.ciaIda} {viagem.vooIda}</p>
                  {viagem.horarioIda && <p className="text-xs text-gray-500">{viagem.horarioIda}h</p>}
                  {viagem.aeroportoIda && <p className="text-xs text-gray-400">{viagem.aeroportoIda}</p>}
                </div>
              )}
              {viagem.vooVolta && (
                <div className="bg-indigo-50/60 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-indigo-500 uppercase mb-1.5">✈️ Voo de Volta</p>
                  <p className="text-sm font-medium text-gray-700">{viagem.ciaVolta} {viagem.vooVolta}</p>
                  {viagem.horarioVolta && <p className="text-xs text-gray-500">{viagem.horarioVolta}h</p>}
                  {viagem.aeroportoVolta && <p className="text-xs text-gray-400">{viagem.aeroportoVolta}</p>}
                </div>
              )}
            </div>
          )}

          {/* Hotel */}
          {viagem.hotel && (
            <div className="bg-amber-50/60 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-amber-600 uppercase mb-1.5">🏨 Hospedagem</p>
              <p className="text-sm font-medium text-gray-700">{viagem.hotel}</p>
              {viagem.enderecoHotel && <p className="text-xs text-gray-500">{viagem.enderecoHotel}</p>}
              {viagem.reservaHotel && <p className="text-xs text-gray-400">Reserva: {viagem.reservaHotel}</p>}
              {(viagem.checkIn || viagem.checkOut) && (
                <p className="text-xs text-gray-400 mt-1">
                  Check-in: {formatarDataBR(viagem.checkIn)} — Check-out: {formatarDataBR(viagem.checkOut)}
                </p>
              )}
            </div>
          )}

          {/* Observações */}
          {viagem.observacoes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">📝 Observações</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{viagem.observacoes}</p>
            </div>
          )}

          {viagem.cargo && (
            <p className="text-[11px] text-gray-400">Cargo: {viagem.cargo}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ViagensPage({ focoId, onFocoConcluido }) {
  const { items: viagensDb, insert, update, remove } = useDatabase('viagens')
  const { dados: viagensPlanilha } = usePlanilhas('viagens')

  // Combinar viagens do banco + planilhas
  const viagens = useMemo(() => {
    const planilhaItems = viagensPlanilha.map((v, i) => ({ ...v, id: `planilha-${i}`, fromPlanilha: true }))
    return [...viagensDb, ...planilhaItems]
  }, [viagensDb, viagensPlanilha])
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [expandidoId, setExpandidoId] = useState(null)

  useEffect(() => {
    if (focoId) {
      setExpandidoId(focoId)
      onFocoConcluido?.()
    }
  }, [focoId])

  const filtradas = useMemo(() => {
    let lista = viagens
    if (filtroStatus) lista = lista.filter(v => v.status === filtroStatus)
    if (busca.trim()) {
      const termo = busca.toLowerCase()
      lista = lista.filter(v =>
        (v.viajante || '').toLowerCase().includes(termo) ||
        (v.destino || '').toLowerCase().includes(termo) ||
        (v.origem || '').toLowerCase().includes(termo) ||
        (v.hotel || '').toLowerCase().includes(termo)
      )
    }
    return lista.sort((a, b) => {
      if (a.dataIda && b.dataIda) return a.dataIda.localeCompare(b.dataIda)
      return (b.criadoEm || '').localeCompare(a.criadoEm || '')
    })
  }, [viagens, busca, filtroStatus])

  const handleSalvar = async (viagem) => {
    const existe = viagens.find(v => v.id === viagem.id)
    if (existe) update(viagem.id, viagem)
    else insert(viagem)
    setMostrarForm(false)
    setEditando(null)
  }

  const handleExcluir = (id) => {
    if (!confirm('Excluir esta viagem?')) return
    remove(id)
  }

  const handleEditar = (viagem) => {
    setEditando(viagem)
    setMostrarForm(true)
  }

  const contagemStatus = useMemo(() => {
    const c = {}
    STATUS_OPTIONS.forEach(s => { c[s.id] = viagens.filter(v => v.status === s.id).length })
    return c
  }, [viagens])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Viagens</h2>
          <p className="text-sm text-gray-400 mt-1">{viagens.length} viagem(ns) cadastrada(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditando(null); setMostrarForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Nova Viagem
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroStatus('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            !filtroStatus ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Todas ({viagens.length})
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setFiltroStatus(filtroStatus === s.id ? '' : s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filtroStatus === s.id ? 'bg-gray-800 text-white' : `${s.color} hover:opacity-80`
            }`}
          >
            {s.label} ({contagemStatus[s.id] || 0})
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por viajante, destino, hotel..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
        {busca && (
          <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Form */}
      {mostrarForm && (
        <FormViagem
          viagem={editando}
          onSalvar={handleSalvar}
          onCancelar={() => { setMostrarForm(false); setEditando(null) }}
        />
      )}

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="bg-white/60 backdrop-blur rounded-2xl border border-gray-100 p-12 text-center">
          <Plane size={56} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {busca || filtroStatus ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem cadastrada'}
          </h3>
          <p className="text-sm text-gray-400">
            {busca || filtroStatus ? 'Tente outros filtros' : 'Clique em "Nova Viagem" para começar a organizar'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtradas.map(v => (
            <CardViagem
              key={v.id}
              viagem={v}
              expandido={expandidoId === v.id}
              onToggle={(id) => setExpandidoId(expandidoId === id ? null : id)}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
            />
          ))}
        </div>
      )}
    </div>
  )
}
