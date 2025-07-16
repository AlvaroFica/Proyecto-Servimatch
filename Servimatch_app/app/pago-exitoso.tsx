// app/pago-exitoso.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';

export default function PagoExitosoScreen() {
  const router = useRouter();

  // Animación de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Cargar sonido de éxito
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Reproducir sonido
    const reproducirSonido = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sonidos/success.mp3') // 🎵 tu sonido
        );
        await sound.playAsync();
      } catch (error) {
        console.log('Error reproduciendo sonido:', error);
      }
    };

    reproducirSonido();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fuego animado 🔥 */}
      <Image
        source={require('../assets/images/fire.gif')}
        style={styles.fuego}
        resizeMode="contain"
      />

      {/* Contenido animado */}
      <Animated.View style={[styles.card, {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }]}>
        <Image
          source={require('../assets/images/success-check.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Title style={styles.title}>¡Pago realizado con éxito!</Title>
        <Paragraph style={styles.message}>
          Gracias por confiar en nosotros. Tu pago fue procesado y tu reserva está confirmada.
        </Paragraph>

        <Button
          mode="contained"
          onPress={() => router.push('/mis-pagos')}
          style={styles.button}
          contentStyle={{ height: 48 }}
        >
          Ver mi historial de pagos
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fuego: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 160,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    elevation: 4,
    width: '100%',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2e7d32',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#4caf50',
  },
  button: {
    width: '100%',
    borderRadius: 8,
  },
});
