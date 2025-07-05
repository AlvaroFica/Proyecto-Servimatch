// app/configuracion/ayuda.tsx

import { useRouter } from 'expo-router'; // ← importa useRouter de expo-router
import React, { useEffect, useRef } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Divider,
  List,
  Surface,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';

export default function AyudaSoporteScreen() {
  const theme = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 1) Obtienes el router
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const faqs = [
    {
      question: '¿Cómo puedo cambiar mi contraseña?',
      answer:
        'Ve a “Cuenta” → “Editar perfil” y toca el ícono de contraseña para establecer una nueva.',
    },
    {
      question: '¿Cómo reporto un error en la app?',
      answer:
        'Envíanos un correo a soporte@servimatch.app usando el botón “Enviar email” más abajo.',
    },
    {
      question: '¿Dónde puedo ver mis facturas o métodos de pago?',
      answer:
        'En “Cuenta” → “Métodos de pago” encontrarás tu historial y opciones para agregar o editar tarjetas.',
    },
  ];

  const openEmail = () => {
    Linking.openURL('mailto:soporte@servimatch.app?subject=Soporte%20ServiMatch');
  };

  const openPhone = () => {
    Linking.openURL('tel:+56912345678');
  };

  return (
    <BaseLayout title="Ayuda y Soporte" back>
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
              Ayuda y Soporte
            </Title>
            <Text
              style={[styles.headerSubtitle, { color: theme.colors.onPrimaryContainer }]}
            >
              Encuentra respuestas o contáctanos directamente
            </Text>
          </Surface>

          {/* Preguntas Frecuentes */}
          <Surface
            style={[styles.sectionSurface, { backgroundColor: theme.colors.surface }]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Preguntas Frecuentes
            </Title>
            <Divider style={styles.divider} />
            <List.Section>
              {faqs.map((item, index) => (
                <List.Accordion
                  key={index}
                  title={item.question}
                  titleStyle={{ color: theme.colors.onSurface, fontWeight: '600' }}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon="help-circle-outline"
                      color={theme.colors.primary}
                    />
                  )}
                  style={styles.accordion}
                >
                  <List.Item
                    title={item.answer}
                    titleNumberOfLines={10}
                    titleStyle={{ color: theme.colors.onSurfaceVariant }}
                  />
                </List.Accordion>
              ))}
            </List.Section>
          </Surface>

          {/* Contacto */}
          <Surface
            style={[styles.sectionSurface, { backgroundColor: theme.colors.surface }]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Contáctanos
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.contactText, { color: theme.colors.onSurface }]}>
              Si no encuentras la respuesta que buscas, comunícate con nuestro equipo de soporte:
            </Text>
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                icon="email-outline"
                onPress={openEmail}
                style={[styles.contactButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.onPrimary }}
                contentStyle={styles.contactButtonContent}
                rippleColor={theme.colors.onPrimary + '33'}
              >
                Enviar email
              </Button>
              <Button
                mode="outlined"
                icon="phone-outline"
                onPress={openPhone}
                style={[styles.contactButton, { borderColor: theme.colors.primary }]}
                labelStyle={{ color: theme.colors.primary }}
                contentStyle={styles.contactButtonContent}
              >
                Llamar
              </Button>
            </View>
          </Surface>

          {/* Recursos Adicionales */}
          <Surface
            style={[styles.sectionSurface, { backgroundColor: theme.colors.surface }]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Recursos
            </Title>
            <Divider style={styles.divider} />
            <List.Section>
              <List.Item
                title="Términos y Condiciones"
                left={props => (
                  <List.Icon {...props} icon="file-document" color={theme.colors.primary} />
                )}
                /** 2) Aquí navegas usando router.push('/configuracion/terminos-condiciones') **/
                onPress={() => router.push('/configuracion/TerminosCondiciones')}
                titleStyle={{ color: theme.colors.onSurface }}
              />
              <List.Item
                title="Política de Privacidad"
                left={props => (
                  <List.Icon {...props} icon="shield-lock" color={theme.colors.primary} />
                )}
                onPress={() => router.push('/configuracion/PoliticasPrivacidad')}
                titleStyle={{ color: theme.colors.onSurface }}
              />
              <List.Item
                title="Manual de Usuario"
                left={props => (
                  <List.Icon {...props} icon="book-open" color={theme.colors.primary} />
                )}
                onPress={() => router.push('/configuracion/ManualUsuario')}
                titleStyle={{ color: theme.colors.onSurface }}
              />
            </List.Section>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionSurface: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  contactText: {
    fontSize: 14,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  contactButtonContent: {
    height: 48,
  },
});
