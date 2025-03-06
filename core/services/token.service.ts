import { jwtDecode } from 'jwt-decode'
import AsyncStorage from '@react-native-async-storage/async-storage'


export class TokenService {
  private static token: string | null = null;

  static async loadToken(): Promise<void> {
    this.token = await AsyncStorage.getItem('token');
  }

  static async checkTokenExpiration(): Promise<boolean> {
    if (!this.token) {
      await this.loadToken();
    }

    if (!this.token) return false;

    try {
      const decodedToken: { exp: number } = jwtDecode(this.token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return false;
    }
  }

  static async getToken(): Promise<string | null> {
    if (!this.token) {
      await this.loadToken();
    }
    return this.token;
  }
}