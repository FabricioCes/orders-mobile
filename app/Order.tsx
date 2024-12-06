import { View, Text } from 'react-native';
import React from 'react';
import Menu from './orders/Menu';
import { useLocalSearchParams } from 'expo-router';

export default function Order() {

  const {tableId, place} = useLocalSearchParams();

  return (
    <View>
      <Text className='text-xl text-center p-5'>{`Mesa ${tableId}, ${place}`}</Text>
      <Menu />
    </View>
  );
}