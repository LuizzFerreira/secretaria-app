import { useMemo } from 'react'
import { Cake, Plane, AlertTriangle, PartyPopper, CalendarDays, StickyNote, ChevronRight, MapPin, Clock } from 'lucide-react'
import { useDatabase } from '../hooks/useDatabase'
import { usePlanilhas } from '../hooks/usePlanilhas'
import { filtrarAniversariantes, formatarData } from '../data/utils'

function Bloco({ titulo, icon: Icon, iconColor, children, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      className="bg-white/80 backdrop-blur border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${iconColor}`}>
            <Icon size={18} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">{titulo}</h3>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{badge}</span>
          )}
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function ItemLinha({ icon: Icon, iconClass, texto, subtexto }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon size={13} className={iconClass || 'text-gray-400'} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-700 truncate">{texto}</p>
        {subtexto && <p className="text-[10px] text-gray-400 truncate">{subtexto}</p>}
      </div>
    </div>
  )
}

export default function HomePage({ pessoas, onNavegar }) {
  const { items: anotacoes } = useDatabase('anotacoes')
  const { items: eventos } = useDatabase('eventos')
  const { items: viagensDb } = useDatabase('viagens')
  const { dados: viagensPlanilha } = usePlanilhas('viagens')

  const viagens = useMemo(() => {
    const planilhaItems = viagensPlanilha.map((v, i) => ({ ...v, id: `p-${i}` }))
    return [...viagensDb, ...planilhaItems]
  }, [viagensDb, viagensPlanilha])

  const hoje = new Date()
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

  // Aniversariantes hoje
  const anivHoje = useMemo(() => filtrarAniversariantes(pessoas, 'hoje'), [pessoas])
  const anivSemana = useMemo(() => filtrarAniversariantes(pessoas, 'semana'), [pessoas])

  // Anotações importantes (a fazer)
  const importantes = useMemo(() =>
    anotacoes.filter(a => a.importante && a.status !== 'concluido').slice(0, 4),
    [anotacoes]
  )

  // Próximas viagens (futuras)
  const proximasViagens = useMemo(() =>
    viagens
      .filter(v => v.dataIda && v.dataIda >= hojeStr)
      .sort((a, b) => (a.dataIda || '').localeCompare(b.dataIda || ''))
      .slice(0, 4),
    [viagens, hojeStr]
  )

  // Próximos eventos
  const proximosEventos = useMemo(() =>
    eventos
      .filter(e => e.data && e.data >= hojeStr)
      .sort((a, b) => (a.data || '').localeCompare(b.data || ''))
      .slice(0, 4),
    [eventos, hojeStr]
  )

  // Anotações em andamento
  const emAndamento = useMemo(() =>
    anotacoes.filter(a => a.status === 'em_andamento').slice(0, 3),
    [anotacoes]
  )

  const saudacao = () => {
    const h = hoje.getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{saudacao()} 👋</h2>
        <p className="text-sm text-gray-400 mt-1">
          {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Grid de blocos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Aniversariantes */}
        <Bloco titulo="Aniversariantes" icon={Cake} iconColor="bg-amber-400" onClick={() => onNavegar('aniversarios')}
          badge={anivHoje.length > 0 ? `${anivHoje.length} hoje!` : null}>
          {anivHoje.length > 0 ? (
            anivHoje.slice(0, 3).map((p, i) => (
              <ItemLinha key={i} icon={Cake} iconClass="text-amber-500" texto={`🎉 ${p.nome}`} subtexto={p.funcao} />
            ))
          ) : anivSemana.length > 0 ? (
            <>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">Esta semana</p>
              {anivSemana.slice(0, 3).map((p, i) => (
                <ItemLinha key={i} icon={Cake} iconClass="text-amber-400" texto={p.nome} subtexto={`${formatarData(p.dataAniversario)} • ${p.funcao}`} />
              ))}
            </>
          ) : (
            <p className="text-xs text-gray-400">Nenhum aniversariante próximo</p>
          )}
        </Bloco>

        {/* Importantes */}
        <Bloco titulo="Importantes" icon={AlertTriangle} iconColor="bg-red-500" onClick={() => onNavegar('anotacoes')}
          badge={importantes.length > 0 ? importantes.length : null}>
          {importantes.length > 0 ? (
            importantes.map((a, i) => (
              <ItemLinha key={i} icon={AlertTriangle} iconClass="text-red-500" texto={a.titulo} subtexto={a.conteudo?.slice(0, 50)} />
            ))
          ) : (
            <p className="text-xs text-gray-400">Nenhuma tarefa importante pendente 🎉</p>
          )}
        </Bloco>

        {/* Próximas viagens */}
        <Bloco titulo="Próximas Viagens" icon={Plane} iconColor="bg-purple-500" onClick={() => onNavegar('viagens')}>
          {proximasViagens.length > 0 ? (
            proximasViagens.map((v, i) => (
              <ItemLinha key={i} icon={Plane} iconClass="text-purple-500"
                texto={`${(v.viajante || '').split(' ')[0]} → ${v.destino || '?'}`}
                subtexto={v.dataIda ? new Date(v.dataIda + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''} />
            ))
          ) : (
            <p className="text-xs text-gray-400">Nenhuma viagem programada</p>
          )}
        </Bloco>

        {/* Próximos eventos */}
        <Bloco titulo="Próximos Eventos" icon={PartyPopper} iconColor="bg-blue-500" onClick={() => onNavegar('eventos')}>
          {proximosEventos.length > 0 ? (
            proximosEventos.map((e, i) => (
              <ItemLinha key={i} icon={CalendarDays} iconClass="text-blue-500"
                texto={e.titulo}
                subtexto={`${e.data ? new Date(e.data + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''} ${e.horario ? `• ${e.horario}` : ''}`} />
            ))
          ) : (
            <p className="text-xs text-gray-400">Nenhum evento próximo</p>
          )}
        </Bloco>

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <Bloco titulo="Em Andamento" icon={StickyNote} iconColor="bg-blue-400" onClick={() => onNavegar('anotacoes')}>
            {emAndamento.map((a, i) => (
              <ItemLinha key={i} icon={Clock} iconClass="text-blue-400" texto={a.titulo} subtexto={a.conteudo?.slice(0, 50)} />
            ))}
          </Bloco>
        )}
      </div>
    </div>
  )
}
