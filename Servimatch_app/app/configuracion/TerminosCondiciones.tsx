// app/configuracion/TerminosCondiciones.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import {
    Divider,
    Surface,
    Text,
    Title,
    useTheme,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';

export default function TerminosCondicionesScreen() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de aparición
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <BaseLayout title="Términos y Condiciones" back>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <Surface
            style={[
              styles.headerSurface,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Title
              style={[
                styles.headerTitle,
                { color: theme.colors.onPrimaryContainer },
              ]}
            >
              Términos y Condiciones
            </Title>
          </Surface>

          {/* 1. Introducción */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              1. Introducción
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Bienvenido a ServiMatch. Al utilizar nuestra aplicación, aceptas cumplir y 
              estar sujeto a los siguientes Términos y Condiciones. Lee cuidadosamente 
              este documento antes de continuar.
            </Text>
          </Surface>

          {/* 2. Definiciones */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              2. Definiciones
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              <Text style={styles.boldText}>“Aplicación”</Text>: Se refiere a 
              la plataforma móvil ServiMatch desarrollada para conectar clientes y trabajadores.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              <Text style={styles.boldText}>“Usuario”</Text>: Cualquier persona que 
              descargue, acceda o use la Aplicación, ya sea como cliente, trabajador o ambos.
            </Text>
          </Surface>

          {/* 3. Uso de la Aplicación */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              3. Uso de la Aplicación
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.1 Para crear una cuenta, el Usuario debe proporcionar información precisa y completa.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.2 El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.3 No se permite el uso de bots, scrapers u otros medios automatizados para interactuar con la Aplicación.
            </Text>
          </Surface>

          {/* 4. Propiedad Intelectual */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              4. Propiedad Intelectual
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Todo el contenido, marcas, logotipos y diseño visual de la Aplicación son propiedad 
              de ServiMatch o de sus respectivos dueños. No se permite la reproducción, distribución 
              o modificación sin autorización expresa y por escrito.
            </Text>
          </Surface>

          {/* 5. Limitación de Responsabilidad */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              5. Limitación de Responsabilidad
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              ServiMatch no se hace responsable por daños directos, indirectos, incidentales o 
              consecuentes que resulten del uso o la imposibilidad de uso de la Aplicación, incluidos, 
              pero no limitados a, pérdida de datos, ingresos o beneficios.
            </Text>
          </Surface>

          {/* 6. Modificaciones a los Términos */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              6. Modificaciones a los Términos
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              6.1 Nos reservamos el derecho de actualizar estos Términos y Condiciones en cualquier 
              momento.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              6.2 Las actualizaciones se anunciarán en la Aplicación y entrarán en vigor 5 días después 
              de su publicación. El uso continuado de la Aplicación implica la aceptación de los nuevos términos.
            </Text>
          </Surface>

          {/* 7. Contacto */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title
              style={[styles.sectionTitle, { color: theme.colors.primary }]}
            >
              7. Contacto
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Si tienes preguntas sobre estos Términos y Condiciones, contáctanos a:
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              <Text style={styles.boldText}>Correo:</Text> soporte@servimatch.app
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              <Text style={styles.boldText}>Teléfono:</Text> +56 9 1234 5678
            </Text>
          </Surface>
        </Animated.View>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSurface: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionSurface: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  divider: {
    marginVertical: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
  },
  spacer: {
    marginBottom: 12, // separador vertical entre párrafos
  },
});
