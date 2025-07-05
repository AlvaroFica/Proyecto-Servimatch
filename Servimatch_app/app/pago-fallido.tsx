// app/pago-fallido.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function PagoFallidoScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Title>Pago cancelado</Title>
      <Paragraph>Puedes intentar nuevamente o elegir otro método de pago.</Paragraph>
      <Button mode="contained" onPress={() => router.back()}>
        Volver
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
});
