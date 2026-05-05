import { useState, useEffect, useMemo } from 'react'
import { Search, X, LogOut } from 'lucide-react'
import Sidebar from './components/Sidebar'
import NotificationBell from './components/NotificationBell'
import ExcelUploader from './components/ExcelUploader'
import PlanilhasInfo from './components/PlanilhasInfo'
import HomePage from './pages/HomePage'
import EventosPage from './pages/EventosPage'
import CalendarioPage from './pages/CalendarioPage'
import AnotacoesPage from './pages/AnotacoesPage'
import ViagensPage from './pages/ViagensPage'
import AgendaPage from './pages/AgendaPage'
import LoginPage from './pages/LoginPage'
import { useAuth } from './contexts/AuthContext'
import { usePlanilhas } from './hooks/usePlanilhas'
import { lerPlanilha } from './data/excelReader'
import { lerViagensDeArquivo } from './data/excelViagens'
import { filtrarAniversariantes, getGerenciasUnicas } from './data/utils'

function useBarraGlobalHeight() {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const medir = () => {
      const barra = document.querySelector('navegacao-global')
      if (barra) {
        const h = barra.offsetHeight || barra.getBoundingClientRect().height || 0
        if (h > 0) setHeight(h)
      }
    }
    medir()
    const timers = [500, 1000, 2000, 3000].map(ms => setTimeout(medir, ms))
    const observer = new MutationObserver(medir)
    const barra = document.querySelector('navegacao-global')
    if (barra) observer.observe(barra, { childList: true, subtree: true, attributes: true })
    window.addEventListener('resize', medir)
    return () => {
      timers.forEach(clearTimeout)
      observer.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [])
  return height
}

export default function App() {
  const { user, loading, signOut } = useAuth()
  const [pagina, setPagina] = useState('home')
  const [focoId, setFocoId] = useState(null)
  const [busca, setBusca] = useState('')
  const [gerenciaSelecionada, setGerenciaSelecionada] = useState('')
  const barraTop = useBarraGlobalHeight()

  // Planilhas persistidas no Supabase
  const { planilhas: planilhasAniv, dados: pessoas, adicionar: adicionarAniv, remover: removerAniv } = usePlanilhas('aniversarios')
  const { planilhas: planilhasViagens, adicionar: adicionarViagem, remover: removerViagem } = usePlanilhas('viagens')

  // Quando sobe planilha de viagens, salva os registros no banco também
  const handleAniversarios = async (file) => {
    try {
      const dados = await lerPlanilha(file)
      if (dados.length === 0) return alert('Nenhum dado encontrado na planilha.')
      const ok = await adicionarAniv(file.name, dados)
      if (ok) alert(`"${file.name}" carregada! ${dados.length} pessoa(s).`)
    } catch {
      alert('Erro ao ler a planilha de aniversários.')
    }
  }

  const handleViagens = async (file) => {
    try {
      const dados = await lerViagensDeArquivo(file)
      if (dados.length === 0) return alert('Nenhuma viagem encontrada. Verifique se tem colunas como "Viajante" e "Destino".')
      // Registra a planilha pra mostrar o nome
      await adicionarViagem(file.name, dados)
      alert(`"${file.name}" importada! ${dados.length} viagem(ns). Acesse a página de Viagens para visualizar.`)
    } catch (err) {
      console.error(err)
      alert('Erro ao ler a planilha de viagens.')
    }
  }

  const aniversariantesHoje = useMemo(
    () => filtrarAniversariantes(pessoas, 'hoje'),
    [pessoas]
  )
  const gerencias = useMemo(() => getGerenciasUnicas(pessoas), [pessoas])

  const navegarPara = (pag, id = null) => {
    setFocoId(id)
    setPagina(pag)
  }

  const renderPagina = () => {
    switch (pagina) {
      case 'home':
        return <HomePage pessoas={pessoas} carregando={false} busca={busca} setBusca={setBusca} gerenciaSelecionada={gerenciaSelecionada} setGerenciaSelecionada={setGerenciaSelecionada} />
      case 'agenda':
        return <AgendaPage pessoas={pessoas} onNavegar={navegarPara} />
      case 'eventos':
        return <EventosPage focoId={focoId} onFocoConcluido={() => setFocoId(null)} />
      case 'calendario':
        return <CalendarioPage />
      case 'anotacoes':
        return <AnotacoesPage />
      case 'viagens':
        return <ViagensPage focoId={focoId} onFocoConcluido={() => setFocoId(null)} />
      default:
        return <HomePage pessoas={pessoas} carregando={false} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ paddingTop: barraTop }}>
      <header className="ml-56 border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
              {busca && (
                <button onClick={() => setBusca('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X size={12} />
                </button>
              )}
            </div>
            <select
              value={gerenciaSelecionada}
              onChange={e => setGerenciaSelecionada(e.target.value)}
              className="appearance-none px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 cursor-pointer"
            >
              <option value="">Todas gerências</option>
              {gerencias.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {(busca || gerenciaSelecionada) && (
              <button
                onClick={() => { setBusca(''); setGerenciaSelecionada('') }}
                className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {aniversariantesHoje.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full animate-pulse font-medium">
                🎉 {aniversariantesHoje.length} aniversariante{aniversariantesHoje.length > 1 ? 's' : ''} hoje!
              </span>
            )}
            <NotificationBell aniversariantes={aniversariantesHoje} />
            <PlanilhasInfo planilhas={planilhasAniv} onRemover={removerAniv} label="aniv." />
            <PlanilhasInfo planilhas={planilhasViagens} onRemover={removerViagem} label="viag." />
            <ExcelUploader onAniversarios={handleAniversarios} onViagens={handleViagens} hasData={planilhasAniv.length > 0} />

            {/* Avatar + Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <img
                src={user.user_metadata?.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <span className="text-xs text-gray-600 font-medium max-w-[80px] truncate">
                {user.user_metadata?.full_name?.split(' ')[0] || user.email}
              </span>
              <button
                onClick={signOut}
                title="Sair"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Sidebar paginaAtual={pagina} onNavegar={setPagina} topOffset={barraTop} />

      <main className="ml-56 px-8 py-8">
        {renderPagina()}
      </main>
    </div>
  )
}
