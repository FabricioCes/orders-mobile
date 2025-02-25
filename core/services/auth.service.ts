// services/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'
import { ErrorService } from './error.service'

export class AuthService {

  static async login (
    username: string,
    password: string,
    apiUrl: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${apiUrl}/autenticacion/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: username, clave: password })
      })

      const data = await response.json()

      if (!response.ok) {
        Alert.alert(
          `No se pudo conectar con la base de datos: ${response.status}`
        )
        return false
      }

      if (response.ok && data.resultado) {
        await AsyncStorage.setItem('token', data.resultado)
        await AsyncStorage.setItem('isLogin', 'true')
        await AsyncStorage.setItem('userName', username)
        return true
      } else {
        Alert.alert('Error iniciando sesión')
        return false
      }
    } catch (error) {
      ErrorService.handleError(error, 'Error de red o servidor');
      return false
    }
  }

  static async logout (): Promise<void> {
    try {
      await AsyncStorage.removeItem('isLogin')
      await AsyncStorage.removeItem('token')
    } catch (error) {
      ErrorService.handleError(error,'Error al cerrar sesión:' )
    }
  }

  static async isLogin(): Promise<boolean> {
    return await AsyncStorage.getItem("isLogin") === 'true';

  }
}
