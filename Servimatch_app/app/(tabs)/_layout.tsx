import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import CustomTabIcon from '@/components/CustomTabIcon';

import { obtenerNotificaciones } from '@/services/notificaciones';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { tokens } = useAuth();

  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  useEffect(() => {
    if (!tokens?.access) return;

    const fetchNotificaciones = async () => {
      try {
        const notificaciones = await obtenerNotificaciones(tokens.access);
        const noLeidas = notificaciones.filter((n: { leido: boolean }) => !n.leido).length;
        setNotificacionesNoLeidas(noLeidas);
      } catch (error) {
        console.error('Error al obtener notificaciones:', error);
      }
    };

    fetchNotificaciones();

    const interval = setInterval(fetchNotificaciones, 4000); // actualizar cada 15 segundos
    return () => clearInterval(interval);
  }, [tokens]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.onPrimary,
        tabBarInactiveTintColor: theme.colors.primary,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.background,
            height: 40 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 4,
            elevation: 12,
            shadowColor: theme.colors.backdrop,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
          },
        ],
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -5,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabIcon name="home" color={color} size={size} focused={focused} />
          ),
          tabBarItemStyle: styles.tabItem,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarInactiveBackgroundColor: 'transparent',
        }}
      />

      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabIcon
              name="notifications"
              color={color}
              size={size}
              focused={focused}
              badgeCount={notificacionesNoLeidas}
            />
          ),
          tabBarItemStyle: styles.tabItem,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarInactiveBackgroundColor: 'transparent',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabIcon name="search" color={color} size={size} focused={focused} />
          ),
          tabBarItemStyle: styles.tabItem,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarInactiveBackgroundColor: 'transparent',
        }}
      />

      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabIcon
              name="leaderboard"
              type="material"
              color={color}
              size={24}
              focused={focused}
              badgeCount={5} // Este puede ser dinámico si tienes lógica para él
            />
          ),
          tabBarItemStyle: styles.tabItem,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarInactiveBackgroundColor: 'transparent',
        }}
      />

      <Tabs.Screen
        name="MapaTrabajadoresScreen"
        options={{
          title: 'Mapa',
          tabBarItemStyle: { display: 'none' },
        }}
      />

      <Tabs.Screen
        name="CuentaScreen"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size, focused }) => (
            <CustomTabIcon name="person-circle" color={color} size={size} focused={focused} />
          ),
          tabBarItemStyle: styles.tabItem,
          tabBarActiveBackgroundColor: theme.colors.primary,
          tabBarInactiveBackgroundColor: 'transparent',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
  },
  tabItem: {
    marginHorizontal: 12,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
