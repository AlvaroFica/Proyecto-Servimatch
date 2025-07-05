import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';

const mensajes = [
  '🛠️ Descuentos en herramientas eléctricas esta semana',
  '📦 Kit de carpintería desde $29.990 ¡Sólo hoy!',
  '🚛 Cemento con despacho gratis en Santiago',
  '🔧 Destornilladores 30% OFF por tiempo limitado',
  '🪚 Sierra circular Bosch con precio de distribuidor',
  '🛒 Compra al por mayor y recibe precios exclusivos',
  '🚚 ¡Despacho gratuito por compras sobre $49.990!',
  '🪛 Llaves combinadas en promoción 3x2',
  '🏗️ Todo para tu proyecto: materiales, herramientas y más',
];

export default function BannerRotativo() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Primero hace fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Luego cambia el mensaje y hace fade in
        setIndex((prev) => (prev + 1) % mensajes.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.bannerContainer, { opacity: fadeAnim }]}>
      <Text style={styles.bannerText}>{mensajes[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.select({ ios: 190, android: 5 }),
    left: 16,
    right: 16,
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bannerText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
