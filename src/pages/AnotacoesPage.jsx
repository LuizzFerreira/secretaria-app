import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, X, Trash2, Edit3, Check, StickyNote, Clock, Share2, GripVertical } from 'lucide-react'
import { useDatabase } from '../hooks/useDatabase'
import { useCompartilharBatch } from '../hooks/useCompartilhamentos'
import { useAuth } from '../contexts/AuthContext'
import ConvidadosInput from '../components/ConvidadosInput'
import { supabase } from '../lib/supabase'

const CORES = [
  { id: 'yellow', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  { id: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400' },
  { id: 'green', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-400' },
  { id: 'pink', bg: 'bg-pink-50', border: 'border-pink-200', dot: 'bg-pink-400' },
  { id: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-400' },
]

const COLUNAS = [
  { id: 'a_fazer', label: 'A Fazer', color: 'border-t-gray-400', bgHeader: 'bg-gray-50' },
  { id: 'em_andamento', label: 'Em Andamento', color: 'border-t-blue-500', bgHeader: 'bg-blue-50' },
  { id: 'concluido', label: 'Concluído', color: 'border-t-green-500', bgHeader: 'bg-green-50' },
]

function FormAnotacao({ nota, onSalvar, onCancelar }) {
  const [titulo, setTitulo] = useState(nota?.titulo || '')
  const [conteudo, setConteudo] = useState(nota?.conteudo || '')
  const [cor, setCor] = useState(nota?.cor || 'yellow')
  const [status, setStatus] = useState(nota?.status || 'a_fazer')
  const [convidados, setConvidados] = useState(nota?._convidados || [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    onSalvar({
      id: nota?.id || undefined,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      cor,
      status,
      criadoEm: nota?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }, convidados)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{nota ? 'Editar Anotação' : 'Nova Anotação'}</h3>
        <button type="button" onClick={onCancelar} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={18} /></button>
      </div>
      <input type="text" placeholder="Título da anotação..." value={titulo} onChange={e => setTitulo(e.target.value)} autoFocus
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
      <textarea placeholder="Escreva sua anotação aqui..." value={conteudo} onChange={e => setConteudo(e.target.value)} rows={4}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Cor:</span>
          {CORES.map(c => (
            <button key={c.id} type="button" onClick={() => setCor(c.id)}
              className={`w-5 h-5 rounded-full ${c.dot} cursor-pointer transition-all ${cor === c.id ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'opacity-50 hover:opacity-100'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Status:</span>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="px-2 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
            {COLUNAS.map(c => (<option key={c.id} value={c.id}>{c.label}</option>))}
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

function CardAnotacao({ nota, onEditar, onExcluir, isOwner, convidadosCount, onDragStart, onExpandir }) {
  const corConfig = CORES.find(c => c.id === nota.cor) || CORES[0]
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, nota)}
      onClick={() => onExpandir(nota)}
      className={`${corConfig.bg} border ${corConfig.border} rounded-xl p-4 transition-all hover:shadow-md group cursor-grab active:cursor-grabbing active:shadow-lg active:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          <GripVertical size={12} className="text-gray-300 shrink-0" />
          <h3 className="font-semibold text-gray-800 text-xs truncate">{nota.titulo}</h3>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {convidadosCount > 0 && <span className="p-1 text-blue-500"><Share2 size={11} /></span>}
          {!isOwner && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">compartilhado</span>}
          {isOwner && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEditar(nota) }} className="p-1 rounded hover:bg-white/60 text-gray-400 hover:text-blue-500 cursor-pointer"><Edit3 size={11} /></button>
              <button onClick={(e) => { e.stopPropagation(); onExcluir(nota.id) }} className="p-1 rounded hover:bg-white/60 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={11} /></button>
            </>
          )}
        </div>
      </div>
      {nota.conteudo && <p className="text-[11px] text-gray-600 whitespace-pre-wrap line-clamp-4 mb-2 pl-5">{nota.conteudo}</p>}
      {nota.atualizadoEm && (
        <div className="flex items-center gap-1 text-[10px] text-gray-400 pl-5">
          <Clock size={9} />
          {new Date(nota.atualizadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </div>
      )}
    </div>
  )
}

function ModalExpandido({ nota, onFechar, onEditar, onExcluir, isOwner, convidadosCount }) {
  const corConfig = CORES.find(c => c.id === nota.cor) || CORES[0]
  const colunaLabel = COLUNAS.find(c => c.id === (nota.status || 'a_fazer'))?.label || 'A Fazer'

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onFechar}>
      <div className={`${corConfig.bg} border ${corConfig.border} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-200/50 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800">{nota.titulo}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/80 text-gray-600">{colunaLabel}</span>
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
                <button onClick={() => { onFechar(); onEditar(nota) }} className="p-2 rounded-lg hover:bg-white/60 text-gray-400 hover:text-blue-500 cursor-pointer"><Edit3 size={16} /></button>
                <button onClick={() => { onFechar(); onExcluir(nota.id) }} className="p-2 rounded-lg hover:bg-white/60 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={16} /></button>
              </>
            )}
            <button onClick={onFechar} className="p-2 rounded-lg hover:bg-white/60 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={16} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {nota.conteudo ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{nota.conteudo}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Sem conteúdo</p>
          )}
        </div>
        {nota.atualizadoEm && (
          <div className="px-6 py-3 border-t border-gray-200/50 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Clock size={10} />
            Atualizado em {new Date(nota.atualizadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

function Coluna({ coluna, anotacoes, onEditar, onExcluir, onDragStart, onDrop, onExpandir, userId, compartilhamentos }) {
  const [dragOver, setDragOver] = useState(false)
  return (
    <div
      className={`flex flex-col rounded-2xl border border-gray-100 overflow-hidden transition-all ${dragOver ? 'ring-2 ring-blue-300 bg-blue-50/30' : 'bg-white/40'}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(coluna.id) }}
    >
      <div className={`px-4 py-3 border-t-4 ${coluna.color} ${coluna.bgHeader} flex items-center justify-between`}>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{coluna.label}</h3>
        <span className="text-[10px] font-medium text-gray-400 bg-white/80 px-2 py-0.5 rounded-full">{anotacoes.length}</span>
      </div>
      <div className="flex-1 p-3 space-y-2.5 min-h-[200px]">
        {anotacoes.map(nota => (
          <CardAnotacao key={nota.id} nota={nota} isOwner={nota.user_id === userId}
            convidadosCount={(compartilhamentos[nota.id] || []).length}
            onEditar={onEditar} onExcluir={onExcluir} onDragStart={onDragStart} onExpandir={onExpandir} />
        ))}
        {anotacoes.length === 0 && <div className="text-center py-8 text-gray-300"><p className="text-[11px]">Arraste cards aqui</p></div>}
      </div>
    </div>
  )
}

export default function AnotacoesPage() {
  const { user } = useAuth()
  const { items: anotacoes, insert, update, remove } = useDatabase('anotacoes')
  const { compartilharEmBatch } = useCompartilharBatch()
  const [busca, setBusca] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [compartilhamentos, setCompartilhamentos] = useState({})
  const [dragging, setDragging] = useState(null)
  const [expandido, setExpandido] = useState(null)

  useEffect(() => {
    if (!user || anotacoes.length === 0) return
    const fetchCompartilhamentos = async () => {
      const ids = anotacoes.map(a => a.id).filter(Boolean)
      if (ids.length === 0) return
      const { data } = await supabase.from('compartilhamentos').select('*').eq('tipo', 'anotacao').in('item_id', ids)
      if (data) {
        const mapa = {}
        data.forEach(c => { if (!mapa[c.item_id]) mapa[c.item_id] = []; mapa[c.item_id].push(c) })
        setCompartilhamentos(mapa)
      }
    }
    fetchCompartilhamentos()
  }, [user, anotacoes])

  const filtradas = useMemo(() => {
    if (!busca.trim()) return anotacoes
    const termo = busca.toLowerCase()
    return anotacoes.filter(n => (n.titulo || '').toLowerCase().includes(termo) || (n.conteudo || '').toLowerCase().includes(termo))
  }, [anotacoes, busca])

  const porColuna = useMemo(() => {
    const mapa = { a_fazer: [], em_andamento: [], concluido: [] }
    filtradas.forEach(n => {
      const status = n.status || 'a_fazer'
      if (mapa[status]) mapa[status].push(n)
      else mapa.a_fazer.push(n)
    })
    return mapa
  }, [filtradas])

  const handleSalvar = async (nota, convidados) => {
    const existe = anotacoes.find(n => n.id === nota.id)
    let itemId = nota.id
    if (existe) {
      await update(nota.id, nota)
    } else {
      const { data } = await supabase.from('anotacoes').insert({
        titulo: nota.titulo, conteudo: nota.conteudo, cor: nota.cor, status: nota.status || 'a_fazer', user_id: user.id,
      }).select('id').single()
      if (data) itemId = data.id
    }
    if (itemId && convidados.length > 0) await compartilharEmBatch('anotacao', itemId, convidados)
    setMostrarForm(false)
    setEditando(null)
  }

  const handleEditar = async (nota) => {
    const { data } = await supabase.from('compartilhamentos').select('shared_with_email').eq('tipo', 'anotacao').eq('item_id', nota.id)
    setEditando({ ...nota, _convidados: (data || []).map(c => c.shared_with_email) })
    setMostrarForm(true)
  }

  const handleExcluir = async (id) => {
    if (!confirm('Excluir esta anotação?')) return
    await supabase.from('compartilhamentos').delete().eq('tipo', 'anotacao').eq('item_id', id)
    remove(id)
  }

  const handleDragStart = (e, nota) => { setDragging(nota); e.dataTransfer.effectAllowed = 'move' }

  const handleDrop = (novoStatus) => {
    if (!dragging || dragging.status === novoStatus) { setDragging(null); return }
    update(dragging.id, { ...dragging, status: novoStatus, atualizadoEm: new Date().toISOString() })
    setDragging(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Anotações</h2>
          <p className="text-sm text-gray-400 mt-1">{anotacoes.length} anotação(ões)</p>
        </div>
        <button onClick={() => { setEditando(null); setMostrarForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
          <Plus size={16} /> Nova Anotação
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar anotações..." value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
        {busca && <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>}
      </div>

      {mostrarForm && (
        <FormAnotacao nota={editando} onSalvar={handleSalvar} onCancelar={() => { setMostrarForm(false); setEditando(null) }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUNAS.map(coluna => (
          <Coluna key={coluna.id} coluna={coluna} anotacoes={porColuna[coluna.id]} userId={user?.id}
            compartilhamentos={compartilhamentos} onEditar={handleEditar} onExcluir={handleExcluir}
            onDragStart={handleDragStart} onDrop={handleDrop} onExpandir={setExpandido} />
        ))}
      </div>

      {expandido && (
        <ModalExpandido nota={expandido} onFechar={() => setExpandido(null)}
          onEditar={handleEditar} onExcluir={handleExcluir}
          isOwner={expandido.user_id === user?.id}
          convidadosCount={(compartilhamentos[expandido.id] || []).length} />
      )}
    </div>
  )
}
