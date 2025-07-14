// app/confirmar-pago.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
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
  const { planId, fecha, hora_inicio } = useLocalSearchParams<{ planId: string; fecha: string; hora_inicio: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [plan, setPlan] = useState<{
    id: number;
    nombre: string;
    descripcion: string;
    duracion_estimado: string;
    precio: number;
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
      const res = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens!.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: plan.id, fecha, hora_inicio }),
      });

      if (res.status === 409) {
        Alert.alert(
          'Franja ocupada',
          'Lo siento, esa franja ya fue reservada. Por favor elige otro horario.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al iniciar pago');
      }

      const { url } = await res.json();
      const returnUrl = 'servimatchapp://pago-exitoso';
      const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);

      if (result.type === 'success') {
        router.push('/pago-exitoso');
      } else {
        Alert.alert('Pago cancelado o interrumpido');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'No se pudo iniciar el pago');
    } finally {
      setPaying(false);
    }
  };

  // estados de carga y errores
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

  // Detalles desestructurados
  const { nombre, duracion_estimado, precio } = plan;

  return (
    <BaseLayout title="Confirmar pago" back>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background },
        ]}
      >
        <Surface style={[styles.summary, { backgroundColor: theme.colors.surface }]}>  
          <Title>Resumen de Reserva</Title>
          <Paragraph>
            <Paragraph style={styles.bold}>Plan:</Paragraph> {nombre}
          </Paragraph>
          <Paragraph>
            <Paragraph style={styles.bold}>Duración:</Paragraph> {duracion_estimado}
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
          Pagar con tarjeta
        </Button>

        <Button mode="text" onPress={() => router.back()} style={styles.cancelButton}>
          Volver
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  container: { padding: 16 },
  summary: { padding: 16, borderRadius: 8, marginBottom: 24 },
  bold: { fontWeight: 'bold' },
  payButton: { marginBottom: 12, borderRadius: 8 },
  buttonContent: { height: 48 },
  cancelButton: { alignSelf: 'center' },
});
