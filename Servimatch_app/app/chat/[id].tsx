import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://192.168.100.104:8000';

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // ID del trabajador
  const { tokens } = useAuth();
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [chatId, setChatId] = useState<number | null>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [yo, setYo] = useState<{ id: number; rol: string } | null>(null);
  const insets = useSafeAreaInsets();


  // Obtener usuario actual
  useEffect(() => {
    if (!tokens?.access) return;

    fetch(`${API_BASE_URL}/api/usuarios/me/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setYo({ id: data.id, rol: data.rol });
      })
      .catch((err) => {
        console.error('Error cargando usuario actual:', err);
      });
  }, [tokens]);

  // Obtener o crear chat
  useEffect(() => {
    if (!id || !tokens?.access) return;

    const fetchChat = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chats/${id}/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const data = await res.json();
        setChatId(data.id);
      } catch (error) {
        console.error('Error obteniendo chat:', error);
      }
    };

    fetchChat();
  }, [id, tokens]);

  // Cargar mensajes
  useEffect(() => {
    if (!chatId || !tokens?.access) return;

    const cargarMensajes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/mensajes/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        const data = await res.json();
        setMensajes(data);
        setCargando(false);
      } catch (error) {
        console.error('Error cargando mensajes:', error);
      }
    };

    cargarMensajes();
    const interval = setInterval(cargarMensajes, 5000); // Refresca cada 5s
    return () => clearInterval(interval);
  }, [chatId, tokens]);

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !chatId || !tokens?.access) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chats/${chatId}/mensajes/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contenido: nuevoMensaje }),
      });

      const nuevo = await res.json();
      setMensajes(prev => [...prev, nuevo]);
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
        <Text style={styles.headerText}>Chat con trabajador ID: {id}</Text>
        {yo?.rol && (
          <Text style={{ color: '#fff', marginTop: 4 }}>Tu rol: {yo.rol}</Text>
        )}
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.chatContainer}>
        {cargando ? (
          <Text>Cargando...</Text>
        ) : (
          mensajes.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.mensaje,
                msg.remitente.id === yo?.id ? styles.mio : styles.otro,
              ]}
            >
              <Text style={{ color: msg.remitente.id === yo?.id ? 'white' : 'black' }}>
                {msg.contenido}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>

        <TextInput
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          style={styles.input}
        />
        <TouchableOpacity onPress={enviarMensaje} style={[styles.btnEnviar, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: 'white' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 12,
    backgroundColor: '#2196f3',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  mensaje: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '75%',
  },
  mio: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196f3',
  },
  otro: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    marginRight: 8,
  },
  btnEnviar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
