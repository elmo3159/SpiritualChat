/**
 * チャットメッセージの型定義
 */

export interface ChatMessage {
  id: string
  chat_room_id: string
  sender_type: 'user' | 'fortune_teller'
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

export interface ChatRoom {
  id: string
  user_id: string
  fortune_teller_id: string
  created_at: string
  updated_at: string
}

/**
 * チャット画面で表示するメッセージ
 */
export interface ChatMessageDisplay {
  id: string
  content: string
  sender_type: 'user' | 'fortune_teller'
  created_at: string
  sender_name?: string
  sender_avatar?: string
}

/**
 * データベースのメッセージをDisplay形式に変換
 */
export function toChatMessageDisplay(
  message: ChatMessage,
  senderName?: string,
  senderAvatar?: string
): ChatMessageDisplay {
  return {
    id: message.id,
    content: message.content,
    sender_type: message.sender_type,
    created_at: message.created_at,
    sender_name: senderName,
    sender_avatar: senderAvatar,
  }
}
