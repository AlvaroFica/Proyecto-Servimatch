import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Paragraph,
  Text,
  Title,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../../components/BaseLayout';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://192.168.100.104:8000';

interface FotoTrabajador { imagen: string; }








interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
}

interface TrabajadorPerfil {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil?: string;
  biografia?: string;
  profesion: string;
  rating?: number;
  disponibilidad?: string;
  servicios?: Servicio[];
  galeria?: { imagen: string }[];
}








export default function PerfilTrabajadorScreen() {
  const { tokens } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;

  const [perfil, setPerfil] = useState<TrabajadorPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [verTodosLosHorarios, setVerTodosLosHorarios] = useState(false); // 👈 AÑADE ESTO

  useEffect(() => {
    if (!tokens?.access || !id) return;
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/trabajadores/${id}/`,
          { headers: { Authorization: `Bearer ${tokens.access}` } }
        );
        if (!res.ok) throw new Error(await res.text());
        const data: TrabajadorPerfil = await res.json();
        setPerfil(data);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tokens]);

  if (loading) {
    return (
      <BaseLayout title="Perfil" back>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseLayout>
    );
  }

  if (!perfil) {
    return (
      <BaseLayout title="Perfil" back>
        <View style={styles.center}>
          <Paragraph>No se encontró el perfil.</Paragraph>
        </View>
      </BaseLayout>
    );
  }

  const fotoUri = perfil.foto_perfil
    ? perfil.foto_perfil.startsWith('http')
      ? perfil.foto_perfil
      : `${API_BASE_URL}${perfil.foto_perfil}`
    : 'https://via.placeholder.com/100';

  return (
    <BaseLayout title="Perfil" back>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background },
        ]}
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={3}>
          <View
            style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <Avatar.Image size={100} source={{ uri: fotoUri }} style={styles.avatar} />
            <View style={styles.headerInfo}>
              <Title style={[styles.name, { color: theme.colors.onPrimaryContainer }]}>
                {perfil.nombre} {perfil.apellido}
              </Title>
              <Text style={[styles.profession, { color: theme.colors.onPrimaryContainer }]}>
                {perfil.profesion}
              </Text>
              <View style={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text
                    key={i}
                    style={{
                      color:
                        i < (perfil.rating ?? 0)
                          ? theme.colors.primary
                          : theme.colors.surfaceDisabled,
                      fontSize: 16,
                    }}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <Card.Content>
            {perfil.biografia ? (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Acerca de mí</Text>
                <Paragraph style={[styles.sectionText, { color: theme.colors.onSurface }]}>
                  {perfil.biografia}
                </Paragraph>
              </View>
            ) : null}
            {perfil.disponibilidad && (
              (() => {
                let disponibilidadParsed: Record<string, any[]> = {};
                try {
                  disponibilidadParsed = JSON.parse(perfil.disponibilidad.replace(/'/g, '"'));
                } catch (e) {
                  console.error('Error al parsear disponibilidad:', e);
                }

                const hoy = new Date().toLocaleString('es-CL', { weekday: 'long' }).toLowerCase();
                const franjasHoy = (disponibilidadParsed[hoy] || []).filter(f => f.inicio && f.fin);


                return (
                  <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                      Disponibilidad
                    </Text>

                    <TouchableOpacity onPress={() => setVerTodosLosHorarios(prev => !prev)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.sectionText, { fontWeight: 'bold', color: 'tomato', marginRight: 6 }]}>
                        {(() => {
                          const hoy = new Date().toLocaleString('es-CL', { weekday: 'long' }).toLowerCase();
                          let franjasHoy: any[] = [];
                          try {
                            const disponibilidadParsed = JSON.parse(perfil.disponibilidad.replace(/'/g, '"'));
                            franjasHoy = (disponibilidadParsed[hoy] || []).filter((f: any) => f.inicio && f.fin);
                          } catch (e) {
                            console.error('Error al parsear disponibilidad de hoy:', e);
                          }

                          if (!franjasHoy || franjasHoy.length === 0) return 'Hoy cerrado';
                          return 'Hoy: ' + franjasHoy.map((f: any) => `${f.inicio}–${f.fin}`).join(', ');
                        })()}

                      </Text>
                      <Text style={{ fontSize: 16 }}>
                        {verTodosLosHorarios ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>


                    {verTodosLosHorarios && (
                      <View style={{ marginTop: 8 }}>
                        {[
                          'lunes', 'martes', 'miércoles', 'jueves',
                          'viernes', 'sábado', 'domingo'
                        ].map((dia) => {
                          const franjas = (disponibilidadParsed[dia] || []).filter(f => f.inicio && f.fin); // ✅ filtramos las vacías
                          return (
                            <Text key={dia} style={styles.sectionText}>
                              {dia.charAt(0).toUpperCase() + dia.slice(1)}:{' '}
                              {franjas.length > 0
                                ? franjas.map((f: any) => `${f.inicio}–${f.fin}`).join(', ')
                                : 'Cerrado'}
                            </Text>
                          );
                        })}

                      </View>
                    )}
                  </View>
                );
              })()
            )}



            {perfil.servicios?.length ? (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Servicios</Text>
                <View style={styles.chipContainer}>
                  {perfil.servicios?.map(servicio => (
                    <Chip
                      key={servicio.id}
                      style={[styles.chip, { borderColor: theme.colors.primary }]}
                      textStyle={{ color: theme.colors.primary }}
                      mode="outlined"
                    >
                      {servicio.nombre}
                    </Chip>
                  ))}

                </View>
              </View>
            ) : null}
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              onPress={() =>
                router.push(`/PlanesScreen?trabajadorId=${perfil.id}`)
              }
              style={[styles.btn, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: theme.colors.onPrimary }}
            >
              Contratar
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id: perfil.id.toString() }
                })
              }
              style={[styles.btn, { borderColor: theme.colors.primary }]}
              labelStyle={{ color: theme.colors.primary }}
            >
              Chatear
            </Button>





          </Card.Actions>
        </Card>

        <Card style={[styles.galleryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Card.Title title="Galería" titleStyle={{ color: theme.colors.primary }} />
          <Card.Content>
            <View style={styles.galleryContainer}>
              {(perfil.galeria && perfil.galeria.length
                ? perfil.galeria.map(item => item.imagen)
                : Array.from({ length: 6 }).map(() => null)
              ).map((uri, idx) =>
                uri ? (
                  <Card.Cover
                    key={idx}
                    source={{ uri }}
                    style={[
                      styles.galleryImage,
                      { width: (screenWidth - 48) / 3 },
                    ]}
                  />
                ) : (
                  <View
                    key={idx}
                    style={[
                      styles.placeholder,
                      {
                        width: (screenWidth - 48) / 3,
                        backgroundColor: theme.colors.surfaceVariant,
                      },
                    ]}
                  />
                )
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  avatar: { borderWidth: 2, borderColor: 'white' },
  headerInfo: { marginLeft: 16, flex: 1 },
  name: { fontSize: 20, fontWeight: '700' },
  profession: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  stars: { flexDirection: 'row', marginTop: 4 },
  sectionContainer: { marginVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sectionText: { fontSize: 14, lineHeight: 20 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: { margin: 4 },
  actions: { justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  btn: { flex: 1, marginHorizontal: 4 },
  galleryCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  galleryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  galleryImage: { aspectRatio: 1, marginBottom: 8, borderRadius: 8 },
  placeholder: {
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
  },
});
