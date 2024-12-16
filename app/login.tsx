import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { router } from 'expo-router';

export default function Login() {

  const [user, setUser] = useState<string>("");
  const [pswd, setPswd] = useState<string>("");

  const {login} = useSettings();

  const handleLogin = () => {
    login(user, pswd);
    router.replace('/(tabs)')
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Usuario</Text>
      <TextInput style={styles.input} placeholder="Ingrese su usuario" onChangeText={setUser}/>
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su contraseña"
        secureTextEntry
        onChangeText={setPswd}
      />
      <TouchableOpacity className='p-4 rounded-md bg-blue-500' onPress={() => handleLogin()}>
        <Text className='text-white font-bold text-xl'>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Fondo claro
    padding: 16,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 25,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151', // Gris oscuro
  },
  input: {
    width:320,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB', // Gris claro
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF', // Blanco
    color: '#111827', // Texto oscuro
  },
});