import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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
    dataFim: 'data_fim',
    horarioFim: 'horario_fim',
  }
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = map[key] || key
    if ((snakeKey === 'data_ida' || snakeKey === 'data_volta' || snakeKey === 'check_in' || snakeKey === 'check_out' || snakeKey === 'data' || snakeKey === 'data_fim') && value === '') {
      result[snakeKey] = null
    } else {
      result[snakeKey] = value
    }
  }
  return result
}

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
    data_fim: 'dataFim',
    horario_fim: 'horarioFim',
  }
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = map[key] || key
    result[camelKey] = value ?? ''
  }
  return result
}

let channelCounter = 0

export function useDatabase(table) {
  const [items, setItems] = useState([])
  const { user } = useAuth()
  const channelRef = useRef(null)
  const idRef = useRef(++channelCounter)

  const fetchItems = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('criado_em', { ascending: false })
    if (!error && data) {
      setItems(data.map(toCamel))
    }
  }, [table, user])

  useEffect(() => {
    if (!user) return

    fetchItems()

    const channelName = `${table}-${user.id}-${idRef.current}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        fetchItems()
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, user, fetchItems])

  const insert = async (data) => {
    if (!user) return
    const { id, ...rest } = toSnake(data)
    const { error } = await supabase.from(table).insert({ ...rest, user_id: user.id })
    if (!error) fetchItems()
  }

  const update = async (id, data) => {
    const snakeData = toSnake(data)
    delete snakeData.id
    delete snakeData.user_id
    const { error } = await supabase.from(table).update(snakeData).eq('id', id)
    if (!error) fetchItems()
  }

  const remove = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) fetchItems()
  }

  return { items, insert, update, remove }
}
