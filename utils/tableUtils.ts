import AsyncStorage from '@react-native-async-storage/async-storage'

export const generateTableRows = (tables: number[], columns: number) => {
  const rows: number[][] = []
  let currentRow: number[] = []

  tables.forEach((table, index) => {
    currentRow.push(table)
    if ((index + 1) % columns === 0) {
      rows.push(currentRow)
      currentRow = []
    }
  })

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token')
    return token
  } catch (error) {
    console.log('Error al obtener el token:', error)
    return null
  }
}
