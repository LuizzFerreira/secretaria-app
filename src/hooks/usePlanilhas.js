import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePlanilhas(tipo) {
  const [planilhas, setPlanilhas] = useState([])
  const [dados, setDados] = useState([])
  const { user } = useAuth()

  const fetch = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('planilhas')
      .select('*')
      .eq('tipo', tipo)
      .order('criado_em', { ascending: false })
    if (!error && data) {
      setPlanilhas(data)
      setDados(data.flatMap(p => p.dados || []))
    }
  }, [user, tipo])

  useEffect(() => { fetch() }, [fetch])

  const adicionar = async (nome, registros) => {
    if (!user) return false
    const { error } = await supabase.from('planilhas').insert({
      nome,
      tipo,
      dados: registros,
      user_id: user.id,
    })
    if (!error) await fetch()
    return !error
  }

  const remover = async (id) => {
    const { error } = await supabase.from('planilhas').delete().eq('id', id)
    if (!error) await fetch()
  }

  return { planilhas, dados, adicionar, remover }
}
