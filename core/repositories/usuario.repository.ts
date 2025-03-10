import { getBaseUrl } from '@/core/services/config'
import { ApiResponse } from '@/types/types'
import { UsuarioDto } from '@/types/usuarioTypes';
import { getToken } from '@/utils/tableUtils'

export default class UsuarioApiRepository {
  private static async handleRequest<T>(
    endpoint: string,
    init?: RequestInit,
    requireToken: boolean = true
  ): Promise<T> {
    // Definir headers base
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(Array.isArray(init?.headers) ? Object.fromEntries(init.headers) : init?.headers instanceof Headers ? Object.fromEntries(init.headers.entries()) : init?.headers)
    };

    // Solo incluir el token si es requerido
    if (requireToken) {
      let token: string | null = await getToken();
      if (!token) {
        throw new Error("No se encontró un token válido. Inicie sesión nuevamente.");
      }
      headers.Authorization = `Bearer ${token}`;
    }

    const baseUrl = await getBaseUrl();
    const url = `${baseUrl}/${endpoint}`;

    try {
      const response = await fetch(url, {
        ...init,
        headers
      });

      if (!response.ok) {
        const errorText = (await response.text()).trim() || "Sin contenido";
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        throw new Error("La respuesta del servidor está vacía.");
      }

      const data: ApiResponse<T> = JSON.parse(responseText);

      if (data.error) {
        throw new Error(data.mensaje || "Error en la respuesta de la API");
      }

      return data.resultado;
    } catch (error) {
      console.error("Error in handleRequest:", error);
      throw new Error("Error al procesar la solicitud: " + (error as Error).message);
    }
  }

  // Al llamar a este método, se indica que no se requiere token para el endpoint "usuario"
  static async getUsuarios(): Promise<UsuarioDto[]> {
    try {
      const result = await this.handleRequest<UsuarioDto[]>("usuario", undefined, false);
      return result;
    } catch (error) {
      throw new Error("No se pudieron obtener los usuarios: " + (error as Error).message);
    }
  }
}
