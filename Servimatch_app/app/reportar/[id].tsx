import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Dimensions
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Paragraph,
  Text,
  TextInput,
  Title,
  useTheme
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const API = 'http://192.168.1.58:8000'; // Ajusta si es necesario

interface TrabajadorPerfil {
  id: number;
  nombre: string;
  apellido: string;
  profesion: string;
  foto_perfil?: string;
  biografia?: string;
}

export default function PerfilReporteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tokens } = useAuth();
  const theme = useTheme();
  const router = useRouter();

  const [perfil, setPerfil] = useState<TrabajadorPerfil | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!tokens?.access || !id) return;

    (async () => {
      try {
        const res = await fetch(`${API}/api/trabajadores/${id}/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });

        if (!res.ok) throw new Error(await res.text());
        const data: TrabajadorPerfil = await res.json();
        setPerfil(data);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'No se pudo cargar el perfil del trabajador');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, tokens]);

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      Alert.alert('Error', 'Debes escribir un mensaje');
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`${API}/api/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          mensaje,
          tipo: 'reporte',
          role: 'cliente',
          trabajador: id,
        }),
      });

      if (res.ok) {
        Alert.alert('Enviado', 'El reporte fue enviado exitosamente');
        router.back();
      } else {
        const err = await res.json();
        Alert.alert('Error', err.detail || 'No se pudo enviar el reporte');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Error de red');
    } finally {
      setEnviando(false);
    }
  };

  const fotoUri = perfil?.foto_perfil
    ? perfil.foto_perfil.startsWith('http')
      ? perfil.foto_perfil
      : `${API}${perfil.foto_perfil}`
    : 'https://via.placeholder.com/100';

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card} elevation={3}>
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
          <Avatar.Image size={90} source={{ uri: fotoUri }} style={styles.avatar} />
          <View style={styles.info}>
            <Title style={{ color: theme.colors.onPrimaryContainer }}>
              {perfil.nombre} {perfil.apellido}
            </Title>
            <Text style={[styles.profession, { color: theme.colors.onPrimaryContainer }]}>
              {perfil.profesion}
            </Text>
          </View>
        </View>

        <Card.Content>
          {perfil.biografia && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Acerca de mí</Text>
              <Paragraph>{perfil.biografia}</Paragraph>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Enviar reporte
            </Text>
            <TextInput
              label="Mensaje"
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={5}
              mode="outlined"
              style={{ marginBottom: 16 }}
            />
            <Button
              mode="contained"
              onPress={handleEnviar}
              loading={enviando}
              disabled={enviando}
            >
              Enviar
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  profession: {
    fontStyle: 'italic',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
