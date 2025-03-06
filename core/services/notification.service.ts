import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

export const notificationService = {
  async registerForPushNotifications () {
    if (!Device.isDevice) return null
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      })
    })
    const { status } = await Notifications.getPermissionsAsync()
    if (status !== 'granted') {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync()
      if (newStatus !== 'granted') return null
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data
    return token
  },
  async sendNotification (title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250]
      },
      trigger: null
    })
  }
}
