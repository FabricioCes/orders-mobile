import { View, Text } from 'react-native'
import React from 'react'
import { SettingsProvider } from '@/context/SettingsContext'
import { NavigationContainer } from '@react-navigation/native'
import { OrderProvider } from '@/context/OrderContext'
import { ProductsProvider } from '@/context/ProductsContext'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <ProductsProvider>
                <OrderProvider>
                    {children}
                </OrderProvider>
            </ProductsProvider>
        </SettingsProvider>
    )
}