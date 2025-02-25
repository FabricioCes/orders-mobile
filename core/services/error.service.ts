import { Alert } from 'react-native';

export class ErrorService {
  static handleError(error: any, context: string) {
    console.error(`Error en ${context}:`, error);
    Alert.alert('Error', `Ocurrió un error en ${context}. Por favor, inténtalo de nuevo.`);
  }
}