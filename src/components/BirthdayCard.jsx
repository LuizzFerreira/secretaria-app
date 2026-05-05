import { useState } from 'react'
import { Cake, Mail, Check } from 'lucide-react'
import { formatarData, getDiaSemana, gerarMensagemParabens } from '../data/utils'

export default function BirthdayCard({ pessoa, isToday }) {
  const [copiado, setCopiado] = useState(false)

  const copiarMensagem = async () => {
    const msg = gerarMensagemParabens(pessoa)
    await navigator.clipboard.writeText(msg)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] ${
      isToday
        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-lg shadow-amber-100'
        : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
    }`}>
      <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${
        isToday ? 'bg-amber-400 text-white' : 'bg-blue-100 text-blue-600'
      }`}>
        <Cake size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-800 truncate">
          {pessoa.nome}
          {isToday && <span className="ml-2 text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full">🎉 Hoje!</span>}
        </p>
        <p className="text-sm text-gray-500 truncate">{pessoa.funcao}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{formatarData(pessoa.dataAniversario)}</p>
          <p className="text-xs text-gray-400 capitalize">{getDiaSemana(pessoa.dataAniversario)}</p>
        </div>
        <button
          onClick={copiarMensagem}
          title="Copiar mensagem de parabéns"
          className={`p-2 rounded-lg transition-all cursor-pointer ${
            copiado
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
          }`}
        >
          {copiado ? <Check size={16} /> : <Mail size={16} />}
        </button>
      </div>
    </div>
  )
}
