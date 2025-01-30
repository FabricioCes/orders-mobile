# Aplicacion para la Gestion de Ordenes de Restaurante

Aplicación móvil para gestión de mesas, pedidos y clientes en establecimientos gastronómicos.

![App Preview](https://via.placeholder.com/300x600/3b82f6/ffffff?text=Demo+App) <!-- Reemplazar con capturas reales -->

## 🚀 Características Principales

- **Gestión de Mesas**
  - Seguimiento en tiempo real del estado de las mesas
  - Sistema de colores para estados (libre, ocupado, pendiente pago)
  - Cronómetro integrado para tiempo de servicio

- **Gestión de Pedidos**
  - Creación de pedidos multi-producto
  - Cálculo automático de totales con descuentos
  - Integración con impresora fiscal (OPCIONAL)

- **Clientes**
  - Búsqueda inteligente por nombre o cédula
  - Historial de pedidos por cliente
  - Multiples métodos de contacto (teléfono, correo)

- **Productos**
  - Catálogo jerárquico (Categoría > Subcategoría)
  - Búsqueda rápida con sugerencias
  - Modificadores y opciones personalizables

- **Seguridad**
  - Autenticación JWT
  - Roles de usuario (Admin, Mesero, Caja)
  - Encriptación de datos sensibles

## 🛠 Stack Tecnológico
| Capa             | Tecnologías                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| **Frontend**      | React Native, Expo, TypeScript, React Navigation                            |
| **Estado**        | Context API, useReducer, react-query                                        |
| **Estilos**       | Tailwind CSS, React Native Reanimated                                       |
| **Utilidades**    | date-fns, react-hook-form, Zod, react-native-vector-icons     
              |
## 📥 Instalación
```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/restaurant-app.git
cd restaurant-app

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Configurar ambiente
cp .env.example .env

# 4. Iniciar aplicación
npx expo start

