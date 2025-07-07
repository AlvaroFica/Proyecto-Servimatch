// app/configuracion/PoliticasPrivacidad.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import {
  Divider,
  Surface,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';

// Componente de Card expandible animada
const ExpandableCard = ({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Ajusta según contenido
  });

  return (
    <Surface
      style={[
        styles.sectionSurface,
        { backgroundColor: theme.colors.surface, overflow: 'hidden' },
      ]}
    >
      <Text
        style={[styles.sectionTitle, { color: theme.colors.primary, marginBottom: 0 }]}
        onPress={() => setExpanded(prev => !prev)}
      >
        {title}
      </Text>
      <Divider style={styles.divider} />
      <Animated.View style={{ maxHeight, opacity: animation }}>
        {expanded && <View>{children}</View>}
      </Animated.View>
    </Surface>
  );
};

export default function PoliticasPrivacidadScreen() {
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
    <BaseLayout title="Políticas de Privacidad" back>
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
              Políticas de Privacidad
            </Title>
          </Surface>

          {/* Secciones expandibles */}
          <ExpandableCard title="1. Introducción" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              En ServiMatch valoramos tu privacidad y nos comprometemos a proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos tus datos cuando utilizas nuestra aplicación móvil.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="2. Información que recopilamos" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.1 <Text style={styles.boldText}>Datos de Registro:</Text> Cuando creas una cuenta, solicitamos tu nombre completo, correo electrónico, número de teléfono y una contraseña segura.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.2 <Text style={styles.boldText}>Información de Perfil:</Text> Puedes proporcionar voluntariamente datos adicionales como una foto de perfil, dirección y descripción breve de tu servicio (para trabajadores).
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.3 <Text style={styles.boldText}>Datos de Ubicación:</Text> Con tu permiso, capturamos la ubicación geográfica para mostrar servicios cercanos y solicitudes relevantes.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              2.4 <Text style={styles.boldText}>Datos de Uso:</Text> Recopilamos información técnica sobre tu dispositivo, la versión de la app, registros de inicio de sesión y uso de funcionalidades para mejorar la experiencia y solucionar errores.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="3. Cómo usamos tu información" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.1 <Text style={styles.boldText}>Proveer el servicio:</Text> Para permitir que clientes y trabajadores se conecten, procesar solicitudes y gestionar pagos mediante Stripe.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.2 <Text style={styles.boldText}>Mejorar la plataforma:</Text> Analizamos patrones de uso para optimizar funciones, corregir errores y ofrecer nuevas actualizaciones.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.3 <Text style={styles.boldText}>Comunicación:</Text> Para enviarte notificaciones, confirmaciones de reserva, recordatorios y actualizaciones relevantes a través de correo electrónico o notificaciones push.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              3.4 <Text style={styles.boldText}>Seguridad:</Text> Monitoreamos actividad sospechosa y protegemos nuestra plataforma de fraudes y accesos no autorizados.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="4. Compartir información" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.1 <Text style={styles.boldText}>Proveedores de servicios:</Text> Podemos compartir datos con terceros como plataformas de pago (Stripe) y servicios de notificaciones push para cumplir con tus solicitudes.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.2 <Text style={styles.boldText}>Requerimientos legales:</Text> Compartiremos información si así lo exige la ley, una orden judicial o para proteger nuestros derechos y los de terceros.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              4.3 <Text style={styles.boldText}>Transacciones comerciales:</Text> En caso de venta, fusión o reorganización, tus datos podrán ser transferidos al nuevo propietario o entidad sucesora con los mismos términos de privacidad.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="5. Uso de cookies y tecnologías similares" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              5.1 <Text style={styles.boldText}>Cookies:</Text> Utilizamos cookies y almacenamiento local para guardar preferencias del usuario y mejorar la experiencia de navegación.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              5.2 <Text style={styles.boldText}>SDKs de terceros:</Text> Herramientas analíticas (por ejemplo, Google Analytics) pueden usar cookies para entender el comportamiento del usuario. Estos SDKs tienen sus propias políticas de privacidad.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="6. Seguridad de los datos" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra accesos no autorizados, alteraciones o divulgaciones. Sin embargo, ningún método de transmisión por Internet es 100% seguro, por lo que no podemos garantizar seguridad absoluta.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="7. Derechos del usuario" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.1 <Text style={styles.boldText}>Acceso:</Text> Puedes solicitar una copia de los datos que tenemos sobre ti.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.2 <Text style={styles.boldText}>Corrección:</Text> Si detectas datos incorrectos o incompletos, puedes solicitarnos que los actualicemos.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.3 <Text style={styles.boldText}>Eliminación:</Text> Tienes derecho a pedirnos que eliminemos tu cuenta y la información asociada, salvo que exista una obligación legal de mantener ciertos datos.
            </Text>
            <View style={styles.spacer} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              7.4 <Text style={styles.boldText}>Oposición:</Text> Puedes oponerte al procesamiento de tus datos con fines de marketing directo o perfilado.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="8. Cambios en esta política" theme={theme}>
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Publicaremos la versión actualizada en la aplicación y, si los cambios son significativos, notificaremos a los usuarios registrados antes de su entrada en vigor.
            </Text>
          </ExpandableCard>

          <ExpandableCard title="9. Contacto" theme={theme}>
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
          </ExpandableCard>
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
