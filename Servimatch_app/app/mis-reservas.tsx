// app/mis-reservas.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, ActivityIndicator, Card, Paragraph } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function MisReservasScreen() {
  const { tokens } = useAuth();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/reservas/?cliente=true', {
      headers: { Authorization: `Bearer ${tokens?.access}` },
    })
      .then(r => r.json())
      .then(data => setReservas(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tokens]);

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Title>Mis Reservas</Title>
      {reservas.map(r => (
        <Card key={r.id} style={styles.card}>
          <Card.Content>
            <Paragraph>Reserva #{r.id}</Paragraph>
            <Paragraph>Plan: {r.plan.nombre}</Paragraph>
            <Paragraph>Fecha: {r.fecha}</Paragraph>
            <Paragraph>Hora: {r.hora_inicio}</Paragraph>
            <Paragraph>Estado: {r.estado}</Paragraph>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  container: { flex: 1, padding: 16 },
  card: { marginVertical: 8 },
});
