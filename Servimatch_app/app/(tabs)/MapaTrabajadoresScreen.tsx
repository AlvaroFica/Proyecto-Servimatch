import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, View, Image, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Button,
  FAB,
  Modal,
  Portal,
  Surface,
  Text,
  useTheme,
  Card,
} from 'react-native-paper';

import BaseLayout from '../../components/BaseLayout';
import BannerRotativo from '../../components/BannerRotativo';
import BuscadorProfesional from '../../components/BuscadorProfesional';
import ErrorModal from '../../components/ErrorModal';
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

const API = 'http://192.168.137.1:8000';

export default function MapaTrabajadoresScreen() {
  const isFocused = useIsFocused();
  const { tokens } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ servicio?: string }>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [query, setQuery] = useState(params.servicio ?? '');
  const [profesiones, setProfesiones] = useState<Profesion[]>([]);
  const [suggestions, setSuggestions] = useState<Profesion[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [count, setCount] = useState(0);
  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  const [loadingPopup, setLoadingPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Carga de profesiones y ubicación
  useEffect(() => {
    if (!tokens?.access) return;

    fetch(`${API}/api/profesiones/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setProfesiones(list);
      })
      .catch(() => {
        setErrorMessage('No se pudieron cargar las profesiones');
        setShowErrorModal(true);
      });

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setErrorMessage('');
        setShowErrorModal(false);
        const loc = await Location.getCurrentPositionAsync({});
        setUserLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        setErrorMessage('Permiso denegado: activa la ubicación para encontrar trabajadores cercanos.');
        setShowErrorModal(true);
      }
    })();
  }, [tokens]);

  // Filtrado de sugerencias
  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);
    const lower = query.toLowerCase();
    setSuggestions(
      profesiones.filter(p => p.nombre.toLowerCase().includes(lower)).slice(0, 5)
    );
  }, [query, profesiones]);

  // Búsqueda de trabajadores
  const buscar = async () => {
    setErrorMessage('');
    if (!tokens?.access) return;

    setLoadingPopup(true);
    setTimeout(() => setLoadingPopup(false), 2000);

    const baseUrl = `${API}/api/trabajadores/`;
    const url = selectedId
      ? `${baseUrl}?profesion=${selectedId}`
      : `${baseUrl}?profesion__nombre__icontains=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const data: any = await res.json();
      const list: Trabajador[] = Array.isArray(data) ? data : data.results ?? [];
      setTrabajadores(list);
      setCount(list.length);

      if (mapRef.current && list.length && userLoc) {
        const markers = list
          .filter(t => t.latitud != null && t.longitud != null)
          .map(t => ({
            latitude: Number(t.latitud),
            longitude: Number(t.longitud),
          }));
        mapRef.current.fitToCoordinates(
          [{ latitude: userLoc.latitude, longitude: userLoc.longitude }, ...markers],
          { edgePadding: { top: 80, right: 40, bottom: 80, left: 40 }, animated: true }
        );
      }
    } catch {
      setErrorMessage('No se pudieron cargar los trabajadores');
      setShowErrorModal(true);
    }
  };

  // Distancia Haversine
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Recentrar mapa
  const recenterMap = () => {
    if (mapRef.current && userLoc) {
      mapRef.current.animateCamera(
        { center: userLoc, zoom: 14 },
        { duration: 500 }
      );
    }
  };

  return (
    <>
      {/* Modal de error global */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onDismiss={() => setShowErrorModal(false)}
      />

      <BaseLayout title="Explorar trabajadores" back>

        {/* Buscador arriba (sin banner) */}
        <View style={[styles.topOverlay, { top: insets.top - 70 }]}>
          <BuscadorProfesional
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            setSelectedId={setSelectedId}
            buscar={buscar}
            theme={theme}
          />
        </View>

        {/* Mapa */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          showsUserLocation
          region={
            userLoc
              ? { ...userLoc, latitudeDelta: 0.05, longitudeDelta: 0.05 }
              : { latitude: -33.45, longitude: -70.6667, latitudeDelta: 0.5, longitudeDelta: 0.5 }
          }
        >
          {trabajadores.map(t => {
            if (t.latitud == null || t.longitud == null) return null;
            return (
              <Marker
                key={t.id}
                coordinate={{
                  latitude: Number(t.latitud),
                  longitude: Number(t.longitud),
                }}
                pinColor={theme.colors.primary}
                onPress={() => {
                  // Aquí puedes abrir un modal de detalle si lo deseas
                }}
              >
                <Image
                  source={require('../../assets/images/worker.png')}
                  style={styles.marker}
                />
              </Marker>
            );
          })}
        </MapView>

        {/* Loading */}
        <Portal>
          <Modal
            visible={loadingPopup}
            dismissable={false}
            contentContainerStyle={styles.popupBox}
          >
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

        {/* Contador resultados */}
        <View style={[styles.resultContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.resultText, { color: theme.colors.onSurface }]}>
            {count > 1
              ? `Encontré ${count} profesionales`
              : count === 1
                ? 'Encontré 1 profesional'
                : 'No se encontraron profesionales'}
          </Text>
        </View>

        {/* FAB de recenter */}
        {userLoc && (
          <FAB
            icon="crosshairs-gps"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={recenterMap}
            small
          />
        )}
        {/* Banner justo encima de la barra de tabs */}
        {isFocused && (
          <View
            style={[
              styles.bottomBanner,
              {
                bottom: insets.bottom, // lo apoya en la barra de tabs
                height: 112,
                zIndex: 10, // muy por debajo de los modales de error
              },
            ]}
          >
            <BannerRotativo />
          </View>
        )}
      </BaseLayout>
    </>
  );
}

const styles = StyleSheet.create({
  topOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
    paddingHorizontal: 16,
    gap: 28,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
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
    top: Platform.select({ ios: 220, android: 200 }),
    left: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 3,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  marker: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  bottomBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    // bottom lo controla insets.bottom desde el render
    paddingHorizontal: 16,
    // zIndex lo sobreescribimos dinámicamente a 10
    // height se añade inline en el render
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.select({ ios: 140, android: 140 }), // deja espacio para tu banner
  },
});
