import * as XLSX from 'xlsx'

function findValue(row, ...keys) {
  for (const key of Object.keys(row)) {
    const trimmed = key.trim().toLowerCase()
    if (keys.some(k => trimmed === k.toLowerCase())) return row[key]
  }
  return ''
}

function parseRows(rows) {
  return rows.map(row => {
    const nome = findValue(row, 'Nome e Sobrenome mais usado', 'Nome', 'NOME', 'Funcionario') || ''
    const gerencia = findValue(row, 'GERÊNCIA', 'Gerencia', 'Gerência') || ''
    const dataRaw = findValue(row, 'Data Nascimento', 'Data de Nascimento', 'DataAniversario', 'Data')

    let dataAniversario = ''
    if (typeof dataRaw === 'number') {
      const d = XLSX.SSF.parse_date_code(dataRaw)
      dataAniversario = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
    } else if (dataRaw instanceof Date) {
      dataAniversario = dataRaw.toISOString().split('T')[0]
    } else if (typeof dataRaw === 'string' && dataRaw) {
      const parts = dataRaw.split('/')
      if (parts.length === 3) {
        dataAniversario = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      } else {
        dataAniversario = dataRaw
      }
    }

    return { nome: String(nome).trim(), funcao: String(gerencia).trim(), dataAniversario }
  }).filter(p => p.nome && p.dataAniversario)
}

export async function lerPlanilha(file) {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return parseRows(XLSX.utils.sheet_to_json(sheet))
}

export async function lerPlanilhaDeURL(url) {
  const res = await fetch(url)
  const data = await res.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return parseRows(XLSX.utils.sheet_to_json(sheet))
}
