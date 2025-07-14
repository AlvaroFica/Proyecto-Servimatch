import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

export default function ConfirmarPagoSolicitudScreen() {
  const { solicitud_id, monto } = useLocalSearchParams<{ solicitud_id?: string; monto?: string }>();
  const { tokens } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);

  const iniciarPago = async () => {
    if (!solicitud_id || !monto || !tokens?.access) {
      Alert.alert('Error', 'Faltan datos para procesar el pago.');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://192.168.1.51:8000/api/solicitudes/iniciar-pago/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solicitud_id,
          monto,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Error iniciando pago');

      const { url } = data;
      Linking.openURL(url);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo iniciar el pago');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout title="Confirmar Pago" back>
      <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <>
            <Text style={styles.label}>Vas a pagar la solicitud #{solicitud_id}</Text>
            <Text style={styles.monto}>Monto: ${monto}</Text>
            <Button
              mode="contained"
              onPress={iniciarPago}
              style={styles.boton}
              contentStyle={styles.botonContenido}
            >
              Pagar con tarjeta
            </Button>
          </>
        )}
      </View>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  monto: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  boton: {
    borderRadius: 8,
    marginHorizontal: 24,
  },
  botonContenido: {
    height: 48,
  },
});
