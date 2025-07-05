// app/configuracion/ManualUsuario.tsx

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

export default function ManualUsuarioScreen() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <BaseLayout title="Manual de Usuario" back>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Encabezado */}
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
              Manual de Usuario
            </Title>
          </Surface>

          {/* 1. Introducción */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              1. Introducción
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Bienvenido a ServiMatch, la plataforma que conecta clientes con trabajadores de servicios en tu zona. Este manual te guiará paso a paso para que aproveches todas las funcionalidades disponibles, tanto si eres cliente como trabajador.
            </Text>
          </Surface>

          {/* 2. Registro de cuenta */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              2. Registro de Cuenta
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.1 Abre la aplicación y selecciona “Crear cuenta”.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.2 Ingresa tu nombre completo, correo electrónico y teléfono. Elige una contraseña segura.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.3 Selecciona tu rol: Cliente, Trabajador o Ambos. Esto determinará las secciones de la app a las que tendrás acceso.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.4 Verifica tu cuenta a través del correo electrónico que recibirás para activar tu perfil.
            </Text>
          </Surface>

          {/* 3. Navegación en la aplicación */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              3. Navegación en la Aplicación
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.1 Barra inferior:  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              • Inicio: Pantalla principal con servicios destacados (solo clientes).  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              • Mapa: Muestra trabajadores cercanos (solo clientes) o solicitudes cercanas (solo trabajadores).  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              • Notificaciones: Historial de solicitudes, confirmaciones y mensajes.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              • Cuenta: Ajustes de perfil, métodos de pago y configuración de la app.
            </Text>
          </Surface>

          {/* 4. Cómo buscar y contratar servicios (para clientes) */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              4. Cómo Buscar y Contratar Servicios
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.1 En la pestaña “Mapa”, verás trabajadores disponibles cerca de tu ubicación.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.2 Filtra por tipo de servicio (plomería, carpintería, limpieza, etc.) usando el icono de filtro en la parte superior.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.3 Toca el marcador de un trabajador para ver su tarjeta de perfil resumen, con calificación, precio por hora y servicios ofrecidos.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.4 Pulsa “Ver Perfil” para detalles completos y presiona “Contratar” para iniciar la solicitud de servicio.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.5 Selecciona fecha y hora, describe tu necesidad, revisa el costo estimado y confirma el pedido.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.6 El trabajador recibirá la solicitud y podrás hacer seguimiento desde “Notificaciones”.
            </Text>
          </Surface>

          {/* 5. Cómo aceptar solicitudes (para trabajadores) */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              5. Cómo Aceptar Solicitudes
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              5.1 En la pestaña “Mapa”, verás solicitudes cercanas publicadas por clientes.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              5.2 Toca el marcador de la solicitud para ver resumen: tipo de servicio, ubicación, fecha y descripción.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              5.3 Pulsa “Ver Detalles” para información completa y presiona “Aceptar Solicitud” si deseas ayudar al cliente.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              5.4 Una vez aceptada, aparecerá en tu historial y se notificará al cliente para coordinar los detalles finales.
            </Text>
          </Surface>

          {/* 6. Perfil y configuración */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              6. Perfil y Configuración
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              6.1 Accede a “Cuenta” desde la barra inferior. Aquí puedes editar tu foto, nombre, correo y teléfono.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              6.2 Cambia tu rol (Cliente/Trabajador) en cualquier momento usando el selector de rol en tu perfil.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              6.3 Agrega o elimina métodos de pago en “Métodos de Pago” para procesar transacciones seguras.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              6.4 Ajusta notificaciones, permisos de ubicación y privacidad desde “Configuración” en el menú de perfil.
            </Text>
          </Surface>

          {/* 7. Pagos y facturación */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              7. Pagos y Facturación
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.1 Todos los pagos se procesan a través de Stripe.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.2 Cuando confirmas un servicio, se cargará el monto estimado a tu tarjeta registrada.  
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.3 Después de completado el servicio, recibirás un recibo por correo y podrás ver el historial en “Facturación” dentro de tu perfil.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.4 Los trabajadores reciben el pago directamente a su cuenta vinculada 24 horas después de la confirmación de finalización.
            </Text>
          </Surface>

          {/* 8. Soporte y contacto */}
          <Surface
            style={[
              styles.sectionSurface,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              8. Soporte y Contacto
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Si tienes dudas adicionales, envíanos un correo a soporte@servimatch.app o revisa la sección de “Ayuda y Soporte” en el menú. También puedes llamarnos al +56 9 1234 5678 para asistencia inmediata.
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
    marginBottom: 12,
  },
});
