// Helper para devolver exactamente el valor de progreso (0 si no hay nada completado)
function minProgress(val: number) {
  return val;
}

import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://192.168.100.109:8000';
const COMUNAS = [
  'Santiago',
  'Providencia',
  'Las Condes',
  'Ñuñoa',
  'La Florida',
  'San Bernardo',
  'El Bosque',
];

export default function CompletarPerfilScreen() {

  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens } = useAuth();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Paso 1: Datos personales
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    nombre?: string;
    apellido?: string;
    telefono?: string;
    descripcion?: string;
    address?: string;
    profesionId?: string;
    anosExperiencia?: string;
    descBreve?: string;
    idiomas?: string;
  }>({});

  // Paso 2: Dirección
  const [comuna, setComuna] = useState(COMUNAS[0]);
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Paso 3: Rol
  const [rol, setRol] = useState<'cliente' | 'trabajador' | 'ambos'>('cliente');

  // Paso 4 (solo si rol !== 'cliente'): Profesión & Experiencia
  const [profesiones, setProfesiones] = useState<{ id: number; nombre: string }[]>([]);
  const [profesionId, setProfesionId] = useState<number | ''>('');
  const [anosExperiencia, setAnosExperiencia] = useState('');
  const [descBreve, setDescBreve] = useState('');
  const [idiomas, setIdiomas] = useState('');

  // Cálculo de campos completados por paso
  const step1Fields = [nombre.trim(), apellido.trim(), telefono.trim(), descripcion.trim()];
  const completed1 = step1Fields.filter(f => f !== '').length;
  const total1 = step1Fields.length;

  const step2Fields = [address.trim()];
  const completed2 = step2Fields.filter(f => f !== '').length;
  const total2 = step2Fields.length;

  const step3Fields = [rol];
  const completed3 = step3Fields.filter(f => !!f).length;
  const total3 = step3Fields.length;

  const step4Fields = [profesionId, anosExperiencia.trim(), descBreve.trim(), idiomas.trim()];
  const completed4 = step4Fields.filter(f => f !== '' && f != null).length;
  const total4 = step4Fields.length;

  useEffect(() => {
    if (!tokens?.access) return;
    fetch(`${API_BASE_URL}/api/profesiones/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then((r) => r.json())
      .then((data) => setProfesiones(data))
      .catch((e) => console.error(e));
  }, [tokens]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permiso denegado');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setFotoUri(result.assets[0].uri);
  };

  const fetchAddressSuggestions = async (q: string) => {
    const query = `${q}, ${comuna}, Chile`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=cl&accept-language=es&q=${encodeURIComponent(
          query
        )}`,
        { headers: { 'User-Agent': 'ServimatchApp/1.0' } }
      );
      const data = await res.json();
      setSuggestions(data.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const guardarPerfil = async () => {
    if (!tokens?.access) return Alert.alert('Error', 'No estás autenticado');
    if (!nombre || !apellido || !telefono) return Alert.alert('Error', 'Completa los campos requeridos');
    setLoading(true);
    const form = new FormData();
    form.append('nombre', nombre);
    form.append('apellido', apellido);
    form.append('telefono', telefono);
    form.append('biografia', descripcion);
    form.append('rol', rol);
    form.append('direccion', address);
    if (location) {
      form.append('latitud', String(location.latitude));
      form.append('longitud', String(location.longitude));
    }
    if (rol !== 'cliente') {
      const payload = {
        profesion: profesionId,
        anos_experiencia: Number(anosExperiencia),
        descripcion_breve: descBreve,
        idiomas,
      };
      form.append('trabajador', JSON.stringify(payload));
    }
    if (fotoUri) {
      const fname = fotoUri.split('/').pop() || 'photo.jpg';
      const ext = fname.split('.').pop() || 'jpg';
      form.append('foto_perfil', { uri: fotoUri, name: fname, type: `image/${ext}` } as any);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios/actualizar-perfil/`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokens.access}` },
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('Éxito', 'Perfil guardado');
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = rol === 'cliente' ? 3 : 4;

  const handleNext = () => {
    const newErrors: typeof errors = {};

    if (currentStep === 1) {
      if (!nombre.trim()) newErrors.nombre = 'Ingresa tu nombre';
      if (!apellido.trim()) newErrors.apellido = 'Ingresa tu apellido';
      if (!telefono.trim()) newErrors.telefono = 'Ingresa tu teléfono';
      if (!descripcion.trim()) newErrors.descripcion = 'Cuéntanos algo de ti';

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!address.trim()) {
        setErrors({ address: 'Selecciona tu dirección' });
        return;
      }
      setErrors({});
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!rol) {
        setErrors({}); // No hay error específico, pero se podría agregar si hay más lógica
        return;
      }
      setErrors({});
      if (rol === 'cliente') {
        guardarPerfil();
      } else {
        setCurrentStep(4);
      }
      return;
    }

    if (currentStep === 4) {
      if (!profesionId) newErrors.profesionId = 'Selecciona tu profesión';
      if (!anosExperiencia.trim()) newErrors.anosExperiencia = 'Indica tus años de experiencia';
      if (!descBreve.trim()) newErrors.descBreve = 'Describe tu experiencia';
      if (!idiomas.trim()) newErrors.idiomas = 'Indica tus idiomas';

      if (Object.keys(newErrors).length) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      guardarPerfil();
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  return (
    <BaseLayout title="Completar perfil" back>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 44}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16 }]}
            keyboardShouldPersistTaps="handled"
          >
            {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}

            {!loading && (
              <>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepText}>
                    Paso {currentStep}/{totalSteps}
                  </Text>
                </View>

                {currentStep === 1 && (
                  <Surface style={[styles.card, { elevation: 2 }]}>
                    {/* ---- DATOS PERSONALES DENTRO DE LA TARJETA ---- */}
                    <Title style={[styles.sectionTitle, { textAlign: 'center', width: '100%' }]}>Datos personales</Title>
                    <View style={[styles.section, { alignItems: 'center', justifyContent: 'center', width: '100%' }]}>
                      <Surface style={styles.avatarContainer}>
                        {fotoUri
                          ? <Avatar.Image size={100} source={{ uri: fotoUri }} />
                          : <Avatar.Icon size={100} icon="account" />}
                        <TouchableOpacity
                          style={[styles.avatarEditIcon, { backgroundColor: theme.colors.primary }]}
                          onPress={pickImage}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.editButtonText}>+</Text>
                        </TouchableOpacity>
                      </Surface>
                    </View>
                    <TextInput
                      label="Nombre"
                      placeholder="Ingresa tu nombre"
                      value={nombre}
                      onChangeText={t => {
                        setNombre(t);
                        if (errors.nombre) setErrors({ ...errors, nombre: undefined });
                      }}
                      error={!!errors.nombre}
                      mode="outlined"
                      style={styles.input}
                    />
                    {errors.nombre && <Text style={styles.fieldError}>{errors.nombre}</Text>}
                    <TextInput
                      label="Apellido"
                      placeholder="Ingresa tu apellido"
                      value={apellido}
                      onChangeText={t => {
                        setApellido(t);
                        if (errors.apellido) setErrors({ ...errors, apellido: undefined });
                      }}
                      error={!!errors.apellido}
                      mode="outlined"
                      style={styles.input}
                    />
                    {errors.apellido && <Text style={styles.fieldError}>{errors.apellido}</Text>}
                    <TextInput
                      label="Teléfono"
                      placeholder="Ej: +56912345678"
                      value={telefono}
                      onChangeText={t => {
                        setTelefono(t);
                        if (errors.telefono) setErrors({ ...errors, telefono: undefined });
                      }}
                      error={!!errors.telefono}
                      keyboardType="phone-pad"
                      mode="outlined"
                      style={styles.input}
                    />
                    {errors.telefono && <Text style={styles.fieldError}>{errors.telefono}</Text>}
                    <TextInput
                      label="Descripción"
                      placeholder="Cuéntanos sobre ti"
                      value={descripcion}
                      onChangeText={t => {
                        setDescripcion(t);
                        if (errors.descripcion) setErrors({ ...errors, descripcion: undefined });
                      }}
                      error={!!errors.descripcion}
                      mode="outlined"
                      multiline
                      style={[styles.input, { height: 80 }]}
                    />
                    {errors.descripcion && <Text style={styles.fieldError}>{errors.descripcion}</Text>}

                    {/* Progreso y botones dentro de la tarjeta */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${minProgress(completed1 / total1) * 100}%`,
                              backgroundColor: theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{`${completed1} de ${total1} campos`}</Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <Button
                        mode="contained"
                        onPress={handleNext}
                        style={[styles.navBtn, { backgroundColor: theme.colors.primary }]}
                        contentStyle={styles.btnContent}
                      >
                        Siguiente
                      </Button>
                    </View>
                  </Surface>
                )}

                {currentStep === 2 && (
                  <Surface style={[styles.card, { elevation: 2 }]}>
                    <Title style={styles.sectionTitle}>Dirección</Title>
                    <Picker
                      selectedValue={comuna}
                      onValueChange={(c) => {
                        setComuna(c);
                        setAddress('');
                        setSuggestions([]);
                        setLocation(null);
                      }}
                    >
                      {COMUNAS.map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                      ))}
                    </Picker>

                    <TextInput
                      label="Dirección"
                      placeholder="Ej: Calle Libertad 123"
                      value={address}
                      onChangeText={t => {
                        setAddress(t);
                        if (errors.address) setErrors({ ...errors, address: undefined });
                        t.length > 3 ? fetchAddressSuggestions(t) : setSuggestions([]);
                      }}
                      error={!!errors.address}
                      mode="outlined"
                      style={styles.input}
                    />
                    {errors.address && <Text style={styles.fieldError}>{errors.address}</Text>}
                    {suggestions.map((item) => (
                      <Button
                        key={item.place_id}
                        mode="text"
                        onPress={() => {
                          setAddress(item.display_name);
                          setLocation({
                            latitude: parseFloat(item.lat),
                            longitude: parseFloat(item.lon),
                          });
                          setSuggestions([]);
                        }}
                        compact
                      >
                        {item.display_name}
                      </Button>
                    ))}

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${minProgress(completed2 / total2) * 100}%`,
                              backgroundColor: theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{`${completed2} de ${total2} campos`}</Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <Button
                        mode="outlined"
                        onPress={handleBack}
                        style={[styles.navBtn, { borderColor: theme.colors.outline }]}
                        contentStyle={styles.btnContent}
                      >
                        Anterior
                      </Button>
                      <Button
                        mode="contained"
                        onPress={handleNext}
                        style={[styles.navBtn, { backgroundColor: theme.colors.primary, marginLeft: 8 }]}
                        contentStyle={styles.btnContent}
                      >
                        Siguiente
                      </Button>
                    </View>
                  </Surface>
                )}

                {currentStep === 3 && (
                  <Surface style={[styles.card, { elevation: 2, paddingVertical: 12 }]}>
                    <Title style={styles.sectionTitle}>Rol</Title>
                    <View style={styles.chipContainer}>
                      {['cliente', 'trabajador', 'ambos'].map((r) => (
                        <Chip
                          key={r}
                          mode="outlined"
                          selected={rol === r}
                          onPress={() => setRol(r as any)}
                          style={styles.chip}
                          selectedColor={theme.colors.primary}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Chip>
                      ))}
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${minProgress(completed3 / total3) * 100}%`,
                              backgroundColor: theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{`${completed3} de ${total3} campos`}</Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <Button
                        mode="outlined"
                        onPress={handleBack}
                        style={[styles.navBtn, { borderColor: theme.colors.outline }]}
                        contentStyle={styles.btnContent}
                      >
                        Anterior
                      </Button>
                      <Button
                        mode="contained"
                        onPress={handleNext}
                        style={[styles.navBtn, { backgroundColor: theme.colors.primary, marginLeft: 8 }]}
                        contentStyle={styles.btnContent}
                      >
                        {currentStep === totalSteps ? 'Guardar Perfil' : 'Siguiente'}
                      </Button>
                    </View>
                  </Surface>
                )}

                {currentStep === 4 && rol !== 'cliente' && (
                  <Surface style={[styles.card, { elevation: 2 }]}>
                    <Title style={styles.sectionTitle}>Profesión & Experiencia</Title>
                    <Surface style={[styles.surfaceInline, { elevation: 1 }]}>
                      <Picker
                        selectedValue={profesionId}
                        onValueChange={(val) =>
                          setProfesionId(typeof val === 'string' ? Number(val) : val)
                        }
                      >
                        <Picker.Item label="-- elige profesión --" value="" />
                        {profesiones.map((p) => (
                          <Picker.Item key={p.id} label={p.nombre} value={p.id} />
                        ))}
                      </Picker>
                    </Surface>

                    <Title style={[styles.subTitle, { marginTop: 16 }]}>Experiencia</Title>
                    <TextInput
                      label="Años"
                      placeholder="Ej: 5"
                      value={anosExperiencia}
                      onChangeText={t => {
                        setAnosExperiencia(t);
                        if (errors.anosExperiencia) setErrors({ ...errors, anosExperiencia: undefined });
                      }}
                      error={!!errors.anosExperiencia}
                      keyboardType="numeric"
                      mode="outlined"
                      style={styles.input}
                    />
                    {errors.anosExperiencia && <Text style={styles.fieldError}>{errors.anosExperiencia}</Text>}
                    <TextInput
                      label="Breve descripción"
                      placeholder="Describe tu experiencia breve"
                      value={descBreve}
                      onChangeText={t => {
                        setDescBreve(t);
                        if (errors.descBreve) setErrors({ ...errors, descBreve: undefined });
                      }}
                      error={!!errors.descBreve}
                      mode="outlined"
                      multiline
                      style={[styles.input, { height: 60 }]}
                    />
                    {errors.descBreve && <Text style={styles.fieldError}>{errors.descBreve}</Text>}
                    <TextInput
                      label="Idiomas"
                      placeholder="Ej: Español, Inglés"
                      value={idiomas}
                      onChangeText={t => {
                        setIdiomas(t);
                        if (errors.idiomas) setErrors({ ...errors, idiomas: undefined });
                      }}
                      error={!!errors.idiomas}
                      mode="outlined"
                      style={styles.input}
                    />
                    {errors.idiomas && <Text style={styles.fieldError}>{errors.idiomas}</Text>}

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${minProgress(completed4 / total4) * 100}%`,
                              backgroundColor: theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{`${completed4} de ${total4} campos`}</Text>
                    </View>
                    <View style={styles.buttonRow}>
                      <Button
                        mode="outlined"
                        onPress={handleBack}
                        style={[styles.navBtn, { borderColor: theme.colors.outline }]}
                        contentStyle={styles.btnContent}
                      >
                        Anterior
                      </Button>
                      <Button
                        mode="contained"
                        onPress={handleNext}
                        style={[styles.navBtn, { backgroundColor: theme.colors.primary, marginLeft: 8 }]}
                        contentStyle={styles.btnContent}
                      >
                        {currentStep === totalSteps ? 'Guardar Perfil' : 'Siguiente'}
                      </Button>
                    </View>
                  </Surface>
                )}

              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  fieldError: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  container: {
    padding: 16,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  surfaceInline: {
    padding: 4,
    borderRadius: 6,
    marginVertical: 4,
    backgroundColor: '#fafafa',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageBtn: {
    marginLeft: 16,
  },
  input: {
    width: '100%',
    height: 56,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    justifyContent: 'center',
  },
  chip: {
    margin: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  navBtn: {
    borderRadius: 8,
  },
  btnContent: {
    height: 48,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
    color: '#444',
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  progressContainer: {
    marginTop: 24,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    height: 10,
    width: '92%',
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d1d1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: 10,
    borderRadius: 6,
    backgroundColor: '#4f8cff',
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  progressText: {
    marginTop: 6,
    color: '#444',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  avatarContainer: {
    position: 'relative',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  avatarEditIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f8cff', // o theme.colors.primary
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '700',
  },
});
