import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState, memo } from 'react';
import { Alert, Animated, StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Keyboard } from 'react-native';
// Altura de la ventana para centrar inputs
const windowHeight = Dimensions.get('window').height;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Chip,
  IconButton,
  ProgressBar,
  Surface,
  Text,
  TextInput,
  useTheme,
  Snackbar,
  Portal,
  Dialog,
  Paragraph,
  HelperText,
  Modal,
} from 'react-native-paper';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

type AvatarSectionProps = {
  fotoUri: string | null;
  pickImage: () => void;
};
function AvatarSection({ fotoUri, pickImage }: AvatarSectionProps) {
  const theme = useTheme();
  return (
    <View style={styles.avatarSection}>
      <View
        style={[
          styles.avatarWrapper,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        {fotoUri ? (
          <Avatar.Image
            size={100}
            source={{ uri: fotoUri }}
            style={{ backgroundColor: 'transparent' }}
          />
        ) : (
          <Avatar.Icon
            size={100}
            icon="account"
            style={{ backgroundColor: 'transparent' }}
          />
        )}
        <IconButton
          icon="plus"
          size={24}
          style={[styles.plus, { backgroundColor: theme.colors.primary }]}
          iconColor="#fff"
          onPress={pickImage}
          accessibilityLabel="Cambiar foto de perfil"
        />
      </View>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Editar foto de perfil</Text>
    </View>
  );
}

const DisponibilidadCard = memo(function DisponibilidadCard({
  diasSemana,
  diaActivo,
  setDiaActivo,
  disponibilidadObj,
  actualizarFranja,
  eliminarFranja,
  horas,
  abrirModalFranja,
}: {
  diasSemana: string[];
  diaActivo: string | null;
  setDiaActivo: (d: string | null) => void;
  disponibilidadObj: { [key: string]: { inicio: string; fin: string }[] };
  actualizarFranja: (dia: string, i: number, campo: 'inicio' | 'fin', v: string) => void;
  eliminarFranja: (dia: string, i: number) => void;
  horas: string[];
  abrirModalFranja: (dia: string) => void;
}) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <Surface style={styles.card}>
      <Text style={styles.cardTitle}>Disponibilidad</Text>
      {diasSemana.map(dia => {
        const franjas = disponibilidadObj[dia] || [];
        const franjasValidas = franjas.filter(f => f.inicio && f.fin);
        const isOpen = franjasValidas.length > 0;
        return (
          <View key={dia} style={styles.diaBox}>
            {/* HEADER: calendario, día, estado y flecha */}
            <TouchableOpacity
              style={styles.diaHeader}
              onPress={() => setDiaActivo(diaActivo === dia ? null : dia)}
              accessibilityRole="button"
              accessibilityLabel={`${capitalize(dia)}: ${diaActivo === dia ? 'Cerrar' : 'Abrir'}`}
            >
              <Text>📅</Text>
              <Text style={styles.diaNombre}>{capitalize(dia)}</Text>
              {/* Estado disponible/no disponible */}
              <Text
                style={[
                  styles.headerEstado,
                  isOpen ? styles.resumenAbierto : styles.resumenCerrado
                ]}
              >
                {isOpen ? 'Disponible' : 'No disponible'}
              </Text>
              <Text style={styles.diaArrow}>{diaActivo === dia ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {diaActivo === dia && (
              <>
                {/* Horario dentro del bloque expandido */}
                <Text
                  style={[
                    styles.horario,
                    isOpen ? styles.resumenAbierto : styles.resumenCerrado
                  ]}
                >
                  {isOpen
                    ? franjasValidas.map(f => `${f.inicio}–${f.fin}`).join(', ')
                    : 'No disponible'}
                </Text>
                {/* Pickers y basura por franja */}
                {franjas.map((f, i) => (
                  <View key={i} style={styles.franjaRow}>
                    <Picker
                      selectedValue={f.inicio}
                      onValueChange={v => actualizarFranja(dia, i, 'inicio', v)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Inicio" value="" />
                      {horas.map(h => (
                        <Picker.Item key={h} label={h} value={h} />
                      ))}
                    </Picker>
                    <Picker
                      selectedValue={f.fin}
                      onValueChange={v => actualizarFranja(dia, i, 'fin', v)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Fin" value="" />
                      {horas.map(h => (
                        <Picker.Item key={h} label={h} value={h} />
                      ))}
                    </Picker>
                    <IconButton
                      icon="trash-can-outline"
                      size={20}
                      onPress={() => eliminarFranja(dia, i)}
                      accessibilityLabel={`Eliminar franja ${i + 1}`}
                    />
                  </View>
                ))}
                <Button
                  mode="outlined"
                  compact
                  onPress={() => abrirModalFranja(dia)}
                  style={styles.addButton}
                >
                  + Agregar franja
                </Button>
              </>
            )}
          </View>
        );
      })}
    </Surface>
  );
});



type Servicio = { id: number; nombre: string };
const ServiciosCardModal = memo(function ServiciosCardModal({
  visible,
  onOpen,
  onDismiss,
  servicios,
  serviciosSeleccionados,
  toggleServicio,
}: {
  visible: boolean;
  onOpen: () => void;
  onDismiss: () => void;
  servicios: Servicio[];
  serviciosSeleccionados: number[];
  toggleServicio: (id: number) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Resumen para la cabecera
  const resumen =
    serviciosSeleccionados.length > 0
      ? servicios
        .filter(s => serviciosSeleccionados.includes(s.id))
        .map(s => s.nombre)
        .join(', ')
      : 'Ninguno';

  return (
    <>
      {/* Header que abre el modal */}
      <Surface style={serviciosCardModalStyles.card}>
        <TouchableOpacity
          style={[serviciosCardModalStyles.cardHeader, { backgroundColor: '#f0f0f0' }]}
          onPress={onOpen}
        >
          <View style={{ flex: 1 }}>
            <Text style={serviciosCardModalStyles.cardTitle}>Servicios ofrecidos</Text>
            <Text style={serviciosCardModalStyles.cardResumen}>{resumen}</Text>
          </View>
          <IconButton icon={visible ? 'chevron-up' : 'chevron-down'} size={24} />
        </TouchableOpacity>
      </Surface>
      {/* Modal full-screen */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          dismissable
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              width: '90%',
              maxWidth: 400,
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              padding: 16,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
              Selecciona servicios
            </Text>
            <ScrollView
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
              }}
            >
              {servicios.map(s => (
                <Chip
                  key={s.id}
                  selected={serviciosSeleccionados.includes(s.id)}
                  onPress={() => toggleServicio(s.id)}
                  style={{ margin: 4 }}
                >
                  {s.nombre}
                </Chip>
              ))}
            </ScrollView>
            <Button
              mode="contained"
              onPress={onDismiss}
              style={{ marginTop: 16, borderRadius: 8 }}
            >
              Aceptar
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
});

const modalStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

const serviciosCardModalStyles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardResumen: {
    flex: 1,
    marginHorizontal: 8,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default function Editar() {
  // ------ TODOS los hooks arriba de cualquier return -----
  // Estado para la altura del teclado
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { tokens } = useAuth();
  const accessToken = tokens?.access;
  const router = useRouter();
  const theme = useTheme();

  // hook para escuchar teclado
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);


  // Estado para el modal de franja
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDia, setModalDia] = useState<string>('');
  const [tempInicio, setTempInicio] = useState('');
  const [tempFin, setTempFin] = useState('');

  // Funciones para abrir y confirmar franja (deben estar aquí para que estén en scope)
  const abrirModalFranja = (dia: string) => {
    setModalDia(dia);
    setTempInicio('');
    setTempFin('');
    setModalVisible(true);
  };
  const confirmarFranja = () => {
    if (!tempInicio || !tempFin) {
      Alert.alert('Error', 'Debes seleccionar inicio y fin');
      return;
    }
    setDisponibilidadObj(prev => ({
      ...prev,
      [modalDia]: [
        ...prev[modalDia],
        { inicio: tempInicio, fin: tempFin },
      ],
    }));
    setModalVisible(false);
  };

  // Estado para controlar el scroll del fondo cuando el modal de servicios está abierto
  const [visibleServiciosModal, setVisibleServiciosModal] = useState(false);

  // Referencias para scroll y campos
  const scrollRef = useRef<ScrollView>(null);
  const nombreRef = useRef<any>(null);
  const apellidoRef = useRef<any>(null);
  const telefonoRef = useRef<any>(null);
  const biografiaRef = useRef<any>(null);
  const direccionRef = useRef<any>(null);
  const inputHeight = 56; // Para campos normales
  const inputHeightMultiline = 80; // Para biografía (ajusta si tu estilo es diferente)
  const offset = Platform.OS === 'ios' ? inputHeightMultiline : inputHeight;

  // Estado para guardar posiciones de los campos
  const [positions, setPositions] = useState<{ [key: string]: number }>({});
  function onFieldLayout(field: string) {
    return (e: any) => {
      const layout = e.nativeEvent?.layout;
      if (layout && typeof layout.y === 'number') {
        setPositions(prev => ({ ...prev, [field]: layout.y }));
      }
      // si no hay layout, simplemente no actualizamos nada
    };
  }

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [biografia, setBiografia] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  type Servicio = { id: number; nombre: string };
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<number[]>([]);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  const horas = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  const [disponibilidadObj, setDisponibilidadObj] = useState<{
    [key: string]: { inicio: string; fin: string }[];
  }>({
    lunes: [],
    martes: [],
    miércoles: [],
    jueves: [],
    viernes: [],
    sábado: [],
    domingo: [],
  });
  const agregarFranja = (dia: string) => {
    setDisponibilidadObj((prev) => ({
      ...prev,
      [dia]: [...prev[dia], { inicio: '', fin: '' }],
    }));
  };
  const actualizarFranja = (dia: string, index: number, campo: 'inicio' | 'fin', valor: string) => {
    const nuevasFranjas = [...disponibilidadObj[dia]];
    nuevasFranjas[index][campo] = valor;
    setDisponibilidadObj((prev) => ({ ...prev, [dia]: nuevasFranjas }));
  };
  const eliminarFranja = (dia: string, index: number) => {
    const nuevasFranjas = disponibilidadObj[dia].filter((_, i) => i !== index);
    setDisponibilidadObj((prev) => ({ ...prev, [dia]: nuevasFranjas }));
  };

  // Carga datos de perfil
  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        const [perfilRes, serviciosRes] = await Promise.all([
          fetch('http://192.168.100.109:8000/api/usuarios/me/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch('http://192.168.100.109:8000/api/servicios/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (!perfilRes.ok) throw new Error(await perfilRes.text());
        if (!serviciosRes.ok) throw new Error(await serviciosRes.text());

        const data = await perfilRes.json();
        setNombre(data.nombre || '');
        setApellido(data.apellido || '');
        setTelefono(data.telefono || '');
        setBiografia(data.biografia || '');
        setDireccion(data.direccion || '');

        const disponibilidadData = data.trabajador_profile?.disponibilidad || '{}';
        try {
          const parsed = JSON.parse(disponibilidadData);
          console.log("DISPONIBILIDAD ORIGINAL:", disponibilidadData);
          console.log("DISPONIBILIDAD PARSED:", parsed);
          const disponibilidadCompleta = diasSemana.reduce((acc, dia) => {
            const franjas = parsed[dia] || [];
            acc[dia] = franjas.length ? franjas : [{ inicio: '', fin: '' }];  // ← asegura siempre una franja
            return acc;
          }, {} as { [key: string]: { inicio: string; fin: string }[] });

          setDisponibilidadObj(disponibilidadCompleta);
        } catch (error) {
          console.warn('Disponibilidad malformateada:', error);
        }

        setServiciosSeleccionados(data.trabajador_profile?.servicios || []);

        if (data.foto_perfil) {
          setFotoUri(
            data.foto_perfil.startsWith('http')
              ? data.foto_perfil
              : `http://192.168.100.109:8000${data.foto_perfil}`
          );
        }

        const serviciosData = await serviciosRes.json();
        setServicios(serviciosData);
      } catch (e) {
        console.error('Error al cargar perfil:', e);
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

  const [errors, setErrors] = useState<{ nombre?: string; apellido?: string; telefono?: string; biografia?: string; direccion?: string }>({
    nombre: undefined,
    apellido: undefined,
    telefono: undefined,
    biografia: undefined,
    direccion: undefined,
  });

  const validate = () => {
    const e: typeof errors = {};
    if (!nombre.trim()) e.nombre = 'Requerido';
    if (!apellido.trim()) e.apellido = 'Requerido';
    if (!telefono.trim()) e.telefono = 'Requerido';
    if (!biografia.trim()) e.biografia = 'Requerido';
    if (!direccion.trim()) e.direccion = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; error?: boolean }>({ visible: false, message: '', error: false });

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    if (!accessToken) return;
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
        'http://192.168.100.109:8000/api/usuarios/actualizar-perfil/',
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: form,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setSnackbar({ visible: true, message: 'Perfil actualizado', error: false });
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      console.error('Error al actualizar perfil:', e);
      setSnackbar({ visible: true, message: 'No se pudo actualizar', error: true });
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
        const res = await fetch('http://192.168.100.109:8000/api/fotos-trabajador/', {
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

  // Helper para barra de progreso
  const totalFields = 7;
  const completedFields = [
    nombre.trim(),
    apellido.trim(),
    telefono.trim(),
    biografia.trim(),
    direccion.trim(),
    serviciosSeleccionados.length ? 'x' : '',
    Object.values(disponibilidadObj).some(arr => arr.some(f => f.inicio && f.fin)) ? 'x' : '',
  ].filter(Boolean).length;
  const progress = completedFields / totalFields;
  function minProgress(val: number) {
    return val === 0 ? 0.01 : val;
  }

  // Centrar dinámicamente el input en la pantalla útil (pantalla menos teclado)
  function handleFocus(field: string) {
    const y = positions[field] ?? 0;
    // Altura útil (pantalla sin teclado):
    const visibleHeight = windowHeight - keyboardHeight;
    // Queremos centrar el input en esa zona:
    const targetY = y - (visibleHeight / 2) + (offset / 2);
    scrollRef.current?.scrollTo({
      y: Math.max(0, targetY),
      animated: true,
    });
  }

  return (
    <BaseLayout title="Editar perfil" back>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={offset}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!visibleServiciosModal}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <Surface style={[styles.formSection, { backgroundColor: theme.colors.surface }]}>
              <AvatarSection fotoUri={fotoUri} pickImage={pickImage} />
              <View onLayout={onFieldLayout('nombre')}>
                <TextInput
                  ref={nombreRef}
                  label="Nombre"
                  accessibilityLabel="Nombre"
                  value={nombre}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => apellidoRef.current?.focus()}
                  onFocus={() => handleFocus('nombre')}
                  onChangeText={t => {
                    setNombre(t);
                    if (errors.nombre) setErrors({ ...errors, nombre: undefined });
                  }}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.nombre}
                />
              </View>
              {errors.nombre && (
                <Text style={{ color: '#B00020', fontSize: 12, marginBottom: 8 }}>{errors.nombre}</Text>
              )}
              <View onLayout={onFieldLayout('apellido')}>
                <TextInput
                  ref={apellidoRef}
                  label="Apellido"
                  accessibilityLabel="Apellido"
                  value={apellido}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => telefonoRef.current?.focus()}
                  onFocus={() => handleFocus('apellido')}
                  onChangeText={t => {
                    setApellido(t);
                    if (errors.apellido) setErrors({ ...errors, apellido: undefined });
                  }}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.apellido}
                />
              </View>
              {errors.apellido && (
                <Text style={{ color: '#B00020', fontSize: 12, marginBottom: 8 }}>{errors.apellido}</Text>
              )}
              <View onLayout={onFieldLayout('telefono')}>
                <TextInput
                  ref={telefonoRef}
                  label="Teléfono"
                  accessibilityLabel="Teléfono"
                  value={telefono}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => biografiaRef.current?.focus()}
                  onFocus={() => handleFocus('telefono')}
                  onChangeText={t => {
                    setTelefono(t);
                    if (errors.telefono) setErrors({ ...errors, telefono: undefined });
                  }}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.telefono}
                />
              </View>
              <View onLayout={onFieldLayout('biografia')}>
                <TextInput
                  ref={biografiaRef}
                  label="Biografía"
                  accessibilityLabel="Biografía"
                  value={biografia}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  multiline
                  onSubmitEditing={() => direccionRef.current?.focus()}
                  onFocus={() => handleFocus('biografia')}
                  onChangeText={t => {
                    setBiografia(t);
                    if (errors.biografia) setErrors({ ...errors, biografia: undefined });
                  }}
                  mode="outlined"
                  style={[styles.input, { height: 80 }]}
                  error={!!errors.biografia}
                />
              </View>
              <View onLayout={onFieldLayout('direccion')}>
                <TextInput
                  ref={direccionRef}
                  label="Dirección"
                  accessibilityLabel="Dirección"
                  value={direccion}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onFocus={() => handleFocus('direccion')}
                  onChangeText={t => {
                    setDireccion(t);
                    if (errors.direccion) setErrors({ ...errors, direccion: undefined });
                  }}
                  mode="outlined"
                  style={styles.input}
                  error={!!errors.direccion}
                />
              </View>
              <DisponibilidadCard
                diasSemana={diasSemana}
                diaActivo={diaActivo}
                setDiaActivo={setDiaActivo}
                disponibilidadObj={disponibilidadObj}
                actualizarFranja={actualizarFranja}
                eliminarFranja={eliminarFranja}
                horas={horas}
                abrirModalFranja={abrirModalFranja}
              />
              <Portal>
                <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
                  <Dialog.Title>Agregar franja para {modalDia}</Dialog.Title>
                  <Dialog.Content>
                    <Paragraph>Selecciona horario:</Paragraph>
                    <Picker
                      selectedValue={tempInicio}
                      onValueChange={setTempInicio}
                    >
                      <Picker.Item label="Inicio" value="" />
                      {horas.map(h => <Picker.Item key={h} label={h} value={h} />)}
                    </Picker>
                    <Picker
                      selectedValue={tempFin}
                      onValueChange={setTempFin}
                    >
                      <Picker.Item label="Fin" value="" />
                      {horas.map(h => <Picker.Item key={h} label={h} value={h} />)}
                    </Picker>
                    <HelperText type="error" visible={!tempInicio || !tempFin}>
                      Debes seleccionar ambas horas (inicio y fin)
                    </HelperText>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button onPress={() => setModalVisible(false)}>Cancelar</Button>
                    <Button onPress={confirmarFranja} disabled={!tempInicio || !tempFin}>
                      Guardar
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
              <ServiciosCardModal
                visible={visibleServiciosModal}
                onOpen={() => setVisibleServiciosModal(true)}
                onDismiss={() => setVisibleServiciosModal(false)}
                servicios={servicios}
                serviciosSeleccionados={serviciosSeleccionados}
                toggleServicio={toggleServicio}
              />
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || Object.keys(errors).length > 0 || !nombre.trim() || !apellido.trim() || !telefono.trim() || !biografia.trim() || !direccion.trim()}
                style={styles.button}
              >
                Guardar cambios
              </Button>
            </Surface>
          </Animated.View>
        </ScrollView>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={2000}
          style={{ backgroundColor: snackbar.error ? '#B00020' : theme.colors.primary }}
        >
          {snackbar.message}
        </Snackbar>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
    overflow: 'hidden',
    height: 35,
    justifyContent: 'center',
  },
  tablaContainer: {
    marginTop: 8,
  },

  diaBox: {
    backgroundColor: '#f8f8fc',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 1,
  },

  diaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  horario: {
    paddingHorizontal: 10,
    marginBottom: 8,
    fontStyle: 'italic',
  },

  diaEmoji: {
    fontSize: 16,
  },

  diaNombre: {
    flex: 1,
    marginLeft: 6,
    fontWeight: '600',
  },

  diaResumen: {
    fontSize: 13,
    fontStyle: 'italic',
    // color por defecto neutral
    color: '#888',
  },
  resumenAbierto: {
    color: 'green',
    fontWeight: '600',
  },
  resumenCerrado: {
    color: 'red',
    fontWeight: '600',
  },

  diaArrow: {
    fontSize: 16,
    marginLeft: 4,
  },

  franjaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#f9f9fc',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
  },
  progress: {
    height: 4,
    borderRadius: 8,
    marginTop: 16,
  },
  headerEstado: {
    marginHorizontal: 8,
    fontStyle: 'italic',
  },
});
