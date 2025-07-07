// app/planes.tsx
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    FAB,
    TextInput as PaperInput,
    Modal as PaperModal,
    Paragraph,
    Portal,
    Subheading,
    Title,
    useTheme
} from 'react-native-paper';
import BaseLayout from '../components/BaseLayout';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://192.168.137.6:8000';

interface Servicio {
  id: number;
  nombre: string;
}

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_estimado: string;
  precio: string;
  servicio: Servicio;
}

export default function PlanesScreen() {
  const { tokens } = useAuth();
  const theme = useTheme();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [servicioId, setServicioId] = useState<number | ''>('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('00:30:00');
  const [precio, setPrecio] = useState('0.00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tokens?.access) return;
    fetchPlanes();
    fetchServicios();
  }, [tokens]);

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/planes/`, {
        headers: { Authorization: `Bearer ${tokens!.access}` },
      });
      if (res.ok) {
        setPlanes(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicios = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/servicios/`, {
        headers: { Authorization: `Bearer ${tokens!.access}` },
      });
      if (res.ok) setServicios(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const crearPlan = async () => {
    if (!tokens?.access || !servicioId || !nombre || !precio) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/planes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens!.access}`,
        },
        body: JSON.stringify({
          servicio: servicioId,
          nombre,
          descripcion,
          duracion_estimado: duracion,
          precio,
        }),
      });
      if (res.ok) {
        resetForm();
        setModalVisible(false);
        fetchPlanes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setServicioId('');
    setNombre('');
    setDescripcion('');
    setDuracion('00:30:00');
    setPrecio('0.00');
  };

  const renderPlan = ({ item }: { item: Plan }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Title style={[styles.cardTitle, { color: theme.colors.onSurface }]}>
        {item.nombre}
      </Title>
      <Paragraph style={[styles.cardSubtitle, { color: theme.colors.primary }]}>
        {item.servicio.nombre}
      </Paragraph>
      <Paragraph style={[styles.cardText, { color: theme.colors.onSurface }]}>
        {item.descripcion}
      </Paragraph>
      <View style={styles.cardFooter}>
        <Paragraph style={{ color: theme.colors.onSurface }}>
          Duración: {item.duracion_estimado}
        </Paragraph>
        <Paragraph style={{ color: theme.colors.onSurface }}>
          Precio: ${item.precio}
        </Paragraph>
      </View>
    </View>
  );

  return (
    <BaseLayout title="Mis Planes" back>
      {(!tokens?.access || loading) ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <FlatList
            data={planes}
            keyExtractor={p => p.id.toString()}
            renderItem={renderPlan}
            contentContainerStyle={styles.list}
          />

          <FAB
            icon="plus"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={() => setModalVisible(true)}
          />

          <Portal>
            <PaperModal
              visible={modalVisible}
              onDismiss={() => setModalVisible(false)}
              contentContainerStyle={[styles.modalContent, { backgroundColor: theme.colors.background }]}
            >
              <ScrollView>
                <Title style={{ marginBottom: 16 }}>Crear Nuevo Plan</Title>

                <Subheading>Servicio</Subheading>
                <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface }]}>
                  <Picker
                    selectedValue={servicioId}
                    onValueChange={val => setServicioId(val)}
                  >
                    <Picker.Item label="Selecciona servicio" value="" />
                    {servicios.map(s => (
                      <Picker.Item key={s.id} label={s.nombre} value={s.id} />
                    ))}
                  </Picker>
                </View>

                <Subheading>Nombre del Plan</Subheading>
                <PaperInput
                  mode="outlined"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: Mantenimiento Básico"
                  style={styles.input}
                />

                <Subheading>Descripción</Subheading>
                <PaperInput
                  mode="outlined"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Descripción del plan"
                  multiline
                  style={[styles.input, { minHeight: 80 }]}
                />

                <Subheading>Duración (HH:MM:SS)</Subheading>
                <PaperInput
                  mode="outlined"
                  value={duracion}
                  onChangeText={setDuracion}
                  style={styles.input}
                />

                <Subheading>Precio</Subheading>
                <PaperInput
                  mode="outlined"
                  value={precio}
                  onChangeText={setPrecio}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <Button
                  mode="contained"
                  onPress={crearPlan}
                  loading={submitting}
                  disabled={submitting}
                  style={{ marginTop: 20 }}
                >
                  Crear Plan
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={{ marginTop: 10 }}
                >
                  Cancelar
                </Button>
              </ScrollView>
            </PaperModal>
          </Portal>
        </>
      )}
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  list: { padding: 16, paddingBottom: 80 },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSubtitle: { fontSize: 14, marginTop: 4 },
  cardText: { fontSize: 14, marginTop: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  modalContent: {
    margin: 20,
    borderRadius: 8,
    padding: 16,
  },
  pickerContainer: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  input: { marginBottom: 12 },
});
