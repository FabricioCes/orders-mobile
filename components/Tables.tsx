import React from 'react';
import { Text, View, Pressable, ScrollView, useWindowDimensions, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Table } from '@/types/types';
import { router } from 'expo-router';


export default function Tables({ qty, place }: Table) {
    const { width } = useWindowDimensions();

    // Determinar columnas dependiendo del ancho de pantalla
    const isTablet = width >= 768;
    const columns = isTablet ? 9 : 3;

    // Dividir mesas en filas
    const tables = Array.from({ length: qty }, (_, i) => `${i + 1}`);
    const rows = [];
    for (let i = 0; i < tables.length; i += columns) {
        rows.push(tables.slice(i, i + columns));
    }

    const handlePress = (tableId : number) => {
        router.navigate({
            pathname: '/Order',
            params: { tableId: tableId, place: place},
        })
    }

    return (
        <View className="container p-5">
            <View>
                <Text className="text-center font-bold text-2xl">Mesas en {place}</Text>
            </View>
            {/* ScrollView para permitir desplazamiento vertical */}
            <ScrollView contentContainerStyle={{ paddingVertical: 10 }} showsVerticalScrollIndicator={false}>
                {rows.map((row, rowIndex) => (
                    <View
                        key={rowIndex}
                        className="flex flex-row justify-center mb-4"
                    >
                        {row.map((table, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handlePress(parseInt(table))}
                                className="bg-blue-400/80 p-4 rounded-lg flex justify-center items-center w-24 h-24 mx-2"
                            >
                                <FontAwesome5 name="chair" color="white" size={24} />
                                <Text className="text-center font-medium mt-2">Mesa {table}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}