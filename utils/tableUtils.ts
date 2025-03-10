import { TableCount } from '@/types/tableTypes'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const generateTableGridForZone = (
  tables: TableCount,
  columns: number,
  place: string
): number[][] => {
  const totalTables = Object.entries(tables).find(
    ([zona]) => zona.toLowerCase().trim() === place.toLowerCase().trim()
  )?.[1] ?? 0;
  console.log(tables, columns, place)
  console.log(totalTables)

  if (typeof totalTables !== 'number' || totalTables <= 0) {
    return [];
  }

  const rows = Math.ceil(totalTables / columns);

  return Array.from({ length: rows }, (_, rowIndex) => {
    const start = rowIndex * columns;
    return Array.from(
      { length: Math.min(columns, totalTables - start) },
      (_, i) => start + i + 1
    );
  });
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token')
    return token
  } catch (error) {
    console.log('Error al obtener el token:', error)
    return null
  }
}
