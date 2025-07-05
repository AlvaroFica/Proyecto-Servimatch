import React from 'react'
import { SafeAreaView, Text, StyleSheet } from 'react-native'

export default function AyudaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Centro de Ayuda</Text>
      {/* Aquí tu contenido de ayuda */}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
})
