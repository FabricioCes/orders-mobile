export default function generateUUID () {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    }
  )
  return uuid
}

export const uuidEntero = () => {
  const timestamp = Date.now(); // Milisegundos desde 1970
  const random = Math.floor(Math.random() * 1000000); // Rango de 0 a 999,999
  return Number(`${timestamp}${random.toString().padStart(6, '0')}`);
};