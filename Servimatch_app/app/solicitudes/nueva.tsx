import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
  Text,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import BaseLayout from '../../components/BaseLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NuevaSolicitudScreen() {
  const { tokens } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const geocodificarDireccion = async (direccion: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ServiMatchApp/1.0 (bas.arenas@duocuc.cl)',
            'Accept': 'application/json',
          },
        }
      );
      const data = await res.json();
      if (data.length > 0) {
        setLatitud(parseFloat(data[0].lat));
        setLongitud(parseFloat(data[0].lon));
      }
    } catch (e) {
      console.error('Error al geocodificar dirección:', e);
    }
  };

  useEffect(() => {
    if (!tokens?.access) return;
    (async () => {
      try {
        const res = await fetch('http://192.168.1.61:8000/api/servicios/', {

          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setServicios(data);
        } else {
          console.error('Respuesta inesperada de servicios:', data);
          setServicios([]);
        }
      } catch (e) {
        console.error('Error al cargar servicios:', e);
        setServicios([]);
      }
    })();
  }, [tokens]);


  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return Alert.alert('Permiso denegado', 'Necesitas habilitar la ubicación');
      }

      const loc = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(loc.coords);

      const dir = `${address.street ?? ''} ${address.city ?? ''}`.trim();
      setUbicacion(dir || `${loc.coords.latitude}, ${loc.coords.longitude}`);

      setLatitud(loc.coords.latitude);
      setLongitud(loc.coords.longitude);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLocating(false);
    }
  };

  const buscarSugerencias = async (texto: string) => {
    if (texto.length < 3) {
      setSugerencias([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}`,
        {
          headers: {
            'User-Agent': 'ServiMatchApp/1.0 (bastian@ejemplo.cl)',
            'Accept': 'application/json',
          },
        }
      );

      const data = await res.json();
      const resultados = data.map((item: any) => item.display_name);
      setSugerencias(resultados);
    } catch (error) {
      console.error('Error al buscar sugerencias:', error);
      setSugerencias([]);
    }
  };

  const submit = async () => {
    const precioNumber = parseFloat(precio);

    if (nombre.trim().length < 5) {
      return Alert.alert('Error', 'El nombre debe tener al menos 5 caracteres');
    }
    if (descripcion.trim().length < 30) {
      return Alert.alert('Error', 'La descripción debe tener al menos 30 caracteres');
    }
    if (isNaN(precioNumber) || precioNumber < 0 || precioNumber > 10000000) {
      return Alert.alert('Error', 'Ingresa un precio válido entre 0 y 10 millones');
    }
    if (!selectedService) {
      return Alert.alert('Error', 'Debes seleccionar un servicio');
    }
    if (!ubicacion || latitud === null || longitud === null) {
      return Alert.alert('Error', 'Indica una ubicación válida');
    }
    if (!selectedDay) {
      return Alert.alert('Error', 'Selecciona un día de la semana');
    }

    setLoading(true);
    try {
      const res = await fetch('http://192.168.1.61:8000/api/solicitudes/', {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens!.access}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio: precioNumber,
          ubicacion,
          latitud,
          longitud,
          servicio_id: selectedService,
          dia_semana: selectedDay,
          hora_preferida: selectedTime.toTimeString().substr(0, 5),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('¡Solicitud creada!');
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!tokens?.access) {
    return (
      <BaseLayout title="Nueva Solicitud" back>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Nueva Solicitud" back>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background },
        ]}
      >
        <TextInput
          label="Nombre de la solicitud"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Descripción del problema"
          value={descripcion}
          onChangeText={setDescripcion}
          mode="outlined"
          multiline
          style={[styles.input, { height: 80 }]}
        />
        <TextInput
          label="Precio (CLP)"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Servicio</Text>
        <View style={[styles.pickerContainer, { borderColor: theme.colors.outline }]}>
          <Picker selectedValue={selectedService} onValueChange={val => setSelectedService(val)}>
            <Picker.Item label="Selecciona un servicio..." value={null} />
            {servicios.map(s => (
              <Picker.Item key={s.id} label={s.nombre} value={s.id} />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Día de la semana</Text>
        <View style={[styles.pickerContainer, { borderColor: theme.colors.outline }]}>
          <Picker selectedValue={selectedDay} onValueChange={val => setSelectedDay(val)}>
            <Picker.Item label="Selecciona un día..." value={null} />
            <Picker.Item label="Lunes" value={1} />
            <Picker.Item label="Martes" value={2} />
            <Picker.Item label="Miércoles" value={3} />
            <Picker.Item label="Jueves" value={4} />
            <Picker.Item label="Viernes" value={5} />
            <Picker.Item label="Sábado" value={6} />
            <Picker.Item label="Domingo" value={7} />
          </Picker>
        </View>

        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Hora preferida</Text>
        <Button mode="outlined" onPress={() => setShowTimePicker(true)} style={styles.input}>
          {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Button>
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            is24Hour
            display="default"
            onChange={(_, date) => {
              setShowTimePicker(false);
              if (date) setSelectedTime(date);
            }}
          />
        )}

        <Text style={[styles.label, { color: theme.colors.onBackground }]}>Ubicación</Text>
        <View style={styles.locationRow}>
          <TextInput
            label="Ubicación"
            value={ubicacion}
            onChangeText={(texto) => {
              setUbicacion(texto);
              if (typingTimeout) clearTimeout(typingTimeout);
              const timeout = setTimeout(() => buscarSugerencias(texto), 500);
              setTypingTimeout(timeout);
            }}
            mode="outlined"
            style={[styles.input, { flex: 1 }]}
          />

          <Button
            mode="outlined"
            onPress={useCurrentLocation}
            loading={locating}
            disabled={locating}
            contentStyle={styles.buttonContent}
            style={{ marginLeft: 8 }}
          >
            Mi ubicación
          </Button>

          {sugerencias.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {ubicacion && (
                <Button
                  mode="text"
                  onPress={async () => {
                    setUbicacion(ubicacion);
                    await geocodificarDireccion(ubicacion);
                    setSugerencias([]);
                  }}
                  style={[styles.suggestionItem, { backgroundColor: '#e6f7ff' }]}
                  contentStyle={{ justifyContent: 'flex-start' }}
                  labelStyle={{ textAlign: 'left' }}
                >
                  📍 Usar ubicación actual: {ubicacion}
                </Button>
              )}
              {sugerencias.map((s, i) => (
                <Button
                  key={i}
                  mode="text"
                  onPress={async () => {
                    setUbicacion(s);
                    await geocodificarDireccion(s);
                    setSugerencias([]);
                  }}
                  style={styles.suggestionItem}
                  contentStyle={{ justifyContent: 'flex-start' }}
                  labelStyle={{ textAlign: 'left' }}
                >
                  {s}
                </Button>
              ))}
            </View>
          )}
        </View>

        <Button
          mode="contained"
          onPress={submit}
          loading={loading}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
        >
          Crear solicitud
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: { marginBottom: 16 },
  label: { marginBottom: 4, fontWeight: '500' },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtn: { marginTop: 24, borderRadius: 8 },
  buttonContent: { height: 48 },
  suggestionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    color: '#333',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 4,
    marginTop: 4,
    position: 'absolute',
    zIndex: 999,
    top: 60,
    width: '100%',
  },
});
