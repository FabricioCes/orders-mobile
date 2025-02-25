
import { AuthService } from '@/core/services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería hacer login exitosamente', async () => {
    const mockResponse = { resultado: 'token123' };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        redirected: false,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    );

    const result = await AuthService.login('user', 'pass', 'http://localhost:5001');
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'token123');
  });

  it('debería fallar el login si la respuesta no es ok', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        redirected: false,
        json: () => Promise.resolve({}),
      } as Response)
    );

    const result = await AuthService.login('user', 'pass', 'http://localhost:5001');
    expect(result).toBe(false);
  });
});