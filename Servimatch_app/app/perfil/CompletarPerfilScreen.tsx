import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Snackbar } from 'react-native-paper';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
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
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';
function minProgress(val: number) {
  return val;
}

const API_BASE_URL = 'http://192.168.100.4:8000';


const COMUNAS = [
  'Santiago',
  'Providencia',
  'Las Condes',
  'Ñuñoa',
  'La Florida',
  'San Bernardo',
  'El Bosque',
];
  function validarNombre(nombre: string): string {
    if (!nombre) return "El nombre es obligatorio.";
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(nombre)) return "El nombre solo debe contener letras.";
    return "";
  }

  function validarApellido(apellido: string): string {
    if (!apellido) return "El apellido es obligatorio.";
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(apellido)) return "El apellido solo debe contener letras.";
    return "";
  }

  function validarTelefono(telefono: string): string {
    if (!telefono) return "El teléfono es obligatorio.";
    if (!/^\+?56\s?9\d{8}$/.test(telefono)) return "Formato incorrecto. Ej: +56912345678";
    return "";
  }

  function validarDescripcion(desc: string): string {
    if (!desc || desc.trim().length < 50) return "La descripción debe tener al menos 50 caracteres.";
    return "";
  }


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

  const [nombreError, setNombreError] = useState('');
  const [apellidoError, setApellidoError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [descError, setDescError] = useState('');
  const [descripcionHeight, setDescripcionHeight] = useState(80);
  const [profesionError, setProfesionError] = useState('');
  const [anosError, setAnosError] = useState('');
  const [descBreveError, setDescBreveError] = useState('');
  const [idiomasError, setIdiomasError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);




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
      setShowSnackbar(true);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 4000); // Espera 2 segundos para que el Snackbar se vea

    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = rol === 'cliente' ? 3 : 4;

  const handleNext = () => {
    if (currentStep === 1) {
      const errNombre = validarNombre(nombre);
      const errApellido = validarApellido(apellido);
      const errTelefono = validarTelefono(telefono);
      const errDesc = validarDescripcion(descripcion);

      setNombreError(errNombre);
      setApellidoError(errApellido);
      setTelefonoError(errTelefono);
      setDescError(errDesc);

      if (errNombre || errApellido || errTelefono || errDesc) return;

      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (rol === 'cliente') {
        guardarPerfil();
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      let hayErrores = false;

      if (!profesionId) {
        setProfesionError('Selecciona una profesión');
        hayErrores = true;
      } else {
        setProfesionError('');
      }

      const anos = Number(anosExperiencia);
      if (!anosExperiencia || isNaN(anos) || anos < 0 || anos > 60) {
        setAnosError('Ingresa un número válido entre 0 y 60');
        hayErrores = true;
      } else {
        setAnosError('');
      }

      if (!descBreve || descBreve.trim().length < 10) {
        setDescBreveError('Debe tener al menos 10 caracteres');
        hayErrores = true;
      } else {
        setDescBreveError('');
      }

      // (opcional) validación de idiomas si lo deseas más adelante

      if (hayErrores) return;

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
const completados4 =
  (profesionId ? 1 : 0) +
  (anosExperiencia ? 1 : 0) +
  (descBreve ? 1 : 0) +
  (idiomas ? 1 : 0);
  <View style={{ marginTop: 12 }}>
  <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
    <View
      style={{
        height: 8,
        backgroundColor: theme.colors.primary,
        width: `${Math.floor(minProgress(rol ? 1 : 0) * 100)}%`,

        borderRadius: 4,
      }}
    />
  </View>
  <Text
    style={{
      fontSize: 14,
              fontWeight: '500',
      color: '#444',
      marginTop: 4,
      textAlign: 'right',
    }}
  >
    {`${completados4} de 4 campos`}
  </Text>
</View>


  return (
    <BaseLayout title="Completar perfil" back>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 44}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 12 }}
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
                 <>
                    <Title style={styles.sectionTitle}>Datos personales</Title>
                    <Surface style={[styles.card, { elevation: 2 }]}>
                      <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        {fotoUri ? (
                          <Avatar.Image size={100} source={{ uri: fotoUri }} />
                        ) : (
                          <Avatar.Icon size={100} icon="account" />
                        )}
                        <Button
                          mode="contained-tonal"
                          onPress={pickImage}
                          style={{ marginTop: 8 }}
                          icon={fotoUri ? 'reload' : 'camera'}
                        >
                          {fotoUri ? 'Cambiar foto' : 'Seleccionar foto'}
                        </Button>
                      </View>

                      <TextInput
                        label="Nombre"
                        placeholder="Ingresa tu nombre"
                        value={nombre}
                        onChangeText={(t) => {
                          setNombre(t);
                          setNombreError(validarNombre(t));
                        }}
                        mode="outlined"
                        error={!!nombreError}
                        style={styles.input}
                        left={<TextInput.Icon icon="account" />}
                      />
                      {nombreError !== '' && <Text style={styles.errorText}>{nombreError}</Text>}

                      <TextInput
                        label="Apellido"
                        placeholder="Ingresa tu apellido"
                        value={apellido}
                        onChangeText={(t) => {
                          setApellido(t);
                          setApellidoError(validarApellido(t));
                        }}
                        mode="outlined"
                        error={!!apellidoError}
                        style={styles.input}
                        left={<TextInput.Icon icon="account-outline" />}
                      />
                      {apellidoError !== '' && <Text style={styles.errorText}>{apellidoError}</Text>}

                      <TextInput
                        label="Teléfono"
                        placeholder="Ej: +56912345678"
                        value={telefono}
                        onChangeText={(t) => {
                          setTelefono(t);
                          setTelefonoError(validarTelefono(t));
                        }}
                        keyboardType="phone-pad"
                        mode="outlined"
                        error={!!telefonoError}
                        style={styles.input}
                        left={<TextInput.Icon icon="phone" />}
                      />
                      {telefonoError !== '' && <Text style={styles.errorText}>{telefonoError}</Text>}

                      <TextInput
                        label="Descripción"
                        placeholder="Cuéntanos sobre ti"
                        value={descripcion}
                        onChangeText={(t) => {
                          setDescripcion(t);
                          setDescError(validarDescripcion(t));
                        }}
                        onContentSizeChange={(e) =>
                          setDescripcionHeight(Math.max(80, e.nativeEvent.contentSize.height))
                        }
                        mode="outlined"
                        multiline
                        style={[styles.input, { height: descripcionHeight }]}
                        error={!!descError}
                        left={<TextInput.Icon icon="text" />}
                      />
                      <Text
                        style={{
                          marginBottom: 8,
                          color: descripcion.length < 50 ? 'red' : 'green',
                          fontSize: 13,
                          fontStyle: 'italic',
                          textAlign: 'right',
                        }}
                      >
                        {descripcion.length < 50
                          ? `Faltan ${50 - descripcion.length} caracteres.`
                          : '¡Buena descripción! ✔️'}
                      </Text>

                      <View style={{ marginTop: 8 }}>
                        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
                          <View
                            style={{
                              height: 8,
                              backgroundColor: theme.colors.primary,
                              width: `${minProgress(
                                [nombre, apellido, telefono, descripcion].filter(Boolean).length / 4
                              ) * 100}%`,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: '#444',
                            marginTop: 4,
                            textAlign: 'right',
                          }}
                        >
                          {
                            `${[nombre, apellido, telefono, descripcion].filter(Boolean).length} de 4 campos`
                          }
                        </Text>
                      </View>
                    </Surface>
                  </>

                )}

                {currentStep === 2 && (
                  <>
                    <Title style={styles.sectionTitle}>Dirección</Title>
                    <Surface style={[styles.card, { elevation: 2 }]}>
                      <Title style={styles.subTitle}>Comuna</Title>
                      <Surface style={[styles.surfaceInline, { elevation: 1 }]}>
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
                      </Surface>

                      <TextInput
                        label="Dirección"
                        placeholder="Ej: Calle Libertad 123"
                        value={address}
                        onChangeText={(t) => {
                          setAddress(t);
                          t.length > 3 ? fetchAddressSuggestions(t) : setSuggestions([]);
                        }}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="map-marker" />}
                      />

                      {suggestions.length > 0 && (
                        <View
                          style={{
                            backgroundColor: '#f9f9f9',
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#ddd',
                            marginBottom: 12,
                            marginTop: -8,
                          }}
                        >
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
                              contentStyle={{ justifyContent: 'flex-start' }}
                              style={{ paddingHorizontal: 8 }}
                              icon="map-marker-outline"
                            >
                              {item.display_name}
                            </Button>
                          ))}
                        </View>
                      )}

                      <View style={{ marginTop: 8 }}>
                        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
                          <View
                            style={{
                              height: 8,
                              backgroundColor: theme.colors.primary,
                              width: `${minProgress(address ? 1 : 0) * 100}%`,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: '#444',
                            marginTop: 4,
                            textAlign: 'right',
                          }}
                        >
                          {address ? '1 de 1 campo' : '0 de 1 campo'}
                        </Text>
                      </View>
                    </Surface>
                  </>
                )}


                {currentStep === 3 && (
                  <>
                    <Title style={styles.sectionTitle}>Rol</Title>
                    <Surface style={[styles.card, { elevation: 2 }]}>
                      <Text style={{ fontSize: 16, marginBottom: 8, textAlign: 'center', color: '#555' }}>
                        Selecciona cómo usarás la aplicación
                      </Text>
                      <View style={styles.chipContainer}>
                        {[
                          { label: 'Cliente', value: 'cliente', icon: 'account' },
                          { label: 'Trabajador', value: 'trabajador', icon: 'hammer' },
                          { label: 'Ambos', value: 'ambos', icon: 'account-switch' },
                        ].map((r) => (
                          <Chip
                            key={r.value}
                            mode="outlined"
                            selected={rol === r.value}
                            onPress={() => setRol(r.value as any)}
                            style={[styles.chip, { paddingHorizontal: 8 }]}
                            selectedColor={theme.colors.primary}
                            icon={r.icon}
                          >
                            {r.label}
                          </Chip>
                        ))}
                      </View>

                      <View style={{ marginTop: 12 }}>
                        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
                          <View
                            style={{
                              height: 8,
                              backgroundColor: theme.colors.primary,
                              width: `${minProgress(rol ? 1 : 0) * 100}%`,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: '#444',
                            marginTop: 4,
                            textAlign: 'right',
                          }}
                        >
                          {rol ? '1 de 1 campo' : '0 de 1 campo'}
                        </Text>
                      </View>
                    </Surface>
                  </>
                )}

                {currentStep === 4 && rol !== 'cliente' && (
                  <>
                    <Title style={styles.sectionTitle}>Profesión & Experiencia</Title>
                    <Surface style={[styles.card, { elevation: 2 }]}>
                      <Text style={{ fontSize: 16, marginBottom: 8, color: '#555' }}>
                        Completa tu perfil profesional para mostrar tus habilidades
                      </Text>

                      <Title style={styles.subTitle}>Profesión</Title>
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
                      {profesionError !== '' && (
                        <Text style={styles.errorText}>{profesionError}</Text>
                      )}

                      <Title style={styles.subTitle}>Años de experiencia</Title>
                      <TextInput
                        label="Años"
                        placeholder="Ej: 5"
                        value={anosExperiencia}
                        onChangeText={(t) => {
                          setAnosExperiencia(t);
                          const num = Number(t);
                          setAnosError(
                            !t || isNaN(num) || num < 0 || num > 60
                              ? 'Ingresa un número válido entre 0 y 60'
                              : ''
                          );
                        }}
                        keyboardType="numeric"
                        mode="outlined"
                        style={styles.input}
                        error={!!anosError}
                        left={<TextInput.Icon icon="briefcase-outline" />}
                      />
                      {anosError !== '' && (
                        <Text style={styles.errorText}>{anosError}</Text>
                      )}

                      <Title style={styles.subTitle}>Breve descripción</Title>
                      <TextInput
                        label="Descripción breve"
                        placeholder="Describe tu experiencia"
                        value={descBreve}
                        onChangeText={(t) => {
                          setDescBreve(t);
                          const length = t.trim().length;
                          setDescBreveError(length < 30 ? `Faltan ${30 - length} caracteres.` : '');
                        }}
                        mode="outlined"
                        multiline
                        style={[styles.input, { height: 80 }]}
                        error={!!descBreveError}
                        left={<TextInput.Icon icon="note-text" />}
                      />
                      <Text
                        style={{
                          marginBottom: 8,
                          color: descBreve.trim().length < 50 ? 'red' : 'green',
                          fontSize: 13,
                          fontStyle: 'italic',
                          textAlign: 'right',
                        }}
                      >
                        {descBreve.trim().length < 50
                          ? `Faltan ${50 - descBreve.trim().length} caracteres.`
                          : '¡Buena descripción! ✔️'}
                      </Text>
                      {descBreveError !== '' && (
                        <Text style={styles.errorText}>{descBreveError}</Text>
                      )}

                      <Title style={styles.subTitle}>Idiomas (opcional)</Title>
                      <TextInput
                        label="Idiomas"
                        placeholder="Ej: Español, Inglés"
                        value={idiomas}
                        onChangeText={setIdiomas}
                        mode="outlined"
                        style={styles.input}
                        left={<TextInput.Icon icon="translate" />}
                      />

                      <View style={{ marginTop: 8 }}>
                        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
                          <View
                            style={{
                              height: 8,
                              backgroundColor: theme.colors.primary,
                              width: `${minProgress(
                                (profesionId ? 1 : 0) +
                                  (anosExperiencia ? 1 : 0) +
                                  (descBreve ? 1 : 0) +
                                  (idiomas ? 1 : 0)
                              ) * 25}%`,
                              borderRadius: 4,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: '#444',
                            marginTop: 4,
                            textAlign: 'right',
                          }}
                        >
                          {
                            `${[
                              profesionId,
                              anosExperiencia,
                              descBreve,
                              idiomas,
                            ].filter(Boolean).length} de 4 campos`
                          }
                        </Text>
                      </View>
                    </Surface>
                  </>
                )}

                <View style={styles.buttonRow}>
                  {currentStep > 1 && (
                    <Button
                      mode="outlined"
                      onPress={handleBack}
                      style={[styles.navBtn, { borderColor: theme.colors.outline }]}
                      contentStyle={styles.btnContent}
                    >
                      Anterior
                    </Button>
                  )}
                  <Button
                    mode="contained"
                    onPress={handleNext}
                    style={[
                      styles.navBtn,
                      {
                        backgroundColor: theme.colors.primary,
                        marginLeft: currentStep > 1 ? 8 : 0,
                      },
                    ]}
                    contentStyle={styles.btnContent}
                  >
                    {currentStep === totalSteps ? 'Guardar Perfil' : 'Siguiente'}
                  </Button>
                <View style={{ marginBottom: 24 }} />
                </View>
                <Snackbar
                  visible={showSnackbar}
                  onDismiss={() => setShowSnackbar(false)}
                  duration={3000}
                  action={{
                    label: 'OK',
                    onPress: () => setShowSnackbar(false),
                  }}
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  🎉 Perfil guardado con éxito.
                </Snackbar>
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 12,
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
  errorText: {
  color: 'red',
  fontSize: 13,
  marginTop: -4,
  marginBottom: 8,
}



});
