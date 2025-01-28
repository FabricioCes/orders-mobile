import Tables from '@/components/Tables';
import { useSettings } from '@/context/SettingsContext';

export default function ZoneScreen() {

  const { zonas } = useSettings();
  return <Tables qty={zonas["express"]} place="express" />;

}