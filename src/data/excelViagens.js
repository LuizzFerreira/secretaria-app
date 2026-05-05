import * as XLSX from 'xlsx'

function findValue(row, ...keys) {
  for (const key of Object.keys(row)) {
    const trimmed = key.trim().toLowerCase()
    if (keys.some(k => trimmed.includes(k.toLowerCase()))) return row[key]
  }
  return ''
}

function parseDate(val) {
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

function parseRows(rows) {
  return rows.map(row => {
    const viajante = String(findValue(row, 'viajante', 'nome', 'passageiro', 'colaborador') || '').trim()
    const destino = String(findValue(row, 'destino', 'cidade destino', 'para') || '').trim()
    if (!viajante || !destino) return null

    return {
      viajante,
      cargo: String(findValue(row, 'cargo', 'gerência', 'gerencia', 'área') || '').trim(),
      origem: String(findValue(row, 'origem', 'cidade origem', 'de') || '').trim(),
      destino,
      motivoViagem: String(findValue(row, 'motivo', 'objetivo', 'finalidade') || '').trim(),
      dataIda: parseDate(findValue(row, 'ida', 'data ida', 'saída', 'saida', 'partida')),
      dataVolta: parseDate(findValue(row, 'volta', 'data volta', 'retorno', 'chegada')),
      vooIda: String(findValue(row, 'voo ida', 'vôo ida', 'nº voo ida') || '').trim(),
      ciaIda: String(findValue(row, 'cia ida', 'companhia ida') || '').trim(),
      horarioIda: String(findValue(row, 'horário ida', 'horario ida', 'hora ida') || '').trim(),
      aeroportoIda: String(findValue(row, 'aeroporto ida') || '').trim(),
      vooVolta: String(findValue(row, 'voo volta', 'vôo volta', 'nº voo volta') || '').trim(),
      ciaVolta: String(findValue(row, 'cia volta', 'companhia volta') || '').trim(),
      horarioVolta: String(findValue(row, 'horário volta', 'horario volta', 'hora volta') || '').trim(),
      aeroportoVolta: String(findValue(row, 'aeroporto volta') || '').trim(),
      hotel: String(findValue(row, 'hotel', 'hospedagem', 'alojamento') || '').trim(),
      enderecoHotel: String(findValue(row, 'endereço hotel', 'endereco hotel', 'endereço') || '').trim(),
      checkIn: parseDate(findValue(row, 'check-in', 'checkin', 'check in')),
      checkOut: parseDate(findValue(row, 'check-out', 'checkout', 'check out')),
      reservaHotel: String(findValue(row, 'reserva', 'nº reserva', 'código reserva') || '').trim(),
      status: 'planejada',
      observacoes: String(findValue(row, 'observação', 'observações', 'obs', 'nota') || '').trim(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }
  }).filter(Boolean)
}

export async function lerViagensDeArquivo(file) {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return parseRows(XLSX.utils.sheet_to_json(sheet))
}
