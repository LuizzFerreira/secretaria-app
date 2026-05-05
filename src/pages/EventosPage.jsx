import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Search, X, Trash2, Edit3, Check, PartyPopper, Calendar, MapPin, Clock, Users, Share2 } from 'lucide-react'
import { useDatabase } from '../hooks/useDatabase'
import { useCompartilharBatch } from '../hooks/useCompartilhamentos'
import { useAuth } from '../contexts/AuthContext'
import ConvidadosInput from '../components/ConvidadosInput'
import { supabase } from '../lib/supabase'

function FormEvento({ evento, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', data: '', horario: '', local: '', tipo: 'confraternizacao',
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
          <label className="block text-xs font-medium text-gray-500 mb-1">Data</label>
          <input type="date" value={form.data} onChange={set('data')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Horário</label>
          <input type="time" value={form.horario} onChange={set('horario')}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Local</label>
          <input type="text" placeholder="Ex: Sala 301" value={form.local} onChange={set('local')}
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

function CardEvento({ evento, onEditar, onExcluir, destaque, isOwner, convidadosCount }) {
  const ref = useRef(null)
  const tipo = TIPO_LABEL[evento.tipo] || TIPO_LABEL.outro
  const dataFormatada = evento.data
    ? new Date(evento.data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  useEffect(() => {
    if (destaque && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [destaque])

  return (
    <div ref={ref} className={`bg-white/80 backdrop-blur border rounded-2xl p-5 transition-all hover:shadow-md group ${destaque ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-800 text-sm">{evento.titulo}</h3>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tipo.color}`}>{tipo.label}</span>
          {convidadosCount > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-0.5">
              <Share2 size={9} /> {convidadosCount}
            </span>
          )}
          {!isOwner && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
              compartilhado
            </span>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEditar(evento)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 cursor-pointer"><Edit3 size={14} /></button>
            <button onClick={() => onExcluir(evento.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      {evento.descricao && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{evento.descricao}</p>}
      <div className="flex items-center gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><Calendar size={11} /> {dataFormatada}</span>
        {evento.horario && <span className="flex items-center gap-1"><Clock size={11} /> {evento.horario}h</span>}
        {evento.local && <span className="flex items-center gap-1"><MapPin size={11} /> {evento.local}</span>}
      </div>
    </div>
  )
}

export default function EventosPage({ focoId, onFocoConcluido }) {
  const { user } = useAuth()
  const { items: eventos, insert, update, remove } = useDatabase('eventos')
  const { compartilharEmBatch } = useCompartilharBatch()
  const [busca, setBusca] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [destaqueId, setDestaqueId] = useState(null)
  const [compartilhamentos, setCompartilhamentos] = useState({})

  // Carrega compartilhamentos de todos os eventos
  useEffect(() => {
    if (!user || eventos.length === 0) return
    const fetchCompartilhamentos = async () => {
      const ids = eventos.map(e => e.id).filter(Boolean)
      if (ids.length === 0) return
      const { data } = await supabase
        .from('compartilhamentos')
        .select('*')
        .eq('tipo', 'evento')
        .in('item_id', ids)
      if (data) {
        const mapa = {}
        data.forEach(c => {
          if (!mapa[c.item_id]) mapa[c.item_id] = []
          mapa[c.item_id].push(c)
        })
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
    return eventos.filter(e =>
      (e.titulo || '').toLowerCase().includes(termo) || (e.descricao || '').toLowerCase().includes(termo)
    )
  }, [eventos, busca])

  const handleSalvar = async (evento, convidados) => {
    const existe = eventos.find(e => e.id === evento.id)
    let itemId = evento.id

    if (existe) {
      await update(evento.id, evento)
    } else {
      // Insert e pega o id retornado
      const { data } = await supabase.from('eventos').insert({
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: evento.data || null,
        horario: evento.horario,
        local: evento.local,
        tipo: evento.tipo,
        user_id: user.id,
      }).select('id').single()
      if (data) itemId = data.id
    }

    // Compartilhar com convidados
    if (itemId && convidados.length > 0) {
      await compartilharEmBatch('evento', itemId, convidados)
    }

    setMostrarForm(false)
    setEditando(null)
  }

  const handleEditar = async (evento) => {
    // Carrega convidados do evento
    const { data } = await supabase
      .from('compartilhamentos')
      .select('shared_with_email')
      .eq('tipo', 'evento')
      .eq('item_id', evento.id)
    const convidados = (data || []).map(c => c.shared_with_email)
    setEditando({ ...evento, _convidados: convidados })
    setMostrarForm(true)
  }

  const handleExcluir = async (id) => {
    if (!confirm('Excluir este evento?')) return
    // Remove compartilhamentos também
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
        {busca && (
          <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>
        )}
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
            <CardEvento
              key={e.id}
              evento={e}
              destaque={destaqueId === e.id}
              isOwner={e.user_id === user?.id}
              convidadosCount={(compartilhamentos[e.id] || []).length}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
            />
          ))}
        </div>
      )}
    </div>
  )
}
