import Dashboard from '../components/Dashboard'

export default function HomePage({ pessoas, carregando, busca, setBusca, gerenciaSelecionada, setGerenciaSelecionada }) {
  if (carregando) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">Carregando dados da planilha...</p>
      </div>
    )
  }

  return (
    <Dashboard
      pessoas={pessoas}
      busca={busca}
      setBusca={setBusca}
      gerenciaSelecionada={gerenciaSelecionada}
      setGerenciaSelecionada={setGerenciaSelecionada}
    />
  )
}
