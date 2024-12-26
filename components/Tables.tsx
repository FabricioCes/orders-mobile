import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, useWindowDimensions, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Table } from '@/types/types';
import { router } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import { useTable } from '@/context/TablesContext';


export default function Tables({ qty, place }: Table) {
  const { width } = useWindowDimensions();
  const { hasUser, checkTokenExpiration, settings } = useSettings();
  const { activeTables, getActiveTables } = useTable(); // Obtener mesas activas del contexto

  const isTablet = width >= 768;
  const columns = isTablet ? 9 : 3;

  // Dividir mesas en filas
  const tables = Array.from({ length: qty }, (_, i) => i + 1); // Generar mesas como números
  const rows = [];
  for (let i = 0; i < tables.length; i += columns) {
    rows.push(tables.slice(i, i + columns));
  }

  // Actualizar mesas activas al montar el componente
  useEffect(() => {
    getActiveTables();
  }, []);

  const handlePress = (tableId: number) => {
    
    if (hasUser) {
      checkTokenExpiration();
      router.navigate({
        pathname: '/Order',
        params: { tableId: tableId, place: place },
      });
    }else if(!settings){
      Alert.alert(
        "Oops! 🤚🏼",
        "Debes configurar la IP",
        [
          {
            text: "Aceptar",
            onPress: () => {
              router.navigate("/settings");
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "Oops! 🤚🏼",
        "Debes Iniciar Sesión 👤",
        [
          {
            text: "Aceptar",
            onPress: () => {
              router.navigate("/login");
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  // Comprobar si la mesa está activa
  const isTableActive = (tableId: number) => {
    return activeTables.some((table) => table.numeroMesa === tableId);
  };

  return (
    <View className="container p-5">
      {/* ScrollView para desplazamiento */}
      <ScrollView contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex flex-row justify-center mb-4">
            {row.map((table) => (
              <TouchableOpacity
                key={table}
                onPress={() => handlePress(table)}
                className={`p-4 rounded-lg flex justify-center items-center w-24 h-24 mx-2 ${
                  isTableActive(table) ? "bg-red-400/80" : "bg-blue-400/80"
                }`}
              >
                <FontAwesome5
                  name="chair"
                  color={isTableActive(table) ? "#b91c1c" : "white"}
                  size={24}
                />
                <Text
                  className={`text-center font-medium mt-2 ${
                    isTableActive(table) ? "text-red-700" : "text-white"
                  }`}
                >
                  Mesa {table}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}