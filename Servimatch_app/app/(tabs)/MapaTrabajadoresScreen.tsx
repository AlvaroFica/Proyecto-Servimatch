
import BannerRotativo from '../../components/BannerRotativo';
import BuscadorProfesional from '../../components/BuscadorProfesional';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  Avatar,
  Button,
  Card,
  FAB,
  List,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme,
} from 'react-native-paper';

import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

interface Profesion { id: number; nombre: string; }
interface Trabajador {
  id: number;
  nombre: string;
  apellido: string;
  profesion: string;
  latitud: number;
  longitud: number;
}

<<<<<<< HEAD
const API = 'http://192.168.100.9:8000';
=======
const API = 'http://192.168.1.41:8000';
>>>>>>> auth-validaciones

export default function MapaTrabajadoresScreen() {
  const { tokens } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ servicio?: string }>();

  const [query, setQuery] = useState(params.servicio ?? '');
  const [profesiones, setProfesiones] = useState<Profesion[]>([]);
  const [suggestions, setSuggestions] = useState<Profesion[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [count, setCount] = useState(0);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [current, setCurrent] = useState<Trabajador | null>(null);
  const [loadingPopup, setLoadingPopup] = useState(false);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const mapStyle = {
    flex: 1,
    marginTop: Platform.select({ ios: 150, android: 150 }),
    marginBottom: insets.bottom + 30, // 🔼 permite ver botones flotantes
  };


  useEffect(() => {
    if (!tokens?.access) return;
    // Cargar profesiones
    fetch(`${API}/api/profesiones/`, { headers: { Authorization: `Bearer ${tokens.access}` } })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setProfesiones(list);
      })
      .catch(() => {
        Alert.alert('Error', 'No se pudieron cargar las profesiones');
      });

    // Obtener ubicación del usuario
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        Alert.alert(
          'Permiso denegado',
          'Activa la ubicación para encontrar trabajadores cercanos.'
        );
      }
    })();
  }, [tokens]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = profesiones
      .filter(p => p.nombre.toLowerCase().includes(lower))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [query, profesiones]);

  const buscar = async () => {
    if (!tokens?.access) return;
    setLoadingPopup(true);
    setTimeout(() => setLoadingPopup(false), 2000);

    const baseUrl = `${API}/api/trabajadores/`;
    const url = selectedId
      ? `${baseUrl}?profesion=${selectedId}`
      : `${baseUrl}?profesion__nombre__icontains=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access}` } });
      const data: any = await res.json();
      const list: Trabajador[] = Array.isArray(data) ? data : data.results ?? [];
      setTrabajadores(list);
      setCount(list.length);
      // Ajustar mapa a marcadores si hay userLoc
      if (mapRef.current && list.length && userLoc) {
        const markers = list
          .filter(t => t.latitud != null && t.longitud != null)
          .map(t => ({ latitude: Number(t.latitud), longitude: Number(t.longitud) }));
        mapRef.current.fitToCoordinates(
          [{ latitude: userLoc.latitude, longitude: userLoc.longitude }, ...markers],
          { edgePadding: { top: 80, right: 40, bottom: 80, left: 40 }, animated: true }
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron cargar los trabajadores');
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const onMarkerPress = (t: Trabajador) => {
    setCurrent(t);
    setModalVisible(true);
  };

  const recenterMap = () => {
    if (mapRef.current && userLoc) {
      mapRef.current.animateCamera(
        { center: { latitude: userLoc.latitude, longitude: userLoc.longitude }, zoom: 14 },
        { duration: 500 }
      );
    }
  };

  return (
    <BaseLayout title="Explorar trabajadores" back>
      {/* Contenedor de búsqueda fijo sobre el mapa */}
      
      
      <BuscadorProfesional
        query={query}
        setQuery={setQuery}
        suggestions={suggestions}
        setSelectedId={setSelectedId}
        buscar={buscar}
        theme={theme}
      />

       <BannerRotativo />    



      {/* Indicador de búsqueda en curso */}
      <Portal>
        <Modal visible={loadingPopup} dismissable={false} contentContainerStyle={styles.popupBox}>
          <Card style={[styles.loadingCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.loadingContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                Buscando trabajadores...
              </Text>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* Texto con la cantidad de resultados encontrados */}
      <View style={[styles.resultContainer, { backgroundColor: theme.colors.surface, elevation: 3 }]}>
        <Text style={[styles.resultText, { color: theme.colors.onSurface }]}>
          {count > 1
            ? `Encontré ${count} profesionales`
            : count === 1
            ? 'Encontré 1 profesional'
            : 'No se encontraron profesionales'}
        </Text>
      </View>

      {/* Mensaje si no hay ubicación */}
      {!userLoc && (
        <View style={styles.noLocationContainer}>
          <Text style={[styles.noLocationText, { color: theme.colors.onSurface }]}>
            La ubicación no está disponible. Actívala para resultados más cercanos.
          </Text>
          <Button
            mode="outlined"
            onPress={() => {
              Location.requestForegroundPermissionsAsync().then(({ status }) => {
                if (status === 'granted') {
                  Location.getCurrentPositionAsync({}).then(loc => {
                    setUserLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
                  });
                }
              });
            }}
            style={[styles.enableLocationButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Activar ubicación
          </Button>
        </View>
      )}

      {/* Mapa */}
      <MapView
        ref={mapRef}
        style={mapStyle} 

        provider={PROVIDER_GOOGLE}
        mapType="standard"
        showsUserLocation
        region={
          userLoc
            ? { ...userLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 }
            : { latitude: -33.45, longitude: -70.6667, latitudeDelta: 0.5, longitudeDelta: 0.5 }
        }
      >
        {trabajadores.map(t => {
          if (t.latitud == null || t.longitud == null) return null;
          const distance = userLoc
            ? calculateDistance(
                userLoc.latitude,
                userLoc.longitude,
                Number(t.latitud),
                Number(t.longitud)
              ).toFixed(1)
            : null;
          return (
            <Marker
              key={t.id}
              coordinate={{ latitude: Number(t.latitud), longitude: Number(t.longitud) }}
              onPress={() => onMarkerPress(t)}
              pinColor={theme.colors.primary}
            >
              <Image
                source={require('../../assets/images/worker.png')}
                style={styles.marker}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* Botones flotantes: Recentrar y cambiar tipo de mapa */}
      {userLoc && (
        <>
          <FAB
            icon="crosshairs-gps"
            style={[styles.fab, { bottom: 100, backgroundColor: theme.colors.primary }]}
            onPress={recenterMap}
            small
          />
        </>
      )}

      {/* Modal con detalle de trabajador */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Card style={[styles.modalCard, { elevation: 4 }]}>
            <Card.Title
              title={current ? `${current.nombre} ${current.apellido}` : ''}
              subtitle={
                current
                  ? `${current.profesion}${
                      userLoc && current
                        ? ` • ${calculateDistance(
                            userLoc.latitude,
                            userLoc.longitude,
                            Number(current.latitud),
                            Number(current.longitud)
                          ).toFixed(1)} km`
                        : ''
                    }`
                  : ''
              }
              titleStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
              subtitleStyle={{ color: theme.colors.onSurface }}
              left={props => (
                <Avatar.Text
                  {...props}
                  label={current?.nombre.charAt(0).toUpperCase() || ''}
                  style={{ backgroundColor: theme.colors.primary }}
                  color={theme.colors.onPrimary}
                />
              )}
            />
            <Card.Actions style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  router.push(`/perfil/${current?.id}`);
                }}
                style={[styles.modalButton, { borderColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.primary }}
              >
                Ver perfil
              </Button>
              <Button
                mode="text"
                onPress={() => setModalVisible(false)}
                labelStyle={{ color: theme.colors.onSurface }}
              >
                Cerrar
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({

  popupBox: {
    margin: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingCard: {
    borderRadius: 8,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultContainer: {
    position: 'absolute',
    top: Platform.select({ ios: 140, android: 120 }),
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 9,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noLocationContainer: {
    position: 'absolute',
    top: Platform.select({ ios: 180, android: 160 }),
    left: 16,
    right: 48,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 10,
    zIndex: 20,
  },
  noLocationText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  enableLocationButton: {
    borderRadius: 6,
  },

  marker: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  fab: {
  position: 'absolute',
  right: 16,
  width: 48,                // 👈 ancho igual al alto
  height: 48,
  borderRadius: 24,         // 👈 mitad del tamaño = círculo
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 6,             // sombra para Android
},

  modalContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 0,
  },
  modalCard: {
    borderRadius: 12,
  },
  modalActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  modalButton: {
    marginRight: 8,
    borderRadius: 6,
  },
});
