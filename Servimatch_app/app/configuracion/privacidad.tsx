// app/configuracion/Privacidad.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import {
  Divider,
  Surface,
  Text,
  Title,
  useTheme,
  TouchableRipple,
  IconButton,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';

export default function PrivacidadScreen() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Sección 1 abierta por defecto
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({ 1: true });

  const toggleSection = (index: number) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Animación fade para el contenido de cada sección
  const AnimatedSection: React.FC<{ visible: boolean; children: React.ReactNode }> = ({ visible, children }) => {
    const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;
    useEffect(() => {
      Animated.timing(anim, {
        toValue: visible ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, [visible]);
    if (!visible) return null;
    return (
      <Animated.View style={{ opacity: anim }}>
        {children}
      </Animated.View>
    );
  };

  // Helper para Surface padding dinámico
  const getSectionSurfaceStyle = (isOpen: boolean) => [
    styles.sectionSurface,
    { backgroundColor: theme.colors.surface },
    !isOpen && { paddingVertical: 8, paddingHorizontal: 12 },
  ];

  // Helper para el indicador visual
  const Chevron = ({ open }: { open: boolean }) => (
    <IconButton
      icon={open ? 'chevron-up' : 'chevron-down'}
      size={22}
      style={{ margin: 0 }}
      accessibilityLabel={open ? 'Colapsar sección' : 'Expandir sección'}
    />
  );

  return (
    <BaseLayout title="Política de Privacidad" back>
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
              Política de Privacidad
            </Title>
          </Surface>

          {/* Secciones */}
          {[ // Sección config
            {
              key: 1,
              title: '1. Introducción',
              content: (
                <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                  En ServiMatch, valoramos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos tus datos cuando utilizas nuestra aplicación.
                </Text>
              ),
            },
            {
              key: 2,
              title: '2. Información que recopilamos',
              content: (
                <>
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    2.1 <Text style={styles.boldText}>Datos de Registro:</Text> Cuando creas una cuenta, te solicitamos nombre, correo electrónico, número de teléfono y contraseña.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    2.2 <Text style={styles.boldText}>Información de Perfil:</Text> Puedes proporcionar adicionalmente foto de perfil, dirección y una breve descripción.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    2.3 <Text style={styles.boldText}>Datos de Uso:</Text> Recopilamos registros de acceso, navegación en la app y datos técnicos (tipo de dispositivo, sistema operativo) para mejorar la experiencia.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    2.4 <Text style={styles.boldText}>Datos de Ubicación:</Text> Con tu permiso, obtenemos tu ubicación para ofrecer servicios y resultados cercanos.
                  </Text>
                </>
              ),
            },
            {
              key: 3,
              title: '3. Cómo usamos tu información',
              content: (
                <>
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    3.1 <Text style={styles.boldText}>Proveer el servicio:</Text> Utilizamos tus datos para conectar clientes con trabajadores, procesar pagos y gestionar solicitudes.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    3.2 <Text style={styles.boldText}>Mejorar la aplicación:</Text> Analizamos patrones de uso para optimizar funciones, corregir errores y lanzar actualizaciones.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    3.3 <Text style={styles.boldText}>Comunicaciones:</Text> Te enviamos notificaciones, confirmaciones y recordatorios por correo electrónico o notificaciones push.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    3.4 <Text style={styles.boldText}>Seguridad:</Text> Supervisamos actividad sospechosa y protegemos la plataforma contra fraudes y accesos no autorizados.
                  </Text>
                </>
              ),
            },
            {
              key: 4,
              title: '4. Compartir información',
              content: (
                <>
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    4.1 <Text style={styles.boldText}>Proveedores de servicios:</Text> Podemos compartir datos con terceros como procesadores de pago (por ejemplo, Stripe) y servicios de notificaciones push para cumplir con tus solicitudes.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    4.2 <Text style={styles.boldText}>Requisitos legales:</Text> Podemos divulgar información si lo exige la ley, una orden judicial o para proteger nuestros derechos o los de terceros.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    4.3 <Text style={styles.boldText}>Fusiones y adquisiciones:</Text> En caso de venta, fusión o reestructuración, tus datos podrán transferirse al nuevo propietario con los mismos términos de privacidad.
                  </Text>
                </>
              ),
            },
            {
              key: 5,
              title: '5. Uso de cookies y tecnologías similares',
              content: (
                <>
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    5.1 <Text style={styles.boldText}>Cookies:</Text> Utilizamos cookies y almacenamiento local para recopilar información sobre tus preferencias y mejorar la experiencia de navegación.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    5.2 <Text style={styles.boldText}>SDKs de terceros:</Text> Herramientas analíticas (p. ex., Google Analytics) pueden usar cookies para entender el comportamiento del usuario. Estas herramientas tienen sus propias políticas de privacidad.
                  </Text>
                </>
              ),
            },
            {
              key: 6,
              title: '6. Seguridad de los datos',
              content: (
                <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                  Implementamos medidas técnicas y organizativas para proteger tu información contra accesos no autorizados, alteraciones o divulgaciones. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
                </Text>
              ),
            },
            {
              key: 7,
              title: '7. Derechos del usuario',
              content: (
                <>
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    7.1 <Text style={styles.boldText}>Acceso:</Text> Puedes solicitar una copia de tus datos personales que tenemos registrados.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    7.2 <Text style={styles.boldText}>Corrección:</Text> Si detectas errores o información incompleta, puedes solicitarnos la actualización de tus datos.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    7.3 <Text style={styles.boldText}>Eliminación:</Text> Tienes derecho a que eliminemos tus datos personales, salvo que exista una obligación legal de conservación.
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    7.4 <Text style={styles.boldText}>Oposición:</Text> Puedes oponerte al tratamiento de tus datos con fines de marketing o perfilado.
                  </Text>
                </>
              ),
            },
            {
              key: 8,
              title: '8. Cambios en esta política',
              content: (
                <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                  Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Publicaremos la versión actualizada en la aplicación y, si los cambios son significativos, notificaremos a los usuarios registrados antes de su entrada en vigor.
                </Text>
              ),
            },
            {
              key: 9,
              title: '9. Contacto',
              content: (
                <>
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer alguno de tus derechos, contáctanos:
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    <Text style={styles.boldText}>Correo:</Text> privacidad@servimatch.app
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    <Text style={styles.boldText}>Teléfono:</Text> +56 9 1234 5678
                  </Text>
                  <View style={styles.spacer} />
                  <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
                    <Text style={styles.boldText}>Dirección:</Text> Av. Ejemplo 1234, Santiago, Chile
                  </Text>
                </>
              ),
            },
          ].map(section => (
            <TouchableRipple
              key={section.key}
              onPress={() => toggleSection(section.key)}
              rippleColor="rgba(0,0,0,.12)"
              accessibilityRole="button"
              accessibilityState={{ expanded: !!expanded[section.key] }}
            >
              <Surface style={getSectionSurfaceStyle(!!expanded[section.key])}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                    {section.title}
                  </Title>
                  <Chevron open={!!expanded[section.key]} />
                </View>
                <Divider style={styles.divider} />
                <AnimatedSection visible={!!expanded[section.key]}>
                  {section.content}
                </AnimatedSection>
              </Surface>
            </TouchableRipple>
          ))}
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
