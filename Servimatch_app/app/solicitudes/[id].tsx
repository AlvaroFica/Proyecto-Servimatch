import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Paragraph,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

interface Solicitud {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number | string;
  ubicacion: string;
  fecha_creacion: string;
  aceptada: boolean;
}

export default function SolicitudDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens, user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id || !tokens?.access) return;
    (async () => {
      try {

        const res = await fetch(`http://192.168.0.186:8000/api/solicitudes/${id}/`,

          { headers: { Authorization: `Bearer ${tokens.access}` } }
        );
        if (!res.ok) throw new Error(await res.text());
        const data: Solicitud = await res.json();
        setSolicitud(data);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar la solicitud');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tokens]);

  const formatearFecha = (iso: string) => {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const aceptarSolicitud = async () => {
    if (!solicitud) return;
    setProcessing(true);
    try {
      const res = await fetch(`http://192.168.0.186:8000/api/solicitudes/${solicitud.id}/aceptar/`,

        {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokens?.access}` },
        }
      );
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Éxito', 'Solicitud aceptada');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo aceptar la solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const pagarSolicitud = () => {
    router.push(`./confirmarPagoSolicitud?solicitud_id=${solicitud?.id}&monto=${solicitud?.precio}`);
  };

  if (loading) {
    return (
      <BaseLayout title="Detalle Solicitud" back>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  if (!solicitud) {
    return (
      <BaseLayout title="Detalle Solicitud" back>
        <View style={styles.center}>
          <Paragraph>No se encontró la solicitud.</Paragraph>
        </View>
      </BaseLayout>
    );
  }

  const precioNum = Number(solicitud.precio) || 0;

  return (
    <BaseLayout title="Detalle Solicitud" back>
      <View style={[styles.container, { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background }]}>  
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            <Title style={{ color: theme.colors.onSurface }}>
              {solicitud.nombre}
            </Title>
            <Paragraph>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>Descripción: </Text>
              <Text style={{ color: theme.colors.onSurface }}>{solicitud.descripcion}</Text>
            </Paragraph>
            <Paragraph>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>Precio: </Text>
              <Text style={{ color: theme.colors.onSurface }}>${precioNum.toFixed(0)}</Text>
            </Paragraph>
            <Paragraph>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>Ubicación: </Text>
              <Text style={{ color: theme.colors.onSurface }}>{solicitud.ubicacion}</Text>
            </Paragraph>
            <Paragraph>
              <Text style={[styles.bold, { color: theme.colors.onSurface }]}>Fecha: </Text>
              <Text style={{ color: theme.colors.onSurface }}>{formatearFecha(solicitud.fecha_creacion)}</Text>
            </Paragraph>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            {user?.rol === 'trabajador' && (
              <Button
                mode="contained"
                onPress={aceptarSolicitud}
                loading={processing}
                disabled={solicitud.aceptada || processing}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                {solicitud.aceptada ? 'Aceptada' : 'Aceptar solicitud'}
              </Button>
            )}
            {user?.rol === 'cliente' && solicitud.aceptada && (
              <Button
                mode="contained"
                onPress={pagarSolicitud}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
              >
                Pagar solicitud
              </Button>
            )}
          </Card.Actions>
        </Card>
      </View>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16, borderRadius: 8 },
  bold: { fontWeight: 'bold' },
  actions: { justifyContent: 'flex-end', padding: 16, flexDirection: 'column', gap: 12 },
  button: { width: '100%' },
  buttonContent: { height: 48 },
});
