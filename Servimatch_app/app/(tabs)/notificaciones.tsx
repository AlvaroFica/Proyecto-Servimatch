import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { obtenerNotificaciones, marcarComoLeidas } from '../../services/notificaciones';
import { useFocusEffect } from '@react-navigation/native';

interface Notificacion {
  id: number;
  mensaje: string;
  leido: boolean;
  tipo: string;
  fecha: string;
}

export default function NotificacionesScreen() {
  const { tokens } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // Se actualiza automáticamente cada vez que entras a la vista
  useFocusEffect(
    useCallback(() => {
      const fetchNotificaciones = async () => {
        if (tokens?.access) {
          try {
            const data = await obtenerNotificaciones(tokens.access);
            setNotificaciones(data);
          } catch (error) {
            console.error('Error al obtener notificaciones:', error);
          }
        }
      };

      fetchNotificaciones();
    }, [tokens?.access])
  );

  const handleMarcarLeidas = async () => {
    if (tokens?.access) {
      await marcarComoLeidas(tokens.access);
      const actualizadas = notificaciones.map((n) => ({ ...n, leido: true }));
      setNotificaciones(actualizadas);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Notificaciones</Title>

      <Button mode="contained" onPress={handleMarcarLeidas} style={styles.boton}>
        Marcar todas como leídas
      </Button>

      {notificaciones.length === 0 ? (
        <Text style={styles.vacio}>No hay notificaciones.</Text>
      ) : (
        notificaciones.map((n, i) => (
          <Card key={i} style={[styles.card, !n.leido && styles.noLeido]}>
            <Card.Content>
              <Title>{n.tipo || 'Notificación'}</Title>
              <Paragraph>{n.mensaje}</Paragraph>
              <Text style={styles.fecha}>{new Date(n.fecha).toLocaleString()}</Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  vacio: {
    textAlign: 'center',
    marginTop: 16,
    color: 'gray',
  },
  boton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  noLeido: {
    backgroundColor: '#e0f7fa',
  },
  fecha: {
    marginTop: 8,
    fontSize: 12,
    color: 'gray',
  },
});
