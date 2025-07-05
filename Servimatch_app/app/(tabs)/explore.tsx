import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function ExploreScreen() {
  const mensajes = [
    '🛠️ ¡Descuentos en herramientas eléctricas esta semana!',
    '🧰 Kit de carpintería profesional desde $29.990',
    '🧱 Compra cemento y recibe despacho gratis en Santiago',
    '🔧 Pack destornilladores 30% OFF solo por hoy',
    '🪚 Sierra circular Bosch a precio de distribuidor',
    '📦 Compra al por mayor y obtén precios exclusivos',
    '🚚 Despacho gratuito por compras sobre $49.990',
    '🪛 Llaves combinadas en promoción 3x2',
    '🛒 Todo para tu proyecto: herramientas y materiales aquí',
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndex((prev) => (prev + 1) % mensajes.length);
    }, 7000); // 7 segundos

    return () => clearInterval(intervalo);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.fakeBanner}>
        <Text style={styles.bannerText}>{mensajes[index]}</Text>
      </View>

      <Text style={{ marginTop: 20 }}>Explorar contenido principal aquí</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  fakeBanner: {
    width: '90%',
    backgroundColor: '#2B6CB0',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  bannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
