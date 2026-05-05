import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import Sidebar from './components/Sidebar'
import NotificationBell from './components/NotificationBell'
import ExcelUploader from './components/ExcelUploader'
import HomePage from './pages/HomePage'
import EventosPage from './pages/EventosPage'
import CalendarioPage from './pages/CalendarioPage'
import AnotacoesPage from './pages/AnotacoesPage'
import ViagensPage from './pages/ViagensPage'
import AgendaPage from './pages/AgendaPage'
import { lerPlanilha, lerPlanilhaDeURL } from './data/excelReader'
import { filtrarAniversariantes, getGerenciasUnicas } from './data/utils'
import planilhaAnivUrl from './Aniversariantes DTA- RJ (1).xlsx?url'

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
  const [pagina, setPagina] = useState('home')
  const [focoId, setFocoId] = useState(null)
  const [busca, setBusca] = useState('')
  const [gerenciaSelecionada, setGerenciaSelecionada] = useState('')
  const barraTop = useBarraGlobalHeight()

  const [pessoas, setPessoas] = useState([])
  const [planilhaCarregada, setPlanilhaCarregada] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    lerPlanilhaDeURL(planilhaAnivUrl)
      .then(dados => {
        if (dados.length > 0) {
          setPessoas(dados)
          setPlanilhaCarregada(true)
        }
      })
      .catch(err => console.error('Erro ao carregar planilha:', err))
      .finally(() => setCarregando(false))
  }, [])

  const handleAniversarios = async (file, modo) => {
    try {
      const dados = await lerPlanilha(file)
      if (dados.length === 0) return alert('Nenhum dado encontrado na planilha.')
      if (modo === 'substituir') {
        setPessoas(dados)
      } else {
        const existentes = new Set(pessoas.map(p => p.nome.toLowerCase().trim()))
        const novos = dados.filter(p => !existentes.has(p.nome.toLowerCase().trim()))
        setPessoas(prev => [...prev, ...novos])
      }
      setPlanilhaCarregada(true)
    } catch {
      alert('Erro ao ler a planilha.')
    }
  }

  const handleViagens = async (file, modo) => {
    // Viagens agora são gerenciadas pelo Supabase via ViagensPage
    alert('As viagens são gerenciadas diretamente na página de Viagens.')
  }

  const hoje = new Date()
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
        return <HomePage pessoas={pessoas} carregando={carregando} busca={busca} setBusca={setBusca} gerenciaSelecionada={gerenciaSelecionada} setGerenciaSelecionada={setGerenciaSelecionada} />
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
        return <HomePage pessoas={pessoas} carregando={carregando} />
    }
  }

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
          <div className="flex items-center gap-3">
            {aniversariantesHoje.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full animate-pulse font-medium">
                🎉 {aniversariantesHoje.length} aniversariante{aniversariantesHoje.length > 1 ? 's' : ''} hoje!
              </span>
            )}
            <NotificationBell aniversariantes={aniversariantesHoje} />
            {planilhaCarregada && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                ✓ Planilhas
              </span>
            )}
            <ExcelUploader onAniversarios={handleAniversarios} onViagens={handleViagens} hasData={planilhaCarregada} />
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
