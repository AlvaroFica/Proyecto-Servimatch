// app/pago-exitoso.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function PagoExitosoScreen() {
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  const { tokens } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reservaId, setReservaId] = useState<number | null>(null);

  useEffect(() => {
    // Opcional: fetchear la sesión para obtener metadata.reserva_id
    fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: {
        Authorization: `Bearer ${tokens!.access}`, // si tienes token de cliente
      },
    })
      .then(r => r.json())
      .then(data => {
        setReservaId(data.metadata.reserva_id);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('No se pudo verificar la sesión de pago');
      })
      .finally(() => setLoading(false));
  }, [session_id]);

  if (loading) return <ActivityIndicator style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Title>¡Pago confirmado!</Title>
      <Paragraph>Tu reserva {reservaId ? `#${reservaId}` : ''} está confirmada.</Paragraph>
      <Button mode="contained" onPress={() => router.push('/mis-reservas')}>
        Ver mis reservas
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
});
