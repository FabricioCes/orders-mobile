import AsyncStorage from "@react-native-async-storage/async-storage";

export const generateTableRows = (tables: number[], columns: number) => {
    const rows = [];
    for (let i = 0; i < tables.length; i += columns) {
      rows.push(tables.slice(i, i + columns));
    }
    return rows;
  };


export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('token')
    return token
  } catch (error) {
    console.error('Error al obtener el token:', error)
    return null
  }
}

