import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCompartilhamentos(tipo, itemId) {
  const [convidados, setConvidados] = useState([])
  const { user } = useAuth()

  const fetch = useCallback(async () => {
    if (!user || !itemId) return
    const { data, error } = await supabase
      .from('compartilhamentos')
      .select('*')
      .eq('tipo', tipo)
      .eq('item_id', itemId)
    if (!error && data) setConvidados(data)
  }, [user, tipo, itemId])

  useEffect(() => { fetch() }, [fetch])

  const compartilhar = async (email) => {
    if (!user || !itemId) return false
    // Verifica se já foi compartilhado
    const existe = convidados.find(c => c.shared_with_email === email.toLowerCase())
    if (existe) return false

    // Tenta encontrar o user_id pelo email
    const { data: userData } = await supabase
      .from('compartilhamentos')
      .select('shared_with_id')
      .eq('shared_with_email', email.toLowerCase())
      .limit(1)

    const { error } = await supabase.from('compartilhamentos').insert({
      tipo,
      item_id: itemId,
      owner_id: user.id,
      shared_with_email: email.toLowerCase(),
      shared_with_id: null,
    })
    if (!error) await fetch()
    return !error
  }

  const removerConvidado = async (id) => {
    const { error } = await supabase.from('compartilhamentos').delete().eq('id', id)
    if (!error) await fetch()
  }

  return { convidados, compartilhar, removerConvidado }
}

// Hook para compartilhar em batch (ao salvar o form)
export function useCompartilharBatch() {
  const { user } = useAuth()

  const compartilharEmBatch = async (tipo, itemId, emails) => {
    if (!user || !itemId || !emails.length) return

    // Busca compartilhamentos existentes
    const { data: existentes } = await supabase
      .from('compartilhamentos')
      .select('shared_with_email')
      .eq('tipo', tipo)
      .eq('item_id', itemId)

    const emailsExistentes = new Set((existentes || []).map(e => e.shared_with_email))

    // Adiciona novos
    const novos = emails
      .filter(email => !emailsExistentes.has(email.toLowerCase()))
      .map(email => ({
        tipo,
        item_id: itemId,
        owner_id: user.id,
        shared_with_email: email.toLowerCase(),
        shared_with_id: null,
      }))

    if (novos.length > 0) {
      await supabase.from('compartilhamentos').insert(novos)
    }

    // Remove os que não estão mais na lista
    const emailsNovos = new Set(emails.map(e => e.toLowerCase()))
    const paraRemover = (existentes || []).filter(e => !emailsNovos.has(e.shared_with_email))
    for (const e of paraRemover) {
      await supabase.from('compartilhamentos').delete()
        .eq('tipo', tipo)
        .eq('item_id', itemId)
        .eq('shared_with_email', e.shared_with_email)
    }
  }

  return { compartilharEmBatch }
}
