import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Card,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://192.168.1.61:8000';

function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Error decodificando token:', e);
    return {};
  }
}

export default function ChatListScreen() {
  const { tokens } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  const yoId = tokens?.access ? decodeJWT(tokens.access).user_id : null;

  useEffect(() => {
    if (!tokens?.access) return;
    fetch(`${API_BASE_URL}/api/chats/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then((r) => r.json())
      .then(setChats)
      .catch((e) => console.error('Error al cargar chats', e))
      .finally(() => setLoading(false));
  }, [tokens]);

  if (!tokens?.access) {
    return <Text style={{ margin: 20 }}>No autenticado.</Text>;
  }

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 32 }}
        size="large"
        color={theme.colors.primary}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.primary}
          size={24}
          onPress={() => router.back()}
        />

        <Text style={styles.title}>Mis chats</Text>
      </View>

      {chats.map((chat) => {
        const yoEsCliente = chat.cliente.id === yoId;
        const otro = yoEsCliente ? chat.trabajador : chat.cliente;
        const tipo = yoEsCliente ? 'Trabajador' : 'Cliente';

        const cantidadMensajes = chat.no_leidos || 0;

        return (
          <Card
            key={chat.id}
            style={[
              styles.card,
              cantidadMensajes > 0 && { backgroundColor: '#e3f2fd' } // fondo si hay mensajes nuevos
            ]}
            onPress={() => router.push(`/chat/${chat.id}`)}
          >
            <View style={styles.cardContent}>
              <Avatar.Image
                size={40}
                source={
                  otro.foto_perfil
                    ? { uri: `${API_BASE_URL}${otro.foto_perfil}` }
                    : require('../../assets/images/avatar_default.png')
                }
              />
              <View style={styles.infoContainer}>
                <Text
                  style={[
                    styles.nombre,
                    cantidadMensajes > 0 && { fontWeight: 'bold' } // nombre más llamativo
                  ]}
                >
                  {otro.nombre} {otro.apellido}
                </Text>
                <Text style={styles.tipo}>{tipo}</Text>
              </View>
              {cantidadMensajes > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cantidadMensajes}</Text>
                </View>
              )}
            </View>
          </Card>

        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    padding: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipo: {
    fontSize: 13,
    color: '#888',
  },
  badge: {
  backgroundColor: '#ff3b30',
  borderRadius: 12,
  paddingHorizontal: 8,
  paddingVertical: 2,
  position: 'absolute',
  right: 0,
  top: 8,
  minWidth: 24,
  alignItems: 'center',
  justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

});
