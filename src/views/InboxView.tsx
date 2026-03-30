import { ArrowLeft, MessageCircle } from 'lucide-react'
import type { UserProfile, Message, ThemeTokens } from '@/types'

interface InboxViewProps {
  users: Record<string, UserProfile>
  messages: Record<string, Message[]>
  /** Hide the mirrored thread bucket keyed by the signed-in user (admin welcome uses both u1 and self). */
  currentUserId: string
  onSelectChat: (userId: string) => void
  onBack: () => void
  theme: ThemeTokens
}

export function InboxView({ users, messages, currentUserId, onSelectChat, onBack, theme }: InboxViewProps) {
  const activeConversations = Object.keys(messages).filter(
    (id) =>
      id !== currentUserId &&
      (messages[id]?.length ?? 0) > 0 &&
      Boolean(users[id]),
  )
  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text}`}>
      <div className={`px-4 py-3 border-b ${theme.border} flex items-center gap-3`}>
        <button onClick={onBack} className={`p-1 -ml-2 ${theme.text}`}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">Nachrichten</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeConversations.length === 0 ? (
          <div className={`p-8 text-center ${theme.textSec}`}>
            <MessageCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p>Keine Nachrichten vorhanden.</p>
          </div>
        ) : (
          activeConversations.map((userId) => {
            const user = users[userId]!
            const convMessages = messages[userId]
            const lastMsg = convMessages[convMessages.length - 1]
            return (
              <div
                key={userId}
                onClick={() => onSelectChat(userId)}
                className={`flex items-center gap-4 p-4 border-b ${theme.border} active:opacity-70 cursor-pointer`}
              >
                <img
                  src={user.avatar || '/favicon.svg'}
                  className="w-12 h-12 rounded-full object-cover bg-gray-100"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold truncate">{user.name}</h3>
                    <span className={`text-xs ${theme.textSec}`}>{lastMsg.timestamp}</span>
                  </div>
                  <p className={`text-sm ${theme.textSec} truncate`}>
                    {lastMsg.senderId === userId ? '' : 'Du: '}
                    {lastMsg.text}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
