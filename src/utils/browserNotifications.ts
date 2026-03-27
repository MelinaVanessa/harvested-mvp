type BrowserNotificationInput = {
  title: string
  body: string
  tag?: string
}

function supportsBrowserNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function ensureBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!supportsBrowserNotifications()) return 'unsupported'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export async function showBrowserNotification(input: BrowserNotificationInput) {
  const permission = await ensureBrowserNotificationPermission()
  if (permission !== 'granted') return

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg?.showNotification) {
        await reg.showNotification(input.title, {
          body: input.body,
          tag: input.tag,
        })
        return
      }
    }
    new Notification(input.title, { body: input.body, tag: input.tag })
  } catch {
    // no-op: keep in-app notifications working
  }
}
