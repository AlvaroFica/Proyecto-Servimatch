import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  StatusBar,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Paragraph,
  Title,
  useTheme,
  IconButton,
  Appbar,
  FAB,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const API = 'http://192.168.100.9:8000';

export default function PlanesTrabajadorScreen() {
  const { tokens } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [planes, setPlanes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [durHoras, setDurHoras] = useState<string>('1');
  const [precio, setPrecio] = useState<string>('0');
  const [incluyeInput, setIncluyeInput] = useState('');
  const [incluye, setIncluye] = useState<string[]>([]);
  const [descripcionError, setDescripcionError] = useState('');

  useEffect(() => {
    fetch(`${API}/api/planes/mis/`, {
      headers: { Authorization: `Bearer ${tokens?.access}`
 },
    })
      .then(r => r.json())
      .then(setPlanes)
      .catch(console.error);
  }, [tokens]);

  const submitPlan = () => {
    if (!nombre.trim()) return Alert.alert('Debe ingresar el nombre del plan');
    const durStr = `${durHoras.padStart(2, '0')}:00:00`;

    if (descripcion.trim().length < 50) {
      return Alert.alert('La descripción debe tener al menos 50 caracteres');
    }

    fetch(`${API}/api/planes/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens?.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        descripcion,
        duracion_estimado: durStr,
        precio,
        incluye,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al crear el plan');
        return res.json();
      })
      .then(nuevo => {
        setPlanes([nuevo, ...planes]);
        setShowForm(false);
        setNombre('');
        setDescripcion('');
        setDurHoras('1');
        setPrecio('0');
        setIncluye([]);
        setIncluyeInput('');
      })
      .catch(err => Alert.alert(err.message));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#00796B" barStyle="light-content" />
      <Appbar style={styles.appBar}>
        <Appbar.BackAction color="white" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mis planes" titleStyle={styles.appBarTitle} />
      </Appbar>

      <ScrollView contentContainerStyle={styles.container}>
        {planes.map(p => (
          <Card key={p.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="tools" size={20} />
                <Title style={styles.cardTitle}>{p.nombre}</Title>
              </View>

              <Paragraph style={styles.cardText}>{p.descripcion}</Paragraph>
              <Paragraph style={styles.cardMeta}>
                Duración: {Math.floor(p.duracion_estimado.split(':')[0])}h   |   Precio: ${p.precio}
              </Paragraph>

              <View style={styles.chipContainer}>
                {p.incluye.map((item: string, i: number) => (
                  <Chip key={i} style={styles.chip} textStyle={{ fontSize: 13 }}>
                    {item}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        color="white"
        style={styles.fab}
        onPress={() => setShowForm(true)}
      />

      <Modal visible={showForm} animationType="slide">
        <ScrollView contentContainerStyle={styles.form}>
          <Title style={styles.title}>Nuevo plan</Title>

          {/* Nombre del plan */}
          <TextInput
            placeholder="Nombre del plan"
            value={nombre}
            onChangeText={setNombre}
            autoFocus
            style={styles.input}
          />

          {/* Descripción */}
          <TextInput
            placeholder="Descripción del plan"
            value={descripcion}
            onChangeText={(text) => {
              setDescripcion(text);
              const len = text.trim().length;
              setDescripcionError(
                len < 50 ? `Faltan ${50 - len} caracteres para el mínimo.` : ''
              );
            }}
            multiline
            style={styles.input}
          />

          <Paragraph
            style={{
              fontSize: 13,
              color: descripcion.trim().length < 50 ? 'red' : 'green',
              fontWeight: '500',
              fontStyle: 'italic',
              marginBottom: 8,
            }}
          >
            {descripcion.trim().length < 50
              ? `Faltan ${50 - descripcion.trim().length} caracteres para el mínimo.`
              : '¡Buena descripción! ✔️'}
          </Paragraph>

          {/* Duración y Precio */}
          <View style={styles.row}>
            <View style={styles.halfInputContainer}>
              <Paragraph style={styles.label}>Duración (horas)</Paragraph>
              <TextInput
                keyboardType="numeric"
                value={durHoras}
                onChangeText={setDurHoras}
                style={styles.input}
                placeholder="Ej: 1"
              />
              {parseInt(durHoras) <= 0 && (
                <Paragraph style={styles.errorText}>Debe ser mayor a 0</Paragraph>
              )}
            </View>

            <View style={styles.halfInputContainer}>
              <Paragraph style={styles.label}>Precio (CLP)</Paragraph>
              <TextInput
                keyboardType="numeric"
                value={precio}
                onChangeText={setPrecio}
                style={styles.input}
                placeholder="Ej: 20000"
              />
              {parseInt(precio) <= 0 && (
                <Paragraph style={styles.errorText}>Debe ser mayor a 0</Paragraph>
              )}
            </View>
          </View>

          {/* Incluye */}
          <Paragraph style={styles.label}>Incluye</Paragraph>
          <View style={styles.addIncluyeRow}>
            <TextInput
              placeholder="Ej: Mano de obra, materiales"
              value={incluyeInput}
              onChangeText={setIncluyeInput}
              style={[styles.input, styles.inputFlex]}
            />
            <IconButton
              icon="plus"
              size={28}
              iconColor="white"
              containerColor="#00796B"
              onPress={() => {
                if (incluyeInput.trim()) {
                  setIncluye([...incluye, incluyeInput.trim()]);
                  setIncluyeInput('');
                }
              }}
              style={styles.iconButton}
            />
          </View>


          <View style={styles.chipContainer}>
            {incluye.map((it, i) => (
              <Chip
                key={i}
                onClose={() => setIncluye(incluye.filter((_, j) => j !== i))}
                style={styles.chip}
              >
                {it}
              </Chip>
            ))}
          </View>
          
          {/* Botón Guardar */}
          <Button mode="contained" onPress={submitPlan} style={styles.saveBtn}>
            Guardar plan
          </Button>

          {/* Botón Cancelar */}
          <Button onPress={() => setShowForm(false)} style={styles.cancelBtn}>
            <Paragraph style={{ color: '#00796B', fontWeight: '500' }}>Cancelar</Paragraph>
          </Button>
        </ScrollView>


      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  appBar: {
    backgroundColor: '#00796B',
    height: 56, // altura estándar para mantenerlo compacto
    elevation: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
  },
  container: { padding: 16, paddingBottom: 100 },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingHorizontal: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },
  cardMeta: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#00796B',
  },
  form: { padding: 16 },
  title: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 16,
  textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  halfInputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
  },
  inputFlex: { flex: 1 },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#f0e9ff',
    borderRadius: 16,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#00796B',
    borderRadius: 30,
  },
  cancelBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 2,
  },
  addIncluyeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
  borderRadius: 100,
  backgroundColor: '#00796B',
  marginLeft: 8,
},
  addButtonContent: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  addButtonLabel: {
    color: 'white',
    fontSize: 24,
    marginTop: -2,
  },
  iconButton: {
  borderRadius: 24,
  marginLeft: 8,
  marginTop: 2,
},

  
});
