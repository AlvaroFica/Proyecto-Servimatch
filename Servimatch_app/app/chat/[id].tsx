import React, { useEffect, useRef, useState } from 'react';
// ✅ importación correcta para TypeScript y JSX
import { LinearGradient } from 'expo-linear-gradient';


const LGradient: any = LinearGradient;

import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar, IconButton, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://192.168.100.4:8000';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { tokens } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [yo, setYo] = useState<{ id: number; rol: string } | null>(null);
  const [destinatario, setDestinatario] = useState<{
    nombre: string;
    apellido: string;
    foto_perfil?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!tokens?.access) return;

    fetch(`${API_BASE_URL}/api/usuarios/me/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then((res) => res.json())
      .then((data) => setYo({ id: data.id, rol: data.rol }))
      .catch((err) => console.error('Error cargando usuario actual:', err));
  }, [tokens]);

  useEffect(() => {
    if (!id || !tokens?.access || !yo) return;

    const fetchChat = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chats/${id}/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const data = await res.json();

        if (data.cliente?.id === yo.id) {
          setDestinatario(data.trabajador);
        } else {
          setDestinatario(data.cliente);
        }
      } catch (error) {
        console.error('Error obteniendo destinatario:', error);
      }
    };

    fetchChat();
  }, [id, tokens?.access, yo]);

  useEffect(() => {
    if (!id || !tokens?.access) return;

    const cargarMensajes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chats/${id}/mensajes/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const data = await res.json();
        setMensajes(data);
        setCargando(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      }
    };

    cargarMensajes();
    const interval = setInterval(cargarMensajes, 5000);
    return () => clearInterval(interval);
  }, [id, tokens]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !id || !tokens?.access) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${id}/mensajes/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contenido: nuevoMensaje }),
      });

      const nuevo = await res.json();
      setMensajes((prev) => [...prev, nuevo]);
      setNuevoMensaje('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={24}
          onPress={() => router.back()}
        />
        {destinatario && (
          <View style={styles.headerContent}>
            <Avatar.Image
              size={40}
              source={
                destinatario.foto_perfil
                  ? { uri: `${API_BASE_URL}${destinatario.foto_perfil}` }
                  : require('../../assets/images/avatar_default.png')
              }
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.nombre}>
                {destinatario.nombre} {destinatario.apellido}
              </Text>
              {yo?.rol && <Text style={styles.rol}>Tu rol: {yo.rol}</Text>}
            </View>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {cargando ? (
          <Text>Cargando...</Text>
        ) : (
          mensajes.map((msg) => {
            const esMio = msg.remitente.id === yo?.id;
            return (
              <View key={msg.id} style={{ marginBottom: 8 }}>
                {esMio ? (
                  <View style={{ alignSelf: 'flex-end' }}>
                    <LinearGradient
                      colors={['#2196f3', '#4fc3f7']}
                      style={styles.burbujaMia}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={{ color: 'white' }}>{msg.contenido}</Text>
                      <View style={styles.meta}>
                        <Text style={styles.hora}>
                          {new Date(msg.enviado).toLocaleTimeString('es-CL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.check}>✔</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ) : (
                  <View style={styles.burbujaOtro}>
                    <Text style={{ color: 'black' }}>{msg.contenido}</Text>
                    <Text style={styles.hora}>
                      {new Date(msg.enviado).toLocaleTimeString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>


      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
        <TextInput
          placeholder="Escribe un mensaje..."
          placeholderTextColor="white" // ✅ Aquí lo cambias a blanco
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={enviarMensaje}
          style={[styles.btnEnviar, { backgroundColor: theme.colors.primary }]}
        >
          <IconButton icon="send" iconColor="white" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#006064', // Verde oscuro
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nombre: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rol: {
    color: '#e0f7fa',
    fontSize: 12,
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 100,
    backgroundColor: '#f1f3f4', // ✅ fondo gris claro moderno
  },
  burbujaMia: {
    borderTopRightRadius: 0,
    borderRadius: 16,
    padding: 10,
    alignSelf: 'flex-end',
    maxWidth: '75%',
  },
  burbujaOtro: {
    borderTopLeftRadius: 0,
    borderRadius: 16,
    padding: 10,
    alignSelf: 'flex-start',
    maxWidth: '75%',
    backgroundColor: '#e0e0e0',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  hora: {
    fontSize: 10,
    color: '#444', // ✅ más oscuro para buena visibilidad
  },
  check: {
    fontSize: 12,
    color: '#cdeeff',
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 12, // base
    backgroundColor: '#006064',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#1e3d3d',
    paddingHorizontal: 12,
    marginRight: 8,
    height: 40,
    color: '#000',
  },
  btnEnviar: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004d40',
  },
});
