import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Button, Card, Chip, Paragraph, Title, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const API = 'http://192.168.100.109:8000';

export default function PlanesTrabajadorScreen() {
  const { tokens } = useAuth();
  const { colors } = useTheme();

  // Guard: si no hay token, mostramos loader
  if (!tokens?.access) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  const [planes, setPlanes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [durHoras, setDurHoras] = useState<string>('1');
  const [precio, setPrecio] = useState<string>('0');
  const [incluyeInput, setIncluyeInput] = useState('');
  const [incluye, setIncluye] = useState<string[]>([]);

  // Carga inicial de planes
  useEffect(() => {
    fetch(`${API}/api/planes/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then(r => r.json())
      .then(setPlanes)
      .catch(console.error);
  }, [tokens]);

  const submitPlan = () => {
    // Validación mínima
    if (!nombre.trim()) return Alert.alert('Debe ingresar el nombre del plan');
    const durStr = `${durHoras.padStart(2, '0')}:00:00`;

    fetch(`${API}/api/planes/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.access}`,
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
        // limpiar formulario
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
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Button
          icon="plus"
          mode="contained"
          onPress={() => setShowForm(true)}
          style={styles.addBtn}
        >
          Agregar plan
        </Button>

        {planes.map(p => (
          <Card key={p.id} style={styles.card}>
            <Card.Content>
              <Title>{p.nombre}</Title>
              <Paragraph>{p.descripcion}</Paragraph>
              <Paragraph>
                Duración: {Math.floor(p.duracion_estimado.split(':')[0])}h&nbsp;
                Precio: ${p.precio}
              </Paragraph>
              <View style={styles.chipContainer}>
                {p.incluye.map((item: string, i: number) => (
                  <Chip key={i} style={styles.chip}>
                    {item}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={showForm} animationType="slide">
        <ScrollView contentContainerStyle={styles.form}>
          <Title>Nuevo plan</Title>

          <TextInput
            placeholder="Nombre del plan"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.input}
            multiline
          />
          <TextInput
            placeholder="Duración (horas)"
            keyboardType="numeric"
            value={durHoras}
            onChangeText={setDurHoras}
            style={styles.input}
          />
          <TextInput
            placeholder="Precio"
            keyboardType="numeric"
            value={precio}
            onChangeText={setPrecio}
            style={styles.input}
          />

          <View style={styles.addIncluyeRow}>
            <TextInput
              placeholder="Incluye…"
              value={incluyeInput}
              onChangeText={setIncluyeInput}
              style={[styles.input, styles.inputFlex]}
            />
            <Button
              mode="contained"
              onPress={() => {
                if (incluyeInput.trim()) {
                  setIncluye([...incluye, incluyeInput.trim()]);
                  setIncluyeInput('');
                }
              }}
            >
              +
            </Button>
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

          <Button mode="contained" onPress={submitPlan} style={styles.saveBtn}>
            Guardar plan
          </Button>
          <Button onPress={() => setShowForm(false)} style={styles.cancelBtn}>
            Cancelar
          </Button>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center' },
  container: { padding: 16 },
  addBtn: { marginBottom: 16 },
  card: { marginBottom: 12 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { margin: 4 },
  form: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginVertical: 6,
  },
  inputFlex: { flex: 1 },
  addIncluyeRow: { flexDirection: 'row', alignItems: 'center' },
  saveBtn: { marginTop: 16 },
  cancelBtn: { marginTop: 8 },
});
