// app/confirmar-pago.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Paragraph,
  Surface,
  TextInput,
  Title,
  useTheme,
  ProgressBar,
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  // Simulación de carga
  const [mostrarCarga, setMostrarCarga] = useState(false);
  const [progreso, setProgreso] = useState(0);

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

    // Validación
    if (!nombreTarjeta || !numeroTarjeta || !expiracion || !cvv) {
      Alert.alert('Completa todos los campos de tarjeta');
      setPaying(false);
      return;
    }
    // Validación real
    if (!/^[A-Za-z\s]+$/.test(nombreTarjeta.trim())) {
      Alert.alert('Nombre inválido', 'El nombre solo puede contener letras y espacios');
      setPaying(false);
      return;
    }
    if (numeroTarjeta.replace(/\s/g, '').length !== 16) {
      Alert.alert('Número inválido', 'El número de tarjeta debe tener 16 dígitos');
      setPaying(false);
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiracion)) {
      Alert.alert('Fecha inválida', 'Usa el formato MM/AA');
      setPaying(false);
      return;
    }
    if (cvv.length < 3 || cvv.length > 4) {
      Alert.alert('CVV inválido', 'Debe contener 3 o 4 dígitos');
      setPaying(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/simular-pago/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens!.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          monto: plan.precio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo registrar el pago');
      }

      Alert.alert('✅ Pago exitoso', 'Serás redirigido automáticamente...');
      setTimeout(() => {
        router.push('/pago-exitoso');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'No se pudo completar el pago');
    } finally {
      setPaying(false);
    }
  };

  const simularCargaYConfirmarPago = () => {
    setMostrarCarga(true);
    setProgreso(0);

    let progresoActual = 0;

    const avanzar = () => {
      if (progresoActual >= 1) {
        setMostrarCarga(false);
        handlePago();
        return;
      }

      // Avance aleatorio entre 5% y 15%
      const incremento = Math.random() * 0.1 + 0.05;
      progresoActual = Math.min(progresoActual + incremento, 1);
      setProgreso(progresoActual);

      // Espera aleatoria entre 100ms y 600ms
      const delay = Math.random() * 500 + 100;

      setTimeout(avanzar, delay);
    };

    avanzar();
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
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background },
        ]}
      >
        <Surface style={[styles.summary, { backgroundColor: theme.colors.surface }]}>
          <Title>Resumen de Reserva</Title>
          <Paragraph><Paragraph style={styles.bold}>Plan:</Paragraph> {nombre}</Paragraph>
          <Paragraph><Paragraph style={styles.bold}>Duración:</Paragraph> {duracion_estimado}</Paragraph>
          <Paragraph><Paragraph style={styles.bold}>Fecha:</Paragraph> {fecha}</Paragraph>
          <Paragraph><Paragraph style={styles.bold}>Hora:</Paragraph> {hora_inicio}</Paragraph>
          <Paragraph><Paragraph style={styles.bold}>Total a pagar:</Paragraph> ${precio}</Paragraph>
        </Surface>

        <Surface style={[styles.summary, { backgroundColor: theme.colors.surface }]}>
          <Title>Datos de Tarjeta</Title>

            <TextInput
              label="Nombre en la tarjeta"
              placeholder="Juan Pérez"
              value={nombreTarjeta}
              onChangeText={(text) => {
                // Permitir solo letras y espacios
                const limpio = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                setNombreTarjeta(limpio);
              }}
              style={{ marginBottom: 8 }}
            />

            <TextInput
              label="Número de tarjeta"
              placeholder="4242 4242 4242 4242"
              value={numeroTarjeta}
              onChangeText={(text) => {
                // Eliminar todo lo que no sea número
                const limpio = text.replace(/\D/g, '');
                // Agrupar de 4 en 4
                const formateado = limpio.replace(/(.{4})/g, '$1 ').trim();
                setNumeroTarjeta(formateado);
              }}
              keyboardType="numeric"
              maxLength={19} // 16 + 3 espacios
              style={{ marginBottom: 8 }}
            />

            <TextInput
              label="Fecha de expiración"
              placeholder="MM/AA"
              value={expiracion}
              onChangeText={(text) => {
                let limpio = text.replace(/\D/g, '');
                if (limpio.length > 2) {
                  limpio = limpio.slice(0, 2) + '/' + limpio.slice(2, 4);
                }
                setExpiracion(limpio);
              }}
              keyboardType="numeric"
              maxLength={5}
              style={{ marginBottom: 8 }}
            />

            <TextInput
              label="CVV"
              placeholder="123"
              value={cvv}
              onChangeText={(text) => {
                const limpio = text.replace(/\D/g, '');
                setCvv(limpio);
              }}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              style={{ marginBottom: 8 }}
            />
        </Surface>

        <Button
          mode="contained"
          onPress={simularCargaYConfirmarPago}
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

        {mostrarCarga && (
          <Surface style={styles.overlay}>
            <Title style={styles.overlayText}>Procesando pago...</Title>
            <ProgressBar progress={progreso} color={theme.colors.primary} style={styles.progressBar} />
            <Paragraph style={styles.overlayText}>{Math.round(progreso * 100)}%</Paragraph>
          </Surface>
        )}
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
  overlay: {
    position: 'absolute',
    top: '40%',
    left: '10%',
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  overlayText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
});
