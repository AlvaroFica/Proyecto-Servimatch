// app/pago-exitoso.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function PagoExitosoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Title>¡Pago confirmado!</Title>
      <Paragraph>Tu solicitud fue procesada exitosamente.</Paragraph>
      <Button mode="contained" onPress={() => router.push('/solicitudes')}>
        Ver mis solicitudes
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
});
