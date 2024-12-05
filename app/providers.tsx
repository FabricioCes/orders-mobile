import { View, Text } from 'react-native'
import React from 'react'
import { SettingsProvider } from '@/context/SettingsContext'
import { NavigationContainer } from '@react-navigation/native'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
  
            <SettingsProvider>
                {children}
            </SettingsProvider>
        

    )
}