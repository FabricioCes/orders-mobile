import { ZonaService } from "@/core/services/zone.service";

describe('ZonaService', () => {
  it('debería obtener zonas y mesas', async () => {
    const mockResponse = { resultado: { comedor: 10 } };
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockResponse), {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
      }))
    );

    const result = await ZonaService.fetchZonasMesas('http://localhost:5001', 'token123');
    expect(result).toEqual({ comedor: 10 });
  });

  it('debería manejar errores al obtener zonas', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
      }))
    );

    const result = await ZonaService.fetchZonasMesas('http://localhost:5001', 'token123');
    expect(result).toEqual({});
  });
});