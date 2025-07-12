// app/solicitudes/mapa.tsx
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  ActivityIndicator,
  Button,
  Card,
  Modal,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';
import BannerRotativo from '../../components/BannerRotativo';
import { IconButton } from 'react-native-paper';

interface Solicitud {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  latitud: number;
  longitud: number;
}

const API = 'http://192.168.100.9:8000';

export default function MapaSolicitudesScreen() {
  const { tokens } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const mapRef = useRef<MapView>(null);

  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<Solicitud | null>(null);

  const bottomMargin = insets.bottom + -5;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      }
    })();
  }, []);

  const buscarSolicitudes = async () => {
    if (!userLoc || !tokens?.access) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/solicitudes/cercanas/?lat=${userLoc.latitude}&lng=${userLoc.longitude}`,
        { headers: { Authorization: `Bearer ${tokens.access}` } }
      );
      const data = await res.json();
      const list: Solicitud[] = Array.isArray(data) ? data : data.results || [];
      setSolicitudes(list);
      setCount(list.length);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    }
    setLoading(false);
  };

  const onMarkerPress = (s: Solicitud) => {
    setCurrent(s);
    setModalVisible(true);
  };

  const centrarMapa = () => {
    if (userLoc && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLoc,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  return (
    <BaseLayout title="Solicitudes Cercanas" back>
      <BannerRotativo />

      <View style={[styles.buttonContainer, { top: Platform.select({ ios: 130, android: 70 }) }]}>
        <Button
          mode="contained"
          onPress={buscarSolicitudes}
          contentStyle={{ paddingVertical: 6 }}
        >
          Buscar solicitudes (10 km)
        </Button>
      </View>

      <View style={[styles.countContainer, { top: Platform.select({ ios: 180, android: 150 }) }]}>
        <Text style={{ fontWeight: '600' }}>
          {count > 1
            ? `Encontré ${count} solicitudes`
            : count === 1
            ? 'Encontré 1 solicitud'
            : 'Sin solicitudes cercanas'}
        </Text>
      </View>

      <MapView
        ref={mapRef}
        style={[styles.map, { marginBottom: bottomMargin, marginTop: 50 }]}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        region={
          userLoc
            ? { ...userLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            : { latitude: -33.45, longitude: -70.6667, latitudeDelta: 0.5, longitudeDelta: 0.5 }
        }
      >
        {solicitudes.map(s => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.latitud, longitude: s.longitud }}
            onPress={() => onMarkerPress(s)}
          >
            <Image source={require('../../assets/images/request.png')} style={styles.marker} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.centerButton}>
        <IconButton
          icon="crosshairs-gps"
          size={28}
          onPress={centrarMapa}
          iconColor="#fff"
          style={styles.centerButtonIcon}
        />
      </View>




      <Portal>
        <Modal visible={loading} dismissable={false} contentContainerStyle={styles.modalBox}>
          <Card.Content style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Buscando solicitudes...</Text>
          </Card.Content>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Card>
            <Card.Title title={current?.nombre} subtitle={`$ ${current?.precio}`} />
            <Card.Content>
              <Text>{current?.descripcion}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                onPress={() => {
                  setModalVisible(false);
                  router.push(`/solicitudes/${current?.id}`);
                }}
              >
                Ver detalle
              </Button>
              <Button onPress={() => setModalVisible(false)}>Cerrar</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  countContainer: {
    position: 'absolute',
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffffee',
    elevation: 4,
    zIndex: 10,
  },
  marker: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  modalBox: {
    margin: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 0,
  },
centerButton: {
  position: 'absolute',
  bottom: 90,
  right: 16,
  zIndex: 20,
  backgroundColor: '#A66DD4', // 💜 Lila moderno
  borderRadius: 28,
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
},
centerButtonIcon: {
  alignSelf: 'center',
},

centerButtonContent: {
  width: 48,
  height: 48,
  paddingHorizontal: 0,
  paddingVertical: 0,
  justifyContent: 'center',
},

centerButtonLabel: {
  color: '#ffffff',
},
});
