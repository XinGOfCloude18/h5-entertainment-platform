import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notification'

const messages = [
  { id: 'n1', type: 'system', read: false },
  { id: 'n2', type: 'system', read: true },
  { id: 'n3', type: 'activity', read: false }
]

function storeWithMessages(list) {
  localStorage.setItem('notifications', JSON.stringify(list))
  setActivePinia(createPinia())
  return useNotificationStore()
}

describe('stores/notification', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('initializes empty when localStorage has nothing', () => {
    const store = useNotificationStore()
    expect(store.messages).toEqual([])
    expect(store.unreadCount).toBe(0)
  })

  it('hydrates messages from localStorage', () => {
    const store = storeWithMessages(messages)
    expect(store.messages).toHaveLength(3)
    expect(store.unreadCount).toBe(2)
  })

  it('discards legacy mock messages with ids m1-m8', () => {
    const store = storeWithMessages([{ id: 'm1', type: 'system', read: false }])
    expect(store.messages).toEqual([])
    expect(localStorage.getItem('notifications')).toBeNull()
  })

  it('markAsRead() marks one message and persists it', () => {
    const store = storeWithMessages(messages)
    store.markAsRead('n1')

    expect(store.messages.find(m => m.id === 'n1').read).toBe(true)
    expect(store.unreadCount).toBe(1)
    const persisted = JSON.parse(localStorage.getItem('notifications'))
    expect(persisted.find(m => m.id === 'n1').read).toBe(true)
  })

  it('markAsRead() ignores unknown ids', () => {
    const store = storeWithMessages(messages)
    store.markAsRead('missing')
    expect(store.unreadCount).toBe(2)
  })

  it('markAllAsRead() clears the unread count', () => {
    const store = storeWithMessages(messages)
    store.markAllAsRead()

    expect(store.unreadCount).toBe(0)
    expect(JSON.parse(localStorage.getItem('notifications')).every(m => m.read)).toBe(true)
  })

  it('deleteMessage() removes a message and persists it', () => {
    const store = storeWithMessages(messages)
    store.deleteMessage('n3')

    expect(store.messages.map(m => m.id)).toEqual(['n1', 'n2'])
    expect(JSON.parse(localStorage.getItem('notifications'))).toHaveLength(2)
  })

  it('getMessagesByType() returns all messages for "all" and filters otherwise', () => {
    const store = storeWithMessages(messages)

    expect(store.getMessagesByType('all')).toHaveLength(3)
    expect(store.getMessagesByType('system').map(m => m.id)).toEqual(['n1', 'n2'])
    expect(store.getMessagesByType('unknown')).toEqual([])
  })

  it('getUnreadByType() filters unread by type', () => {
    const store = storeWithMessages(messages)

    expect(store.getUnreadByType('all').map(m => m.id)).toEqual(['n1', 'n3'])
    expect(store.getUnreadByType('system').map(m => m.id)).toEqual(['n1'])
  })
})
