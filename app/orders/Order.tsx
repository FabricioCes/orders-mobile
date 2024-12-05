import { View, Text } from 'react-native'
import React from 'react'
import Menu from './Menu'
import { OrderTable } from '@/types/types'



export default function Order({tableId, place} : OrderTable) {
  return (
    <View>
      <Text>{tableId}, {place}</Text>
     <Menu/>
    </View>
  )
}