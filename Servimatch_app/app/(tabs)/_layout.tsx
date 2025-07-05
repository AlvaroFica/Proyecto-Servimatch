import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import CustomTabIcon from '@/components/CustomTabIcon';

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
              badgeCount={5}
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
          tabBarItemStyle: { display: 'none' }, // Ocultar sin dejar espacio
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
  floatingTab: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  zIndex: 10,
  position: 'absolute',
  top: -20, // 🔼 sobresale por encima del tab bar
},

});
