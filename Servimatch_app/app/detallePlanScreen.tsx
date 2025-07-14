// DetallePlanScreen.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_estimado: string;
  precio: string;
}

export default function DetallePlanScreen() {
  const { planId, dia, horaInicio } = useLocalSearchParams<{
    planId: string;
    dia: string;
    horaInicio: string;
  }>();
  const { tokens } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokens?.access && planId) fetchPlan();
  }, [tokens, planId]);

  const fetchPlan = async () => {
    try {
      const res = await fetch(
        `http://192.168.100.4:8000/api/planes/${planId}/`,
        { headers: { Authorization: `Bearer ${tokens!.access}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      const data: Plan = await res.json();
      setPlan(data);
    } catch (e) {
      console.error('Error al cargar plan:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!tokens?.access || loading || !plan) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const handlePayment = (method: 'debito' | 'credito') => {
    // Lógica de pasarela (Stripe/MercadoPago) aquí...
    router.push(
      `/pago?planId=${planId}&dia=${dia}&horaInicio=${horaInicio}&metodo=${method}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Resumen de tu reserva</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Plan:</Text>
        <Text style={styles.value}>{plan.nombre}</Text>

        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.value}>{plan.descripcion}</Text>

        <Text style={styles.label}>Duración estimada:</Text>
        <Text style={styles.value}>{plan.duracion_estimado}</Text>

        <Text style={styles.label}>Precio:</Text>
        <Text style={styles.value}>${plan.precio}</Text>

        <Text style={styles.label}>Día:</Text>
        <Text style={styles.value}>{dia}</Text>

        <Text style={styles.label}>Hora inicio:</Text>
        <Text style={styles.value}>{horaInicio}</Text>
      </View>

      <Text style={styles.paymentTitle}>Elige método de pago</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayment('debito')}
        >
          <Text style={styles.payText}>Pagar Débito</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => handlePayment('credito')}
        >
          <Text style={styles.payText}>Pagar Crédito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: '700', marginVertical: 12 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  value: { fontSize: 16, marginTop: 4 },
  paymentTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  payButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
