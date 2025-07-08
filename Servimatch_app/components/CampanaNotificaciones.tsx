import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { obtenerNotificaciones } from '../services/notificaciones';
import { useAuth } from '../context/AuthContext';

export default function CampanaNotificaciones() {
  const { tokens } = useAuth();
  const router = useRouter();
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    if (tokens?.access) {
      obtenerNotificaciones(tokens.access).then((notificaciones) => {
        const noLeidas = notificaciones.filter((n: any) => !n.leido).length;
        setCantidad(noLeidas);
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <IconButton
        icon="bell-outline"
        onPress={() => router.push('/solicitudes/notificaciones')}
      />
      {cantidad > 0 && (
        <Badge visible style={styles.badge}>
          {cantidad}
        </Badge>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});
