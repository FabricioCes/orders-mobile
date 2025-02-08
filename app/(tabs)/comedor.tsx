import Tables from '@/app/screens/tables-screen';
import { useSettings } from '@/context/SettingsContext';

export default function ZoneScreen() {

  const { zonas } = useSettings();
  return <Tables qty={zonas["comedor"]} place="comedor" />;

}