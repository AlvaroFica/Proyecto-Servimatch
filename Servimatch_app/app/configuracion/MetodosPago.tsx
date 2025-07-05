// app/configuracion/MetodosPago.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  Modal,
  Portal,
  Surface,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';

interface MetodoPago {
  id: string;
  tipo: 'Visa' | 'Mastercard' | 'Amex' | 'Otro';
  numeroEnmascarado: string; // Ej: "**** 1234"
  expiracion: string; // Ej: "08/25"
}

export default function MetodosPagoScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  // Estado de métodos de pago; inicialmente vacío para mostrar estado vacío
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Animación de fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animación de FAB
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Aquí iría la llamada para cargar métodos del usuario
    // Por ahora dejamos la lista vacía
  }, []);

  // Manejar apertura del modal de agregar
  const openAgregar = () => setModalVisible(true);
  const closeAgregar = () => setModalVisible(false);

  return (
    <BaseLayout title="Métodos de Pago" back>
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
              Métodos de Pago
            </Title>
          </Surface>

          {/* Sección: Métodos Actuales */}
          <Surface
            style={[styles.sectionSurface, { backgroundColor: theme.colors.surface }]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Métodos Actuales
            </Title>
            <Divider style={styles.divider} />

            {metodos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/images/empty-state.png')}
                  style={styles.emptyImage}
                  resizeMode="contain"
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  No tienes métodos de pago registrados. Toca "+" para agregar uno.
                </Text>
              </View>
            ) : (
              metodos.map((m) => (
                <Card
                  key={m.id}
                  mode="elevated"
                  style={[styles.card, { backgroundColor: theme.colors.surface, elevation: 2 }]}
                >
                  <Card.Title
                    title={`${m.tipo} ${m.numeroEnmascarado}`}
                    subtitle={`Expira: ${m.expiracion}`}
                    titleStyle={[styles.cardTitle, { color: theme.colors.onSurface }]}
                    subtitleStyle={[styles.cardSubtitle, { color: theme.colors.onSurfaceVariant }]}
                    left={(props) =>
                      m.tipo === 'Visa' ? (
                        <Avatar.Icon {...props} icon="credit-card-outline" size={40} color={theme.colors.primary} />
                      ) : m.tipo === 'Mastercard' ? (
                        <Avatar.Icon {...props} icon="credit-card-multiple-outline" size={40} color={theme.colors.primary} />
                      ) : (
                        <Avatar.Icon {...props} icon="credit-card-clock-outline" size={40} color={theme.colors.primary} />
                      )
                    }
                    right={(props) => (
                      <IconButton
                        {...props}
                        icon="trash-can-outline"
                        iconColor={theme.colors.error}
                        onPress={() => {
                          // Lógica para eliminar método, si es necesario
                          setMetodos((prev) => prev.filter((x) => x.id !== m.id));
                        }}
                      />
                    )}
                  />
                </Card>
              ))
            )}
          </Surface>

          {/* Sección: Información Adicional */}
          <Surface
            style={[styles.sectionSurface, { backgroundColor: theme.colors.surface }]}
          >
            <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              ¿Cómo agrego un método?
            </Title>
            <Divider style={styles.divider} />
            <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
              Para agregar un nuevo método de pago, toca el botón "+" en la parte inferior derecha. Podrás ingresar los datos de tu tarjeta de forma segura. ServiMatch utiliza Stripe para procesar pagos de manera confiable y protegida.
            </Text>
          </Surface>
        </Animated.View>
      </ScrollView>

      {/* FAB para agregar nuevo método */}
      <Animated.View
        style={[
          styles.fabContainer,
          { transform: [{ scale: fabScale }], bottom: insets.bottom + 24 },
        ]}
      >
        <FAB icon="plus" onPress={openAgregar} style={[styles.fab, { backgroundColor: theme.colors.primary }]} />
      </Animated.View>

      {/* Modal para formulario de agregar método (estructura básica) */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeAgregar}
          contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
        >
          <Title style={[styles.modalTitle, { color: theme.colors.primary }]}>
            Agregar Método de Pago
          </Title>
          <Divider style={styles.modalDivider} />
          {/* Aquí va el formulario para ingresar los datos de la tarjeta */}
          <Text style={[styles.paragraph, { color: theme.colors.onSurface }]}>
            (Formulario de tarjeta placeholder)  
            Ingresa número de tarjeta, fecha de expiración y código CVV.
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              // Lógica para guardar (placeholder)
              closeAgregar();
            }}
            style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.onPrimary }}
          >
            Guardar
          </Button>
        </Modal>
      </Portal>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  emptyImage: {
    width: 150,
    height: 150,
    tintColor: '#757575',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
  },
  fab: {
    elevation: 4,
  },
  modalContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDivider: {
    marginVertical: 8,
  },
  modalButton: {
    marginTop: 24,
    borderRadius: 8,
  },
});
