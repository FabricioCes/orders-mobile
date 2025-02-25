import { SettingsService } from '@/core/services/settings.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('SettingsService', () => {
  it('debería guardar configuraciones', async () => {
    const settings = { idComputadora: '192.168.1.1' };
    await SettingsService.saveSettings(settings);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('settings', JSON.stringify(settings));
  });

  it('debería cargar configuraciones', async () => {
    const settings = { idComputadora: '192.168.1.1' };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(settings));

    const result = await SettingsService.loadSettings();
    expect(result).toEqual(settings);
  });
});