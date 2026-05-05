import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, X, Trash2, Edit3, Check, StickyNote, Clock, Share2 } from 'lucide-react'
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

function FormAnotacao({ nota, onSalvar, onCancelar }) {
  const [titulo, setTitulo] = useState(nota?.titulo || '')
  const [conteudo, setConteudo] = useState(nota?.conteudo || '')
  const [cor, setCor] = useState(nota?.cor || 'yellow')
  const [convidados, setConvidados] = useState(nota?._convidados || [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!titulo.trim()) return
    onSalvar({
      id: nota?.id || undefined,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      cor,
      criadoEm: nota?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }, convidados)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{nota ? 'Editar Anotação' : 'Nova Anotação'}</h3>
        <button type="button" onClick={onCancelar} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <input
        type="text"
        placeholder="Título da anotação..."
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        autoFocus
      />

      <textarea
        placeholder="Escreva sua anotação aqui..."
        value={conteudo}
        onChange={e => setConteudo(e.target.value)}
        rows={5}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Cor:</span>
        {CORES.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCor(c.id)}
            className={`w-6 h-6 rounded-full ${c.dot} cursor-pointer transition-all ${cor === c.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
          />
        ))}
      </div>

      <ConvidadosInput emails={convidados} onChange={setConvidados} />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          Cancelar
        </button>
        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 cursor-pointer">
          <Check size={14} />
          Salvar
        </button>
      </div>
    </form>
  )
}

function CardAnotacao({ nota, onEditar, onExcluir, isOwner, convidadosCount }) {
  const corConfig = CORES.find(c => c.id === nota.cor) || CORES[0]
  const dataFormatada = nota.atualizadoEm
    ? new Date(nota.atualizadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`${corConfig.bg} border ${corConfig.border} rounded-2xl p-5 transition-all hover:shadow-md group`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-800 text-sm">{nota.titulo}</h3>
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
            <button onClick={() => onEditar(nota)} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400 hover:text-blue-500 cursor-pointer">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onExcluir(nota.id)} className="p-1.5 rounded-lg hover:bg-white/60 text-gray-400 hover:text-red-500 cursor-pointer">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      {nota.conteudo && (
        <p className="text-sm text-gray-600 whitespace-pre-wrap mb-3 line-clamp-6">{nota.conteudo}</p>
      )}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
        <Clock size={11} />
        {dataFormatada}
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

  useEffect(() => {
    if (!user || anotacoes.length === 0) return
    const fetchCompartilhamentos = async () => {
      const ids = anotacoes.map(a => a.id).filter(Boolean)
      if (ids.length === 0) return
      const { data } = await supabase
        .from('compartilhamentos')
        .select('*')
        .eq('tipo', 'anotacao')
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
  }, [user, anotacoes])

  const filtradas = useMemo(() => {
    if (!busca.trim()) return anotacoes
    const termo = busca.toLowerCase()
    return anotacoes.filter(n =>
      (n.titulo || '').toLowerCase().includes(termo) || (n.conteudo || '').toLowerCase().includes(termo)
    )
  }, [anotacoes, busca])

  const handleSalvar = async (nota, convidados) => {
    const existe = anotacoes.find(n => n.id === nota.id)
    let itemId = nota.id

    if (existe) {
      await update(nota.id, nota)
    } else {
      const { data } = await supabase.from('anotacoes').insert({
        titulo: nota.titulo,
        conteudo: nota.conteudo,
        cor: nota.cor,
        user_id: user.id,
      }).select('id').single()
      if (data) itemId = data.id
    }

    if (itemId && convidados.length > 0) {
      await compartilharEmBatch('anotacao', itemId, convidados)
    }

    setMostrarForm(false)
    setEditando(null)
  }

  const handleEditar = async (nota) => {
    const { data } = await supabase
      .from('compartilhamentos')
      .select('shared_with_email')
      .eq('tipo', 'anotacao')
      .eq('item_id', nota.id)
    const convidados = (data || []).map(c => c.shared_with_email)
    setEditando({ ...nota, _convidados: convidados })
    setMostrarForm(true)
  }

  const handleExcluir = async (id) => {
    if (!confirm('Excluir esta anotação?')) return
    await supabase.from('compartilhamentos').delete().eq('tipo', 'anotacao').eq('item_id', id)
    remove(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Anotações</h2>
          <p className="text-sm text-gray-400 mt-1">{anotacoes.length} anotação(ões)</p>
        </div>
        <button
          onClick={() => { setEditando(null); setMostrarForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Nova Anotação
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar anotações..."
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

      {mostrarForm && (
        <FormAnotacao
          nota={editando}
          onSalvar={handleSalvar}
          onCancelar={() => { setMostrarForm(false); setEditando(null) }}
        />
      )}

      {filtradas.length === 0 ? (
        <div className="bg-white/60 backdrop-blur rounded-2xl border border-gray-100 p-12 text-center">
          <StickyNote size={56} className="mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {busca ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda'}
          </h3>
          <p className="text-sm text-gray-400">
            {busca ? 'Tente outro termo de busca' : 'Clique em "Nova Anotação" para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(nota => (
            <CardAnotacao
              key={nota.id}
              nota={nota}
              isOwner={nota.user_id === user?.id}
              convidadosCount={(compartilhamentos[nota.id] || []).length}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
            />
          ))}
        </div>
      )}
    </div>
  )
}
