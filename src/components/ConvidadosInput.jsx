import { useState } from 'react'
import { Plus, X, Users, Mail } from 'lucide-react'

export default function ConvidadosInput({ emails, onChange }) {
  const [input, setInput] = useState('')

  const adicionar = () => {
    const email = input.trim().toLowerCase()
    if (!email || !email.includes('@')) return
    if (emails.includes(email)) return
    onChange([...emails, email])
    setInput('')
  }

  const remover = (email) => {
    onChange(emails.filter(e => e !== email))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      adicionar()
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
        <Users size={11} />
        Compartilhar com
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="email@exemplo.com"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
        <button
          type="button"
          onClick={adicionar}
          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {emails.map(email => (
            <span key={email} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[11px] font-medium">
              <Mail size={10} />
              {email}
              <button type="button" onClick={() => remover(email)} className="text-blue-400 hover:text-red-500 cursor-pointer">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
