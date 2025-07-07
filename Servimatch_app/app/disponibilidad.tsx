// app/disponibilidad.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Image, Text } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Title,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../components/BaseLayout';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://192.168.1.41:8000';
const WORK_DAY_START = 8;
const WORK_DAY_END = 18;

function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CL', { day: '2-digit' });
}

function formatearMes(fecha: Date): string {
  return fecha.toLocaleDateString('es-CL', { month: 'long' });
}

function formatearFechaCompleta(fecha: Date): string {
  return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'long' });
}
function finSemana(fecha: Date): Date {
  const fin = new Date(fecha);
  fin.setDate(fin.getDate() + 6);
  return fin;
}


export default function DisponibilidadScreen() {
  const { tokens } = useAuth();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [fecha, setFecha] = useState<Date>(new Date());
  const [trabajador, setTrabajador] = useState<any>(null);
  const [duracion, setDuracion] = useState<number>(0);
  const [slots, setSlots] = useState<string[]>([]);
  const [ocupados, setOcupados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [fechaInicioSemana, setFechaInicioSemana] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Lunes
    return today;
 });
useEffect(() => {
  if (!tokens?.access || !planId) {
    console.warn("⚠️ Token o planId faltante:", { token: tokens?.access, planId });
    return;
  }

  console.log("📡 Solicitando plan:", planId);

  fetch(`${API_BASE_URL}/api/planes/${planId}/`, {
    headers: { Authorization: `Bearer ${tokens.access}` },
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ Error HTTP al obtener plan (${res.status}):`, text);
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log('✅ Plan recibido:', data);
      setTrabajador(data.trabajador);

      const [h, m] = data.duracion_estimado.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) throw new Error('Formato inválido en duración');
      setDuracion(h * 60 + m);
    })
    .catch(err => {
      console.error('🚨 Error al cargar datos del plan:', err.message || err);
      Alert.alert('Error', 'No se pudo cargar los datos del plan');
    });
}, [tokens, planId]);



 
const inicio = fechaInicioSemana;
const fin = finSemana(fechaInicioSemana);
const mismoMes = inicio.getMonth() === fin.getMonth();

const textoSemana = mismoMes
  ? `Semana del ${formatearFecha(inicio)} al ${formatearFecha(fin)} de ${formatearMes(inicio)}`
  : `Semana del ${formatearFechaCompleta(inicio)} al ${formatearFechaCompleta(fin)}`;


  // Duración del plan
  useEffect(() => {
    if (!tokens?.access || !planId) return;

    fetch(`${API_BASE_URL}/api/planes/${planId}/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener el plan');
        return res.json();
      })
      .then((plan: any) => {
        const [h, m] = plan.duracion_estimado.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) throw new Error('Formato inválido');
        setDuracion(h * 60 + m);
      })
      .catch(e => {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar la duración del plan');
      });
  }, [tokens, planId]);

  // Carga de slots según fecha seleccionada
  useEffect(() => {
    if (!duracion || !planId) return;

    setLoading(true);
    const fechaStr = fecha.toISOString().slice(0, 10);
    fetch(`${API_BASE_URL}/api/reservas/?plan=${planId}&fecha=${fechaStr}`, {
      headers: { Authorization: `Bearer ${tokens?.access}` },
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const busy = data.map(r => r.hora_inicio);
        setOcupados(busy);

        const bloques: string[] = [];
        const step = duracion / 60;
        for (let h = WORK_DAY_START; h + step <= WORK_DAY_END; h += step) {
          const start = `${h.toString().padStart(2, '0')}:00`;
          const end = `${(h + step).toString().padStart(2, '0')}:00`;
          bloques.push(`${start} - ${end}`);
        }
        setSlots(bloques);
      })
      .catch(e => {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar las reservas');
      })
      .finally(() => setLoading(false));
  }, [fecha, duracion, planId, tokens]);

  const fechaIso = fecha.toISOString().slice(0, 10);

  if (!tokens?.access || loading) {
    return (
      <BaseLayout title="Disponibilidad" back>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Disponibilidad" back>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background },
        ]}
      >
        {trabajador && (
          <View style={styles.trabajadorBox}>
            {trabajador.foto_perfil && (
              <Image
                source={{ uri: `${API_BASE_URL}${trabajador.foto_perfil}` }}
                style={styles.fotoPerfil}
              />

            )}
            <Text style={styles.trabajadorNombre}>
              {trabajador.nombre} {trabajador.apellido}
            </Text>
            <Text style={styles.trabajadorEspecialidad}>
              {trabajador.profesion || 'Profesión no disponible'}
            </Text>
          </View>
        )}


        <Title style={styles.tituloCentrado}>
          {textoSemana}
        </Title>


          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Button
              onPress={() => {
                const nueva = new Date(fechaInicioSemana);
                nueva.setDate(nueva.getDate() - 7);
                setFechaInicioSemana(nueva);
              }}
              disabled={fechaInicioSemana <= new Date(new Date().toDateString())}
            >
              ‹
            </Button>


            <Button onPress={() => {
              const nueva = new Date(fechaInicioSemana);
              nueva.setDate(nueva.getDate() + 7);
              setFechaInicioSemana(nueva);
            }}>
              ›
            </Button>
          </View>
          <View style={styles.semanaGrid}>
            {getSemana(fechaInicioSemana).map(({ dia, fecha: f }) => {
              const fechaStr = f.toISOString().slice(0, 10);
              const seleccionado = fecha.toDateString() === f.toDateString();

              return (
                <Chip
                  key={fechaStr}
                  selected={seleccionado}
                  onPress={() => setFecha(f)}
                  style={[
                    styles.diaChip,
                    seleccionado && styles.diaChipSeleccionado,
                  ]}
                  textStyle={{ color: seleccionado ? '#fff' : '#000' }}
                >
                  {`${dia} ${f.getDate()}`}
                </Chip>
              );
            })}
          </View>

          


        <Title style={{ marginTop: 16 }}>Franjas disponibles</Title>
        <View style={styles.chipContainer}>
          {slots.map(slot => {
            const hoy = new Date();
            const esHoy = fecha.toDateString() === hoy.toDateString();
            const inicio = slot.split(' - ')[0];

            // Si es hoy, omitimos slots que ya pasaron
            if (esHoy) {
              const [hora, minuto] = inicio.split(':').map(Number);
              if (
                hora < hoy.getHours() ||
                (hora === hoy.getHours() && minuto <= hoy.getMinutes())
              ) {
                return null; // no mostrar este slot
              }
            }

            const disabled = ocupados.includes(inicio);
            return (
              <Chip
                key={slot}
                mode="outlined"
                selected={selectedSlot === slot}
                onPress={() => setSelectedSlot(slot)}
                disabled={disabled}
                style={styles.chip}
              >
                {slot}
              </Chip>
            );
          })}
        </View>

        <Button
          mode="contained"
          disabled={!selectedSlot}
          style={styles.confirmBtn}
          onPress={() =>
            router.push(
              `./confirmarPago?planId=${planId}&fecha=${fechaIso}&hora_inicio=${
                selectedSlot?.split(' - ')[0]
              }`
            )
          }
        >
          Confirmar horario
        </Button>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  chip: { margin: 4 },
  confirmBtn: { marginTop: 24 },
  semanaGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginVertical: 12,
  },
  diaChip: {
    width: '30%',
    marginBottom: 8,
    backgroundColor: '#f1f1f1',
  },
  diaChipSeleccionado: {
    backgroundColor: '#1976D2',
  },
  tituloCentrado: {
  textAlign: 'center',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 8,
},
trabajadorBox: {
  alignItems: 'center',
  marginBottom: 20,
},

fotoPerfil: {
  width: 80,
  height: 80,
  borderRadius: 40,
  marginBottom: 8,
  backgroundColor: '#ccc',
},

trabajadorNombre: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#000',
},

trabajadorEspecialidad: {
  fontSize: 14,
  color: '#666',
},


});


function getSemana(fechaBase: Date): { dia: string; fecha: Date }[] {
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const semana = [];
  const hoy = new Date(new Date().toDateString());

  // Ajustar fecha base al lunes de la semana
  const base = new Date(fechaBase);
  base.setDate(fechaBase.getDate() - ((fechaBase.getDay() + 6) % 7)); // lunes

  for (let i = 0; i < 7; i++) {
    const fecha = new Date(base);
    fecha.setDate(base.getDate() + i);

    if (fecha >= hoy) {
      semana.push({
        dia: dias[i],
        fecha,
      });
    }
  }

  return semana;
}
