import { jwtDecode } from 'jwt-decode'
import AsyncStorage from '@react-native-async-storage/async-storage'

export class TokenService {
  static async checkTokenExpiration (token: string): Promise<boolean> {
    if (!token) return false

    try {
      const decodedToken: { exp: number } = jwtDecode(token)
      const currentTime = Math.floor(Date.now() / 1000)
      return decodedToken.exp > currentTime
    } catch (error) {
      console.log('Error al decodificar el token:', error)
      return false
    }
  }

  static async getToken (): Promise<string | null> {
    return await AsyncStorage.getItem('token')
  }
}
