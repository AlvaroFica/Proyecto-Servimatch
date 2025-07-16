// app/confirmar-pago.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Paragraph,
  Surface,
  Title,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../components/BaseLayout';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://192.168.100.4:8000';

export default function ConfirmarPagoScreen() {
  const { tokens } = useAuth();
  const router = useRouter();
  const { planId, fecha, hora_inicio } = useLocalSearchParams<{
    planId: string;
    fecha: string;
    hora_inicio: string;
  }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [plan, setPlan] = useState<{
    id: number;
    nombre: string;
    descripcion: string;
    duracion_estimado: string;
    precio: number;
    trabajador_id: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Cargar detalles del plan
  useEffect(() => {
    if (!tokens?.access || !planId) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/planes/${planId}/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlan(data);
        } else {
          throw new Error('Error al cargar el plan');
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert('Error', err.message || 'No se pudo cargar el plan');
      } finally {
        setLoading(false);
      }
    })();
  }, [tokens, planId]);

  const handlePago = async () => {
    if (!plan) return;
    setPaying(true);
    try {
      // 1. Crear el pago pendiente
      const res = await fetch(`${API_BASE_URL}/api/pagoservicio/iniciar/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens!.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          trabajador_id: plan.trabajador_id,
        }),
      });

      const data = await res.json();
      const pagoId = data.pago_id;

      if (!res.ok || !pagoId) {
        throw new Error(data.error || 'No se pudo generar el pago.');
      }

      // 2. Simulación del proceso de pago
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. Confirmar el pago
      const confirmRes = await fetch(
        `${API_BASE_URL}/api/pagoservicio/${pagoId}/confirmar/`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${tokens!.access}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: 'pagado' }),
        }
      );

      if (!confirmRes.ok) {
        throw new Error('Error al confirmar el pago');
      }

      // 4. Redirigir
      router.push('/pago-exitoso');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'No se pudo completar el pago');
      router.push('/pago-fallido');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Confirmar pago" back>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  if (!plan) {
    return (
      <BaseLayout title="Confirmar pago" back>
        <View style={styles.loader}>
          <Paragraph>No se pudo cargar el plan.</Paragraph>
        </View>
      </BaseLayout>
    );
  }

  const { nombre, duracion_estimado, precio } = plan;

  return (
    <BaseLayout title="Confirmar pago" back>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Surface
          style={[styles.summary, { backgroundColor: theme.colors.surface }]}
        >
          <Title>Resumen de Reserva</Title>
          <Paragraph>
            <Paragraph style={styles.bold}>Plan:</Paragraph> {nombre}
          </Paragraph>
          <Paragraph>
            <Paragraph style={styles.bold}>Duración:</Paragraph>{' '}
            {duracion_estimado}
          </Paragraph>
          <Paragraph>
            <Paragraph style={styles.bold}>Fecha:</Paragraph> {fecha}
          </Paragraph>
          <Paragraph>
            <Paragraph style={styles.bold}>Hora:</Paragraph> {hora_inicio}
          </Paragraph>
          <Paragraph>
            <Paragraph style={styles.bold}>Total a pagar:</Paragraph> ${precio}
          </Paragraph>
        </Surface>

        <Button
          mode="contained"
          onPress={handlePago}
          loading={paying}
          disabled={paying}
          style={[styles.payButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
        >
          Pagar ahora
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          Volver
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  container: {
    padding: 16,
  },
  summary: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
  payButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  cancelButton: {
    alignSelf: 'center',
  },
});
