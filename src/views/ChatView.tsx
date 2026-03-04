import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Smile } from 'lucide-react'
import { DeleteKeyIcon } from '@/components/DeleteKeyIcon'
import type { Message, UserProfile, ThemeTokens } from '@/types'

interface ChatViewProps {
  partner: UserProfile
  messages: Message[]
  currentUserId: string
  onSend: (text: string) => void
  onBack: () => void
  theme: ThemeTokens
}

export function ChatView({ partner, messages, currentUserId, onSend, onBack, theme }: ChatViewProps) {
  const [inputText, setInputText] = useState('')
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const emojis = ['😊', '😂', '❤️', '👍', '🍎', '🥕', '🌻', '👋', '🎉', '🔥', '🤔', '👀', '✨', '😋', '🧑‍🌾']

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showKeyboard, showEmojiPicker])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    onSend(inputText)
    setInputText('')
  }

  const handleKeyPress = (key: string) => setInputText((prev) => prev + key.toLowerCase())
  const handleDelete = () => setInputText((prev) => prev.slice(0, -1))
  const handleEmojiClick = (emoji: string) => setInputText((prev) => prev + emoji)

  return (
    <div className={`h-full flex flex-col ${theme.bg}`}>
      <div className={`px-4 py-3 border-b ${theme.border} flex items-center gap-3 shadow-sm z-10 ${theme.card}`}>
        <button onClick={onBack} className={`p-1 -ml-2 ${theme.text}`}>
          <ArrowLeft size={24} />
        </button>
        <img src={partner.avatar} className="w-8 h-8 rounded-full object-cover" alt={partner.name} />
        <div>
          <h3 className={`font-bold text-sm leading-tight ${theme.text}`}>{partner.name}</h3>
          <p className={`text-[10px] ${theme.textSec}`}>Online</p>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme.bg === 'bg-[#0D1A15]' ? 'bg-[#0D1A15]' : 'bg-[#E5E5E5]'}`}
        onClick={() => {
          setShowKeyboard(false)
          setShowEmojiPicker(false)
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-[#4A5D4E] text-white rounded-tr-none' : `${theme.card} ${theme.text} rounded-tl-none`}`}
              >
                <p>{msg.text}</p>
                <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-white/70' : theme.textSec}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-3 border-t ${theme.border} ${theme.card} relative z-20`}>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker)
              setShowKeyboard(false)
            }}
            className={`p-2 rounded-full hover:bg-gray-100 ${theme.textSec} transition-colors`}
          >
            <Smile size={24} />
          </button>
          <input
            className={`flex-1 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] ${theme.input}`}
            placeholder="Nachricht schreiben..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => {
              setShowKeyboard(true)
              setShowEmojiPicker(false)
            }}
          />
          <button
            type="submit"
            className="bg-[#C29901] text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
            disabled={!inputText.trim()}
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>

        {showEmojiPicker && (
          <div
            className={`grid grid-cols-8 gap-2 p-2 animate-in slide-in-from-bottom duration-200 border-t ${theme.border}`}
          >
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-2xl hover:bg-gray-100 p-1 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {showKeyboard && (
        <div className="bg-[#D1D5DB] p-1 pb-6 animate-in slide-in-from-bottom duration-300 z-50 select-none">
          <div className="flex justify-center gap-1 mb-2 pt-2">
            {['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'].map((k) => (
              <button
                key={k}
                onClick={(e) => {
                  e.preventDefault()
                  handleKeyPress(k)
                }}
                className="bg-white h-10 w-[9%] rounded-md flex items-center justify-center font-medium shadow-sm text-black active:bg-gray-200 active:scale-95 transition-transform"
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1 mb-2 px-4">
            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((k) => (
              <button
                key={k}
                onClick={(e) => {
                  e.preventDefault()
                  handleKeyPress(k)
                }}
                className="bg-white h-10 w-[10%] rounded-md flex items-center justify-center font-medium shadow-sm text-black active:bg-gray-200 active:scale-95 transition-transform"
              >
                {k}
              </button>
            ))}
          </div>
          <div className="flex justify-center gap-1 mb-2 px-2">
            <div className="bg-[#A1A1AA] h-10 w-[14%] rounded-md flex items-center justify-center shadow-sm text-black">
              <ArrowLeft size={20} className="rotate-90" />
            </div>
            {['Y', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => (
              <button
                key={k}
                onClick={(e) => {
                  e.preventDefault()
                  handleKeyPress(k)
                }}
                className="bg-white h-10 w-[9%] rounded-md flex items-center justify-center font-medium shadow-sm text-black active:bg-gray-200 active:scale-95 transition-transform"
              >
                {k}
              </button>
            ))}
            <button
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-[#A1A1AA] h-10 w-[14%] rounded-md flex items-center justify-center shadow-sm text-black active:bg-gray-400 active:scale-95 transition-transform"
            >
              <DeleteKeyIcon />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-2 px-2">
            <div className="bg-[#A1A1AA] h-10 w-[12%] rounded-md flex items-center justify-center font-medium shadow-sm text-black text-xs">
              123
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleKeyPress(' ')
              }}
              className="bg-white h-10 flex-1 rounded-md flex items-center justify-center shadow-sm text-black text-xs active:bg-gray-200"
            >
              Leertaste
            </button>
            <button
              className="bg-[#3B82F6] h-10 w-[24%] rounded-md flex items-center justify-center font-medium shadow-sm text-white text-sm active:scale-95 transition-transform"
              onClick={(e) => {
                e.preventDefault()
                setShowKeyboard(false)
              }}
            >
              Fertig
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
