import * as XLSX from 'xlsx'

function parseSerialDate(val) {
  if (!val) return ''
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }
  if (typeof val === 'string') {
    const parts = val.split('/')
    if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    return val
  }
  return ''
}

function parseTime(val) {
  if (!val) return ''
  if (typeof val === 'number') {
    // Decimal do Excel (ex: 0.413 = ~9:55)
    const totalMinutes = Math.round(val * 24 * 60)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return String(val).trim()
}

function mapStatus(val) {
  if (!val) return 'planejada'
  const s = String(val).toLowerCase().trim()
  if (s.includes('conclu')) return 'concluida'
  if (s.includes('andamento')) return 'em_andamento'
  if (s.includes('confirm')) return 'confirmada'
  if (s.includes('cancel')) return 'cancelada'
  return 'planejada'
}

function findColumnIndex(headers, ...terms) {
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] || '').toLowerCase().trim()
    if (terms.some(t => h.includes(t.toLowerCase()))) return i
  }
  return -1
}

export async function lerViagensDeArquivo(file) {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)

  const todasViagens = []

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    if (rows.length < 2) continue

    const headers = rows[0].map(h => String(h || '').trim())

    // Verifica se essa sheet tem colunas de viagem
    const iViajante = findColumnIndex(headers, 'viajante', 'nome do viajante', 'passageiro', 'colaborador')
    const iDestino = findColumnIndex(headers, 'destino')
    if (iViajante < 0 || iDestino < 0) continue

    const iGerencia = findColumnIndex(headers, 'gerência', 'gerencia')
    const iEmbarque = findColumnIndex(headers, 'embarque', 'data ida', 'saída', 'ida')
    const iRetorno = findColumnIndex(headers, 'retorno', 'data volta', 'chegada', 'volta')
    const iHotel = findColumnIndex(headers, 'hotel')
    const iMotivo = findColumnIndex(headers, 'motivo')
    const iStatusViagem = findColumnIndex(headers, 'status viagem')

    const ciaCols = []
    const vooCols = []
    const horarioCols = []
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i].toLowerCase()
      if (h === 'cia') ciaCols.push(i)
      if (h === 'voo') vooCols.push(i)
    }

    const iHorarioVoo = findColumnIndex(headers, 'horário do voo', 'horario do voo')
    if (iHorarioVoo >= 0) horarioCols.push(iHorarioVoo)
    const iPartida = findColumnIndex(headers, 'partida')
    if (iPartida >= 0) horarioCols.push(iPartida)

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const viajante = String(row[iViajante] || '').trim()
      const destino = String(row[iDestino] || '').trim()
      if (!viajante || !destino) continue

      todasViagens.push({
        viajante,
        destino,
        cargo: iGerencia >= 0 ? String(row[iGerencia] || '').trim() : '',
        origem: 'Rio de Janeiro',
        dataIda: iEmbarque >= 0 ? parseSerialDate(row[iEmbarque]) : '',
        dataVolta: iRetorno >= 0 ? parseSerialDate(row[iRetorno]) : '',
        ciaIda: ciaCols[0] !== undefined ? String(row[ciaCols[0]] || '').trim() : '',
        vooIda: vooCols[0] !== undefined ? String(row[vooCols[0]] || '').trim() : '',
        horarioIda: horarioCols[0] !== undefined ? parseTime(row[horarioCols[0]]) : '',
        ciaVolta: ciaCols[1] !== undefined ? String(row[ciaCols[1]] || '').trim() : '',
        vooVolta: vooCols[1] !== undefined ? String(row[vooCols[1]] || '').trim() : '',
        horarioVolta: horarioCols[1] !== undefined ? parseTime(row[horarioCols[1]]) : '',
        hotel: iHotel >= 0 ? String(row[iHotel] || '').trim() : '',
        motivoViagem: iMotivo >= 0 ? String(row[iMotivo] || '').trim() : '',
        status: iStatusViagem >= 0 ? mapStatus(row[iStatusViagem]) : 'planejada',
        aeroportoIda: '',
        aeroportoVolta: '',
        enderecoHotel: '',
        checkIn: '',
        checkOut: '',
        reservaHotel: '',
        observacoes: '',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })
    }
  }

  return todasViagens
}
