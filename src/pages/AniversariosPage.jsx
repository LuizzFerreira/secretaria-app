import Dashboard from '../components/Dashboard'

export default function AniversariosPage({ pessoas, busca, setBusca, gerenciaSelecionada, setGerenciaSelecionada }) {
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
