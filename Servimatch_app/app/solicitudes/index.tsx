// app/solicitudes/index.tsx

import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  FAB,
  Modal,
  Portal,
  Searchbar,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';


const API_BASE_URL = 'http://192.168.100.9:8000';


interface Usuario {
  id: number;
  username: string;
}

interface Solicitud {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  ubicacion: string;
  fecha_creacion: string;
  estado?: 'Pendiente' | 'Aceptada' | 'Finalizada';
  cliente: {
    usuario: Usuario;
  };
  servicio: {
    nombre: string;
    iconoUrl?: string;
  };
}

export default function ListaSolicitudes() {
  const { tokens } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // initialize loading true so skeleton shows on mount
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState<Solicitud[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);

  // Animated values: fabScale for FAB, but remove fadeAnim from list items
  const fabScale = useRef(new Animated.Value(0)).current;

  // Format date to "Hace Xh" or "DD MMM YYYY"
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Fetch data from API
  const fetchData = async () => {
    if (!tokens?.access) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resUser = await fetch(`${API_BASE_URL}/api/usuarios/me/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (!resUser.ok) throw new Error('No se pudo obtener datos de usuario');
      const userData: Usuario = await resUser.json();

      const res = await fetch(`${API_BASE_URL}/api/solicitudes/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (!res.ok) throw new Error('Error al obtener solicitudes');
      const data = await res.json();
      const lista: Solicitud[] = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      const filtradas = lista.filter((s) => s.cliente.usuario.id === userData.id);
      setSolicitudes(filtradas);
      setFiltered(filtradas);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo cargar tus solicitudes');
      setSolicitudes([]);
      setFiltered([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial effect: animate FAB, fetch data
  useEffect(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    fetchData();
  }, [tokens]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter by search query
  useEffect(() => {
    if (!searchQuery) {
      setFiltered(solicitudes);
    } else {
      const lower = searchQuery.toLowerCase();
      setFiltered(
        solicitudes.filter(
          (s) =>
            s.nombre.toLowerCase().includes(lower) ||
            s.servicio.nombre.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchQuery, solicitudes]);

  // Render skeleton placeholders while loading
  const renderSkeleton = () => {
    const placeholders = Array.from({ length: 5 });
    return placeholders.map((_, idx) => (
      <View key={idx} style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.skeletonHeader, { backgroundColor: theme.colors.onSurfaceVariant }]} />
        <View style={styles.skeletonRow}>
          <View style={[styles.skeletonAvatar, { backgroundColor: theme.colors.onSurfaceVariant }]} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={[styles.skeletonLineShort, { backgroundColor: theme.colors.onSurfaceVariant }]} />
            <View style={[styles.skeletonLineLong, { backgroundColor: theme.colors.onSurfaceVariant }]} />
          </View>
        </View>
      </View>
    ));
  };

  // Swipeable: "Cancelar" button
  const renderRightActions = (
  _progress: any,
  dragX: Animated.AnimatedInterpolation<number>,
  item: Solicitud
) => {
  const trans = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const handleCancelar = async () => {
    Alert.alert(
      'Cancelar Solicitud',
      '¿Estás seguro de que deseas cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/solicitudes/${item.id}/cancelar/`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Error al cancelar');
              }

              Alert.alert('Éxito', 'Solicitud cancelada correctamente');
              fetchData(); // Recarga lista
            } catch (error) {
              const mensaje = error instanceof Error ? error.message : 'Error desconocido';
              Alert.alert('Error', mensaje);
            }
          },
        },
      ]
    );
  };


  return (
    <Animated.View style={{ transform: [{ translateX: trans }] }}>
      <Button
        icon="close-circle-outline"
        mode="contained"
        onPress={handleCancelar}
        style={[styles.swipeButton, { backgroundColor: theme.colors.error }]}
        labelStyle={{ color: '#fff' }}
      >
        Cancelar
      </Button>
    </Animated.View>
  );
};


  // Separate component for each list item so hooks work correctly
  const SolicitudListItem: React.FC<{ item: Solicitud; index: number }> = ({ item, index }) => {
    const itemAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Slide-up + fade-in
      Animated.timing(itemAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }, []);

    const onPressIn = () => {
      Animated.spring(itemAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };
    const onPressOut = () => {
      Animated.spring(itemAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
          <Animated.View
            style={{
              transform: [
                {
                  scale: itemAnim.interpolate({
                    inputRange: [0.97, 1],
                    outputRange: [0.97, 1],
                  }),
                },
                {
                  translateY: itemAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
              opacity: itemAnim,
            }}
          >
            <Card
              mode="elevated"
              onPress={() => {
                setSelectedSolicitud(item);
                setModalVisible(true);
              }}
              style={[styles.card, { backgroundColor: theme.colors.surface, elevation: 4 }]}
            >
              <Card.Title
                title={item.nombre}
                titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
                subtitle={`${item.servicio.nombre} · ${item.ubicacion}`}
                subtitleStyle={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}
                left={(props) =>
                  item.servicio.iconoUrl ? (
                    <Avatar.Image {...props} source={{ uri: item.servicio.iconoUrl }} size={40} />
                  ) : (
                    <Avatar.Icon {...props} icon="briefcase-outline" size={40} />
                  )
                }
              />
              <Card.Content>
                <View style={styles.contentRow}>
                  <Text style={[styles.precioText, { color: theme.colors.primary }]}>
                    ${item.precio}
                  </Text>
                  <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                    {formatDate(item.fecha_creacion)}
                  </Text>
                  {item.estado && (
                    <Chip style={styles.statusChip} textStyle={styles.statusText}>
                      {item.estado}
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <BaseLayout title="Mis Solicitudes" back>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Searchbar
          placeholder="Buscar solicitudes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />

        {loading ? (
          <View style={styles.loader}>{renderSkeleton()}</View>
        ) : (
          <Animated.FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <SolicitudListItem item={item} index={index} />}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 100,
              paddingHorizontal: 16,
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/images/empty-state.png')}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
                  No tienes solicitudes aún. Toca “Nueva” para crear una.
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}

        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <FAB
            style={[styles.fab, { bottom: insets.bottom + 24, backgroundColor: theme.colors.primary }]}
            icon="plus"
            label="Nueva"
            onPress={() => router.push('/solicitudes/nueva')}
            rippleColor={theme.colors.onPrimary + '33'}
            small={false}
          />
        </Animated.View>

        {/* Quick View Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
          >
            {selectedSolicitud && (
              <>
                <Title style={[styles.modalTitle, { color: theme.colors.primary }]}>
                  {selectedSolicitud.nombre}
                </Title>
                <Divider style={styles.divider} />
                <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>
                  Servicio: {selectedSolicitud.servicio.nombre}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>
                  Ubicación: {selectedSolicitud.ubicacion}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>
                  Precio: ${selectedSolicitud.precio}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>
                  Fecha: {new Date(selectedSolicitud.fecha_creacion).toLocaleString('es-CL')}
                </Text>
                {selectedSolicitud.descripcion && (
                  <>
                    <Text style={[styles.modalSubTitle, { color: theme.colors.primary }]}>
                      Descripción
                    </Text>
                    <Text style={[styles.modalText, { color: theme.colors.onSurface }]}>
                      {selectedSolicitud.descripcion}
                    </Text>
                  </>
                )}
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/solicitudes/${selectedSolicitud.id}`);
                  }}
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  labelStyle={{ color: theme.colors.onPrimary }}
                >
                  Ver Detalles
                </Button>
              </>
            )}
          </Modal>
        </Portal>
      </View>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  skeletonCard: {
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  skeletonHeader: {
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  skeletonLineShort: {
    height: 12,
    width: '50%',
    borderRadius: 4,
    marginTop: 4,
  },
  skeletonLineLong: {
    height: 12,
    width: '80%',
    borderRadius: 4,
    marginTop: 8,
  },
  searchbar: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  precioText: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
  },
  statusChip: {
    backgroundColor: '#FFECB3',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#BF360C',
  },
  fab: {
    position: 'absolute',
    right: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 16,
  },
  emptyImage: {
    width: 200,
    height: 200,
    tintColor: '#757575',
  },
  modalContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  modalText: {
    fontSize: 14,
    marginTop: 8,
  },
  modalButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  swipeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginVertical: 8,
    borderRadius: 12,
  },
});
