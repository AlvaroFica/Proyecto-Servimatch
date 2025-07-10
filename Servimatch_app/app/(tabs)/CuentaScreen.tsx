import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Divider,
  List,
  Paragraph,
  Surface,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

export default function CuentaScreen() {
  const { tokens, setIsLoggedIn, setTokens } = useAuth();
  const accessToken = tokens?.access;
  const router = useRouter();
  const theme = useTheme();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const res = await fetch('http://192.168.100.9:8000/api/usuarios/me/',

          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUser(data);
      } catch (e) {
        console.error('Error al obtener perfil:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  if (!accessToken) {
    return (
      <BaseLayout title="Mi cuenta">
        <View style={styles.loader}>
          <Text style={{ color: theme.colors.error }}>No autenticado</Text>
        </View>
      </BaseLayout>
    );
  }

  if (loading) {
    return (
      <BaseLayout title="Mi cuenta">
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  const isTrabajador = user?.es_trabajador === true;
  const avatarUri = user?.foto_perfil ? user.foto_perfil.startsWith('http') ? user.foto_perfil : `http://192.168.100.9:8000${user.foto_perfil}` : null;

  return (
    <BaseLayout title="Mi cuenta">
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 64 }]}>

        <Animated.View style={[styles.userSection, { opacity: fadeAnim }]}>          
          <Surface style={[styles.avatarContainer, { backgroundColor: theme.colors.surface }]}>            
            {avatarUri ? (
              <Avatar.Image size={100} source={{ uri: avatarUri }} />
            ) : (
              <Avatar.Icon size={100} icon="account" />
            )}
          </Surface>
          <Title style={[styles.name, { color: theme.colors.onSurface }]}>            
            {user?.nombre || 'Nombre'} {user?.apellido || 'Apellido'}
          </Title>
          <Paragraph style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>            
            {user?.email || 'user@example.com'}
          </Paragraph>
        </Animated.View>

        <Divider style={styles.divider} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }) }] }}>          
          <Surface style={[styles.sectionContainer, { backgroundColor: theme.colors.surface }]}>            
            <List.Section>
              <List.Subheader style={{ color: theme.colors.onSurfaceVariant, fontSize: 16, fontWeight: '600' }}>
                Cuenta
              </List.Subheader>
              <List.Item                
                title="Editar perfil"
                left={props => <List.Icon {...props} icon="account-edit" color={theme.colors.primary} />}
                onPress={() => router.push('/perfil/editar')}
                style={styles.listItem}
              />
              <List.Item                
                title="Privacidad"
                left={props => <List.Icon {...props} icon="lock" color={theme.colors.primary} />}
                onPress={() => router.push('/configuracion/privacidad')}
                style={styles.listItem}
              />
              <List.Item                
                title="Notificaciones"
                left={props => <List.Icon {...props} icon="bell" color={theme.colors.primary} />}
                onPress={() => router.push('/configuracion/notificaciones')}
                style={styles.listItem}
              />
              <List.Item                
                title="Métodos de pago"
                left={props => <List.Icon {...props} icon="credit-card" color={theme.colors.primary} />}
                onPress={() => router.push('/configuracion/MetodosPago')}
                style={styles.listItem}
              />
            </List.Section>
          </Surface>

          <Divider style={styles.divider} />

          <Surface style={[styles.sectionContainer, { backgroundColor: theme.colors.surface }]}>            
            <List.Section>
              <View style={styles.buttonContainer}>                
                <Button
                  mode="contained"
                  icon="map-marker-radius"
                  onPress={() => router.push('/solicitudes/mapa')}
                  disabled={!isTrabajador}
                  contentStyle={{ height: 48 }}
                  labelStyle={{ fontSize: 16, fontWeight: '600' }}
                  style={[styles.actionButton, { backgroundColor: isTrabajador ? theme.colors.primary : theme.colors.surfaceDisabled }]}
                >
                  Buscar solicitudes
                </Button>
                <Button onPress={() => router.push('/chat/')}>Ver mis chats</Button>

              </View>
              <List.Subheader style={{ color: theme.colors.onSurfaceVariant, fontSize: 16, fontWeight: '600' }}>
                Actividad
              </List.Subheader>
              <List.Item                
                title="Mis solicitudes"
                left={props => <List.Icon {...props} icon="format-list-bulleted" color={theme.colors.primary} />}
                onPress={() => router.push('/solicitudes')}
                style={styles.listItem}
              />
              <List.Item                
                title="Historial"
                left={props => <List.Icon {...props} icon="history" color={theme.colors.primary} />}
                onPress={() => router.push('./historial')}
                style={styles.listItem}
              />
              {isTrabajador && (
                <List.Item                  
                  title="Mis planes"
                  left={props => <List.Icon {...props} icon="file-document-outline" color={theme.colors.primary} />}
                  onPress={() => router.push('/PlanesTrabajadorScreen')}
                  style={styles.listItem}
                />
              )}
            </List.Section>
          </Surface>

          <Divider style={styles.divider} />

          <Surface style={[styles.sectionContainer, { backgroundColor: theme.colors.surface }]}>            
            <List.Section>
              <List.Subheader style={{ color: theme.colors.onSurfaceVariant, fontSize: 16, fontWeight: '600' }}>
                Soporte
              </List.Subheader>
              <List.Item                
                title="Ayuda y soporte"
                left={props => <List.Icon {...props} icon="help-circle-outline" color={theme.colors.primary} />}
                onPress={() => router.push('/configuracion/ayuda')}
                style={styles.listItem}
              />
            </List.Section>
          </Surface>

          <Divider style={styles.divider} />

          <Surface style={[styles.sectionContainer, { backgroundColor: theme.colors.surface }]}>            
            <Button
              mode="contained"
              icon="logout"
              onPress={() => {
                setTokens(null);
                setIsLoggedIn(false);
                router.replace('./index');
              }}
              style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
              contentStyle={styles.logoutContent}
              labelStyle={{ fontSize: 16, fontWeight: '600' }}
            >
              Cerrar sesión
            </Button>
          </Surface>
        </Animated.View>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 24 },

  userSection: {
    alignItems: 'center',
    marginBottom: 16,         // antes 24
    paddingVertical: 8,       // antes 16
  },
  avatarContainer: {
    borderRadius: 48,         // ajustado al nuevo tamaño
    overflow: 'hidden',
    elevation: 4,
  },
  name: {
    marginTop: 8,             // antes 12
    fontSize: 20,             // antes 22
    fontWeight: '700',
  },
  email: {
    fontSize: 13,             // antes 14
    marginTop: 2,             // antes 4
  },

  divider: { marginVertical: 8 }, // antes 12

  sectionContainer: {
    marginBottom: 12,         // antes 16
    borderRadius: 10,         // visualmente más compacto
    overflow: 'hidden',
    elevation: 2,
  },
  listItem: {
    paddingVertical: 4,       // antes 8
  },
  buttonContainer: {
    paddingHorizontal: 12,    // antes 16
    marginBottom: 8,          // antes 12
  },
  actionButton: {
    borderRadius: 8,
  },
logoutButton: {
  borderRadius: 8,
  marginHorizontal: 12,
  marginTop: 8,
  marginBottom: 32, // 🔼 garantiza que no quede pegado al tab bar
},
logoutContent: {
  height: 40, // 🔼 lo dejamos como antes para buena interacción
},

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 180,           // antes 200
  },
});
