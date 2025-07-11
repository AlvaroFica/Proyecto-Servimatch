import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

export default function PerfilEditarScreen() {
  const { tokens } = useAuth();
  const accessToken = tokens?.access;
  const router = useRouter();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [biografia, setBiografia] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<number[]>([]);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [nombreError, setNombreError] = useState(false);
  const [apellidoError, setApellidoError] = useState(false);
  const [telefonoError, setTelefonoError] = useState(false);
  const [biografiaError, setBiografiaError] = useState(false);

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const horas = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

  const [disponibilidadObj, setDisponibilidadObj] = useState<{ [key: string]: { inicio: string; fin: string }[] }>({
    lunes: [], martes: [], miércoles: [], jueves: [], viernes: [], sábado: [], domingo: [],
  });

  const validarCampos = () => {
    const soloLetras = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
    const telefonoCL = /^(\+?56)?(\s?9\d{8})$/;
    let valido = true;

    if (!soloLetras.test(nombre.trim())) {
      setNombreError(true);
      valido = false;
    } else {
      setNombreError(false);
    }

    if (!soloLetras.test(apellido.trim())) {
      setApellidoError(true);
      valido = false;
    } else {
      setApellidoError(false);
    }

    if (!telefonoCL.test(telefono.trim())) {
      setTelefonoError(true);
      valido = false;
    } else {
      setTelefonoError(false);
    }

    const bioLimpia = biografia.trim();
    if (bioLimpia.length < 50) {
      setBiografiaError(true);
      valido = false;
    } else {
      setBiografiaError(false);
    }

    return valido;
  };
  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        const [perfilRes, serviciosRes] = await Promise.all([
          fetch('http://192.168.0.186:8000/api/usuarios/me/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch('http://192.168.0.186:8000/api/servicios/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        const data = await perfilRes.json();
        setNombre(data.nombre || '');
        setApellido(data.apellido || '');
        setTelefono(data.telefono || '');
        setBiografia(data.biografia || '');
        setDireccion(data.direccion || '');

        const disponibilidadData = data.trabajador_profile?.disponibilidad || '{}';
        try {
          const parsed = JSON.parse(disponibilidadData);
          const disponibilidadCompleta = diasSemana.reduce((acc, dia) => {
            const franjas = parsed[dia] || [];
            acc[dia] = franjas.length ? franjas : [{ inicio: '', fin: '' }];
            return acc;
          }, {} as { [key: string]: { inicio: string; fin: string }[] });
          setDisponibilidadObj(disponibilidadCompleta);
        } catch {
          console.warn('Disponibilidad malformateada');
        }

        setServiciosSeleccionados(data.trabajador_profile?.servicios || []);
        if (data.foto_perfil) {
          setFotoUri(
            data.foto_perfil.startsWith('http')
              ? data.foto_perfil
              : `http://192.168.0.186:8000${data.foto_perfil}`
          );
        }

        const serviciosData = await serviciosRes.json();
        setServicios(serviciosData);
      } catch {
        Alert.alert('Error', 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const actualizarFranja = (dia: string, index: number, campo: 'inicio' | 'fin', valor: string) => {
    const nuevasFranjas = [...disponibilidadObj[dia]];
    nuevasFranjas[index][campo] = valor;
    setDisponibilidadObj((prev) => ({ ...prev, [dia]: nuevasFranjas }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFotoUri(result.assets[0].uri);
    }
  };


  const toggleServicio = (id: number) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!accessToken) return;

    const esValido = validarCampos();
    if (!esValido) {
      Alert.alert("Corrige los errores antes de continuar");
      return;
    }

    setSubmitting(true);
    const form = new FormData();
    form.append('nombre', nombre);
    form.append('apellido', apellido);
    form.append('telefono', telefono);
    form.append('biografia', biografia);
    form.append('direccion', direccion);

    const disponibilidadFiltrada = Object.fromEntries(
      Object.entries(disponibilidadObj).map(([dia, franjas]) => [
        dia,
        franjas.filter(f => f.inicio && f.fin)
      ])
    );

    form.append('trabajador', JSON.stringify({
      disponibilidad: disponibilidadFiltrada,
      servicios: serviciosSeleccionados
    }));

    if (fotoUri) {
      const uriParts = fotoUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      form.append('foto_perfil', {
        uri: fotoUri,
        name: fileName,
        type: 'image/jpeg',
      } as any);
    }

    try {

      const res = await fetch(
        'http://192.168.0.186:8000/api/usuarios/actualizar-perfil/',
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Éxito', 'Perfil actualizado');
      router.back();
    } catch (e) {
      console.error('Error al actualizar perfil:', e);
      Alert.alert('Error', 'No se pudo actualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const pickGalleryImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso denegado');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.7,
  });


  if (!result.canceled) {
    const uri = result.assets[0].uri;
    const fileName = uri.split('/').pop() || 'galeria.jpg';
    const ext = fileName.split('.').pop();

    const formData = new FormData();
    formData.append('imagen', {
      uri,
      name: fileName,
      type: `image/${ext}`,
    } as any);

    try {
      const res = await fetch('http://192.168.0.186:8000/api/fotos-trabajador/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Éxito', 'Imagen subida a la galería');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message);
    }
  }
};

  if (loading) {
    return (
      <BaseLayout title="Editar perfil" back>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Editar perfil" back>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              <Surface style={[styles.avatarContainer, { backgroundColor: theme.colors.surface }]}>
                {fotoUri ? (
                  <Avatar.Image size={100} source={{ uri: fotoUri }} />
                ) : (
                  <Avatar.Icon size={100} icon="account" />
                )}
              </Surface>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Foto de perfil</Text>
          </View>

          <Surface style={[styles.formSection, { backgroundColor: theme.colors.surface }]}>
            <TextInput label="Nombre" value={nombre} onChangeText={setNombre} mode="outlined" error={nombreError} style={styles.input} />
            {nombreError && <Text style={{ color: 'red', marginBottom: 8 }}>Solo letras permitidas</Text>}

            <TextInput label="Apellido" value={apellido} onChangeText={setApellido} mode="outlined" error={apellidoError} style={styles.input} />
            {apellidoError && <Text style={{ color: 'red', marginBottom: 8 }}>Solo letras permitidas</Text>}

            <TextInput label="Teléfono" value={telefono} onChangeText={setTelefono} mode="outlined" error={telefonoError} style={styles.input} />
            {telefonoError && <Text style={{ color: 'red', marginBottom: 8 }}>Formato chileno requerido (ej: 912345678)</Text>}

            <TextInput label="Biografía" value={biografia} onChangeText={setBiografia} mode="outlined" multiline style={[styles.input, { height: 80 }]} error={biografiaError} />
            <Text style={{ alignSelf: 'flex-end', marginBottom: biografiaError ? 4 : 16, color: biografia.length >= 50 ? 'green' : 'red' }}>
              {biografia.trim().length}/50 caracteres requeridos
            </Text>
            {biografiaError && <Text style={{ color: 'red', marginBottom: 8 }}>Mínimo 50 caracteres</Text>}

            <TextInput label="Dirección" value={direccion} onChangeText={setDireccion} mode="outlined" style={styles.input} />

            <Text style={styles.sectionTitle}>Disponibilidad semanal</Text>
            <View style={styles.tablaContainer}>
              {diasSemana.map((dia) => {
                const abierto = diaActivo === dia;
                const franjas = disponibilidadObj[dia] || [];
                const resumen = franjas
                  .filter(f => f.inicio && f.fin)
                  .map(f => `${f.inicio}–${f.fin}`)
                  .join(', ') || 'CERRADO';

                return (
                  <View key={dia} style={styles.diaBox}>
                    <TouchableOpacity
                      style={styles.diaHeader}
                      onPress={() => setDiaActivo(abierto ? null : dia)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.diaEmoji}>📅</Text>
                      <Text style={styles.diaNombre}>
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </Text>
                      <Text style={styles.diaResumen}>{resumen}</Text>
                      <Text style={styles.diaArrow}>{abierto ? '▼' : '▶'}</Text>
                    </TouchableOpacity>

                    {abierto && (
                      <View style={styles.franjaRow}>
                        <View style={styles.pickerColumn}>
                          <Text style={styles.pickerLabel}>Inicio</Text>
                          <Picker
                            selectedValue={franjas[0]?.inicio || ''}
                            onValueChange={(v) => actualizarFranja(dia, 0, 'inicio', v)}
                            style={styles.picker}
                          >
                            <Picker.Item label="Hora..." value="" />
                            {horas.map((h) => (
                              <Picker.Item key={h} label={h} value={h} />
                            ))}
                          </Picker>
                        </View>
                        <View style={styles.pickerColumn}>
                          <Text style={styles.pickerLabel}>Fin</Text>
                          <Picker
                            selectedValue={franjas[0]?.fin || ''}
                            onValueChange={(v) => actualizarFranja(dia, 0, 'fin', v)}
                            style={styles.picker}
                          >
                            <Picker.Item label="Hora..." value="" />
                            {horas.map((h) => (
                              <Picker.Item key={h} label={h} value={h} />
                            ))}
                          </Picker>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Servicios ofrecidos</Text>
            <View style={styles.chipContainer}>
              {servicios.map((servicio: any) => (
                <Chip key={servicio.id} selected={serviciosSeleccionados.includes(servicio.id)} onPress={() => toggleServicio(servicio.id)} style={styles.chip}>
                  {servicio.nombre}
                </Chip>
              ))}
            </View>

            <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting} style={styles.button}>
              Guardar cambios
            </Button>

            <Button mode="outlined" onPress={pickGalleryImage} style={{ marginTop: 12 }}>
              Subir imagen a galería
            </Button>
          </Surface>
        </Animated.View>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { borderRadius: 60, overflow: 'hidden', elevation: 4 },
  sectionTitle: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  formSection: { padding: 16, borderRadius: 12, elevation: 2 },
  input: { marginBottom: 16 },
  button: { marginTop: 16, borderRadius: 8 },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'flex-start',
  },
  chip: { margin: 4 },
  tablaContainer: { marginTop: 8 },
  diaBox: {
    backgroundColor: '#f5f5fa',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 1,
  },
  diaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  diaEmoji: { fontSize: 18, marginRight: 8 },
  diaNombre: { flex: 1, fontSize: 15, fontWeight: '600' },
  diaResumen: { fontSize: 13, fontStyle: 'italic', color: '#888', marginRight: 6 },
  diaArrow: { fontSize: 18 },
  franjaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 8,
  },
  pickerColumn: { flex: 1 },
  pickerLabel: { fontSize: 12, color: '#444', marginBottom: 4 },
  picker: { backgroundColor: '#fff', borderRadius: 6 },
});
