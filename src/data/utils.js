export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { day: d, month: m, year: y }
}

function isSameDay(dateStr, ref) {
  const { day, month } = parseDate(dateStr)
  return day === ref.getDate() && month === ref.getMonth() + 1
}

function getWeekRange(ref) {
  const dayOfWeek = ref.getDay()
  const start = new Date(ref)
  start.setDate(ref.getDate() - dayOfWeek)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

function isInWeek(dateStr, ref) {
  const { day, month } = parseDate(dateStr)
  const { start, end } = getWeekRange(ref)
  const check = new Date(ref.getFullYear(), month - 1, day)
  return check >= start && check <= end
}

function isSameMonth(dateStr, ref) {
  const { month } = parseDate(dateStr)
  return month === ref.getMonth() + 1
}

export function filtrarAniversariantes(lista, filtro) {
  const hoje = new Date()
  switch (filtro) {
    case 'hoje':
      return lista.filter(p => isSameDay(p.dataAniversario, hoje))
    case 'semana':
      return lista.filter(p => isInWeek(p.dataAniversario, hoje))
    case 'mes':
      return lista.filter(p => isSameMonth(p.dataAniversario, hoje))
    default:
      return lista
  }
}

export function getDiaSemana(dateStr) {
  const { day, month } = parseDate(dateStr)
  const d = new Date(new Date().getFullYear(), month - 1, day)
  return d.toLocaleDateString('pt-BR', { weekday: 'long' })
}

export function formatarData(dateStr) {
  const { day, month } = parseDate(dateStr)
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
}

export function getGerenciasUnicas(pessoas) {
  const gerencias = [...new Set(pessoas.map(p => p.funcao).filter(Boolean))]
  return gerencias.sort()
}

export function gerarMensagemParabens(pessoa) {
  const nome = pessoa.nome.split(' ')[0]
  const nomeCapitalizado = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
  return `🎂 Feliz Aniversário, ${nomeCapitalizado}! 🎉\n\nDesejamos a você um dia repleto de alegrias, saúde e muitas realizações!\n\nParabéns! 🥳🎈`
}

export function copiarNomes(pessoas) {
  return pessoas.map(p => p.nome).join('\n')
}

export function gerarTextoExportacao(pessoas, filtroLabel) {
  const hoje = new Date()
  let texto = `Aniversariantes — ${filtroLabel}\n`
  texto += `Gerado em: ${hoje.toLocaleDateString('pt-BR')}\n`
  texto += `${'─'.repeat(40)}\n\n`
  pessoas.forEach(p => {
    texto += `• ${p.nome}`
    if (p.funcao) texto += ` (${p.funcao})`
    texto += ` — ${formatarData(p.dataAniversario)}\n`
  })
  texto += `\nTotal: ${pessoas.length} pessoa(s)`
  return texto
}
