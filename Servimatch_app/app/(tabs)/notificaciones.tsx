import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Button, Card, Paragraph, Title, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { obtenerNotificaciones, marcarComoLeidas } from '../../services/notificaciones';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Notificacion {
  id: number;
  mensaje: string;
  leido: boolean;
  tipo: string;
  fecha: string;
}

export default function NotificacionesScreen() {
  const { tokens } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const fetchNotificaciones = async () => {
    if (tokens?.access) {
      const data = await obtenerNotificaciones(tokens.access);
      setNotificaciones(data);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotificaciones();
    }, [])
  );

  const handleMarcarLeidas = async () => {
    if (tokens?.access) {
      await marcarComoLeidas(tokens.access);
      const actualizadas = notificaciones.map((n) => ({ ...n, leido: true }));
      setNotificaciones(actualizadas);
    }
  };

  return (
    <>
      {/* Barra superior */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Button
          mode="contained"
          onPress={handleMarcarLeidas}
          style={styles.boton}
          buttonColor="#00696E"
          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
        >
          Marcar todas como leídas
        </Button>

        {notificaciones.length === 0 ? (
          <Text style={styles.vacio}>No hay notificaciones.</Text>
        ) : (
          notificaciones.map((n, i) => (
            <Card key={i} style={[styles.card, !n.leido && styles.noLeido]}>
              <Card.Content>
                <Title style={styles.notifTitulo}>Notificación</Title>
                <Paragraph>{n.mensaje}</Paragraph>
                <Text style={styles.fecha}>{new Date(n.fecha).toLocaleString()}</Text>

                <View style={styles.badgeWrapper}>
                  <Text style={styles.badge}>{n.tipo}</Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00696E',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  vacio: {
    textAlign: 'center',
    marginTop: 16,
    color: 'gray',
  },
  boton: {
    marginBottom: 16,
    borderRadius: 24,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  noLeido: {
    backgroundColor: '#e0f7fa',
  },
  fecha: {
    marginTop: 8,
    fontSize: 12,
    color: 'gray',
  },
  badgeWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00696E',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badge: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
});
