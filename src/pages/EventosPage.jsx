import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Search, X, Trash2, Edit3, Check, PartyPopper, Calendar, MapPin, Clock, Share2, ExternalLink } from 'lucide-react'
import { useDatabase } from '../hooks/useDatabase'
import { useCompartilharBatch } from '../hooks/useCompartilhamentos'
import { useAuth } from '../contexts/AuthContext'
import ConvidadosInput from '../components/ConvidadosInput'
import { supabase } from '../lib/supabase'

function FormEvento({ evento, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', data: '', horario: '', dataFim: '', horarioFim: '', local: '', link: '', tipo: 'confraternizacao',
    ...evento,
  })
  const [convidados, setConvidados] = useState(evento?._convidados || [])
  const set = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) return
    onSalvar({
      ...form,
      id: form.id || undefined,
      criadoEm: form.criadoEm || new Date().toISOString(),
    }, convidados)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{evento ? 'Editar Evento' : 'Novo Evento'}</h3>
        <button type="button" onClick={onCancelar} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
      </div>
      <input type="text" placeholder="Título do evento..." value={form.titulo} onChange={set('titulo')} autoFocus
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
      <textarea placeholder="Descrição..." value={form.descricao} onChange={set('descricao')} rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Data início</label>
          <input type="date" value={form.data} onChange={set('data')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Horário início</label>
          <input type="time" value={form.horario} onChange={set('horario')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Data término</label>
          <input type="date" value={form.dataFim} onChange={set('dataFim')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Horário término</label>
          <input type="time" value={form.horarioFim} onChange={set('horarioFim')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Local</label>
          <input type="text" placeholder="Ex: Sala 301" value={form.local} onChange={set('local')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Link da reunião</label>
          <input type="url" placeholder="https://meet.google.com/..." value={form.link} onChange={set('link')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select value={form.tipo} onChange={set('tipo')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
            <option value="confraternizacao">Confraternização</option>
            <option value="reuniao">Reunião</option>
            <option value="happy_hour">Happy Hour</option>
            <option value="treinamento">Treinamento</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      <ConvidadosInput emails={convidados} onChange={setConvidados} />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancelar</button>
        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 cursor-pointer">
          <Check size={14} /> Salvar
        </button>
      </div>
    </form>
  )
}

const TIPO_LABEL = {
  confraternizacao: { label: 'Confraternização', color: 'bg-pink-100 text-pink-700' },
  reuniao: { label: 'Reunião', color: 'bg-blue-100 text-blue-700' },
  happy_hour: { label: 'Happy Hour', color: 'bg-amber-100 text-amber-700' },
  treinamento: { label: 'Treinamento', color: 'bg-green-100 text-green-700' },
  outro: { label: 'Outro', color: 'bg-gray-100 text-gray-600' },
}

function formatarData(d) {
  if (!d) return ''
  return new Date(d + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function CardEvento({ evento, onEditar, onExcluir, onExpandir, destaque, isOwner, convidadosCount }) {
  const ref = useRef(null)
  const tipo = TIPO_LABEL[evento.tipo] || TIPO_LABEL.outro

  useEffect(() => {
    if (destaque && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [destaque])

  return (
    <div
      ref={ref}
      onClick={() => onExpandir(evento)}
      className={`bg-white/80 backdrop-blur border rounded-2xl p-5 transition-all hover:shadow-md group cursor-pointer overflow-hidden ${destaque ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' : 'border-gray-100'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{evento.titulo}</h3>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${tipo.color}`}>{tipo.label}</span>
          {convidadosCount > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-0.5 shrink-0">
              <Share2 size={9} /> {convidadosCount}
            </span>
          )}
          {!isOwner && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 shrink-0">compartilhado</span>}
        </div>
        {isOwner && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={(e) => { e.stopPropagation(); onEditar(evento) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer"><Edit3 size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); onExcluir(evento.id) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      {evento.descricao && <p className="text-sm text-gray-600 mb-3 line-clamp-2 overflow-hidden">{evento.descricao}</p>}
      <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-400">
        {evento.data && <span className="flex items-center gap-1"><Calendar size={11} /> {formatarData(evento.data)}</span>}
        {evento.horario && <span className="flex items-center gap-1"><Clock size={11} /> {evento.horario}{evento.horarioFim ? ` — ${evento.horarioFim}` : ''}</span>}
        {evento.local && <span className="flex items-center gap-1 truncate max-w-[120px]"><MapPin size={11} /> {evento.local}</span>}
        {evento.link && <span className="flex items-center gap-1 text-blue-500"><ExternalLink size={11} /> Link</span>}
      </div>
    </div>
  )
}

function ModalEvento({ evento, onFechar, onEditar, onExcluir, isOwner, convidadosCount }) {
  const tipo = TIPO_LABEL[evento.tipo] || TIPO_LABEL.outro

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onFechar}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold text-gray-800">{evento.titulo}</h2>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tipo.color}`}>{tipo.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {convidadosCount > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 flex items-center gap-0.5">
                  <Share2 size={9} /> {convidadosCount} convidado{convidadosCount > 1 ? 's' : ''}
                </span>
              )}
              {!isOwner && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">compartilhado</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <>
                <button onClick={() => { onFechar(); onEditar(evento) }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer"><Edit3 size={16} /></button>
                <button onClick={() => { onFechar(); onExcluir(evento.id) }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
              </>
            )}
            <button onClick={onFechar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={16} /></button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(evento.data || evento.dataFim) && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">📅 Data</p>
                <p className="text-sm font-medium text-gray-700">
                  {formatarData(evento.data)}
                  {evento.dataFim && evento.dataFim !== evento.data && ` — ${formatarData(evento.dataFim)}`}
                </p>
              </div>
            )}
            {(evento.horario || evento.horarioFim) && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">🕐 Horário</p>
                <p className="text-sm font-medium text-gray-700">
                  {evento.horario || '—'}
                  {evento.horarioFim && ` — ${evento.horarioFim}`}
                </p>
              </div>
            )}
            {evento.local && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">📍 Local</p>
                <p className="text-sm font-medium text-gray-700">{evento.local}</p>
              </div>
            )}
            {evento.link && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-blue-400 uppercase mb-1">🔗 Link da reunião</p>
                <a href={evento.link} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline truncate block">
                  {evento.link}
                </a>
              </div>
            )}
          </div>

          {/* Descrição */}
          {evento.descricao && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">📝 Descrição</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{evento.descricao}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EventosPage({ focoId, onFocoConcluido }) {
  const { user } = useAuth()
  const { items: eventos, insert, update, remove, refresh } = useDatabase('eventos')
  const { compartilharEmBatch } = useCompartilharBatch()
  const [busca, setBusca] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [destaqueId, setDestaqueId] = useState(null)
  const [expandido, setExpandido] = useState(null)
  const [compartilhamentos, setCompartilhamentos] = useState({})

  useEffect(() => {
    if (!user || eventos.length === 0) return
    const fetchCompartilhamentos = async () => {
      const ids = eventos.map(e => e.id).filter(Boolean)
      if (ids.length === 0) return
      const { data } = await supabase.from('compartilhamentos').select('*').eq('tipo', 'evento').in('item_id', ids)
      if (data) {
        const mapa = {}
        data.forEach(c => { if (!mapa[c.item_id]) mapa[c.item_id] = []; mapa[c.item_id].push(c) })
        setCompartilhamentos(mapa)
      }
    }
    fetchCompartilhamentos()
  }, [user, eventos])

  useEffect(() => {
    if (focoId) {
      setDestaqueId(focoId)
      onFocoConcluido?.()
      setTimeout(() => setDestaqueId(null), 3000)
    }
  }, [focoId])

  const filtrados = useMemo(() => {
    if (!busca.trim()) return eventos
    const termo = busca.toLowerCase()
    return eventos.filter(e => (e.titulo || '').toLowerCase().includes(termo) || (e.descricao || '').toLowerCase().includes(termo))
  }, [eventos, busca])

  const handleSalvar = async (evento, convidados) => {
    const existe = eventos.find(e => e.id === evento.id)
    let itemId = evento.id

    if (existe) {
      // Update direto no supabase pra garantir que todos os campos vão corretos
      await supabase.from('eventos').update({
        titulo: evento.titulo, descricao: evento.descricao,
        data: evento.data || null, horario: evento.horario,
        data_fim: evento.dataFim || null, horario_fim: evento.horarioFim,
        local: evento.local, link: evento.link, tipo: evento.tipo,
      }).eq('id', evento.id)
    } else {
      const { data } = await supabase.from('eventos').insert({
        titulo: evento.titulo, descricao: evento.descricao,
        data: evento.data || null, horario: evento.horario,
        data_fim: evento.dataFim || null, horario_fim: evento.horarioFim,
        local: evento.local, link: evento.link, tipo: evento.tipo, user_id: user.id,
      }).select('id').single()
      if (data) itemId = data.id
    }

    if (itemId && convidados.length > 0) await compartilharEmBatch('evento', itemId, convidados)

    await refresh()
    setMostrarForm(false)
    setEditando(null)
  }

  const handleEditar = async (evento) => {
    const { data } = await supabase.from('compartilhamentos').select('shared_with_email').eq('tipo', 'evento').eq('item_id', evento.id)
    setEditando({ ...evento, _convidados: (data || []).map(c => c.shared_with_email) })
    setMostrarForm(true)
  }

  const handleExcluir = async (id) => {
    if (!confirm('Excluir este evento?')) return
    await supabase.from('compartilhamentos').delete().eq('tipo', 'evento').eq('item_id', id)
    remove(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Eventos</h2>
          <p className="text-sm text-gray-400 mt-1">{eventos.length} evento(s)</p>
        </div>
        <button onClick={() => { setEditando(null); setMostrarForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar eventos..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
        {busca && <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>}
      </div>

      {mostrarForm && (
        <FormEvento evento={editando} onSalvar={handleSalvar} onCancelar={() => { setMostrarForm(false); setEditando(null) }} />
      )}

      {filtrados.length === 0 ? (
        <div className="bg-white/60 backdrop-blur rounded-2xl border border-gray-100 p-12 text-center">
          <PartyPopper size={56} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {busca ? 'Nenhum evento encontrado' : 'Nenhum evento cadastrado'}
          </h3>
          <p className="text-sm text-gray-400">
            {busca ? 'Tente outro termo' : 'Clique em "Novo Evento" para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(e => (
            <CardEvento key={e.id} evento={e} destaque={destaqueId === e.id}
              isOwner={e.user_id === user?.id}
              convidadosCount={(compartilhamentos[e.id] || []).length}
              onEditar={handleEditar} onExcluir={handleExcluir} onExpandir={setExpandido} />
          ))}
        </div>
      )}

      {expandido && (
        <ModalEvento evento={expandido} onFechar={() => setExpandido(null)}
          onEditar={handleEditar} onExcluir={handleExcluir}
          isOwner={expandido.user_id === user?.id}
          convidadosCount={(compartilhamentos[expandido.id] || []).length} />
      )}
    </div>
  )
}
