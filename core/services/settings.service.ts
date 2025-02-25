import AsyncStorage from '@react-native-async-storage/async-storage'

export class SettingsService {
  static async saveSettings (settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(settings))
    } catch (error) {
      console.log('Error al guardar en AsyncStorage:', error)
    }
  }

  static async loadSettings (): Promise<any> {
    try {
      const storedSettings = await AsyncStorage.getItem('settings')
      return storedSettings ? JSON.parse(storedSettings) : null
    } catch (error) {
      console.log('Error al cargar datos de AsyncStorage:', error)
      return null
    }
  }
}
