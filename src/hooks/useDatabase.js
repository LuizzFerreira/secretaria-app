import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Mapeia campos camelCase do front para snake_case do banco
const toSnake = (obj) => {
  const map = {
    criadoEm: 'criado_em',
    atualizadoEm: 'atualizado_em',
    motivoViagem: 'motivo_viagem',
    dataIda: 'data_ida',
    dataVolta: 'data_volta',
    vooIda: 'voo_ida',
    ciaIda: 'cia_ida',
    horarioIda: 'horario_ida',
    aeroportoIda: 'aeroporto_ida',
    vooVolta: 'voo_volta',
    ciaVolta: 'cia_volta',
    horarioVolta: 'horario_volta',
    aeroportoVolta: 'aeroporto_volta',
    enderecoHotel: 'endereco_hotel',
    checkIn: 'check_in',
    checkOut: 'check_out',
    reservaHotel: 'reserva_hotel',
  }
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = map[key] || key
    // Não enviar campos vazios de data como string vazia (Supabase espera null)
    if ((snakeKey === 'data_ida' || snakeKey === 'data_volta' || snakeKey === 'check_in' || snakeKey === 'check_out' || snakeKey === 'data') && value === '') {
      result[snakeKey] = null
    } else {
      result[snakeKey] = value
    }
  }
  return result
}

// Mapeia campos snake_case do banco para camelCase do front
const toCamel = (obj) => {
  const map = {
    criado_em: 'criadoEm',
    atualizado_em: 'atualizadoEm',
    motivo_viagem: 'motivoViagem',
    data_ida: 'dataIda',
    data_volta: 'dataVolta',
    voo_ida: 'vooIda',
    cia_ida: 'ciaIda',
    horario_ida: 'horarioIda',
    aeroporto_ida: 'aeroportoIda',
    voo_volta: 'vooVolta',
    cia_volta: 'ciaVolta',
    horario_volta: 'horarioVolta',
    aeroporto_volta: 'aeroportoVolta',
    endereco_hotel: 'enderecoHotel',
    check_in: 'checkIn',
    check_out: 'checkOut',
    reserva_hotel: 'reservaHotel',
  }
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = map[key] || key
    result[camelKey] = value ?? ''
  }
  return result
}

export function useDatabase(table) {
  const [items, setItems] = useState([])

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('criado_em', { ascending: false })
    if (!error && data) {
      setItems(data.map(toCamel))
    }
  }, [table])

  useEffect(() => {
    fetchItems()

    // Realtime subscription
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        fetchItems()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, fetchItems])

  const insert = async (data) => {
    const { id, ...rest } = toSnake(data)
    const { error } = await supabase.from(table).insert(rest)
    if (!error) fetchItems()
  }

  const update = async (id, data) => {
    const snakeData = toSnake(data)
    delete snakeData.id
    const { error } = await supabase.from(table).update(snakeData).eq('id', id)
    if (!error) fetchItems()
  }

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) fetchItems()
  }

  return { items, insert, update, remove }
}
