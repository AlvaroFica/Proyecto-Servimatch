import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Button,
  Divider,
  Provider as PaperProvider,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import paperTheme from './theme';

const API_BASE_URL = 'http://192.168.0.186:8000';

export default function AuthScreen() {
  return (
    <PaperProvider theme={paperTheme}>
      <AuthForm />
    </PaperProvider>
  );
}

function AuthForm() {
  const [isLoginScreen, setIsLoginScreen] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { setIsLoggedIn, setTokens } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const handleAction = async () => {
    if (!isLoginScreen && password !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    }

    const url = isLoginScreen
      ? `${API_BASE_URL}/api/token/`
      : `${API_BASE_URL}/api/usuarios/register/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password,
          ...(isLoginScreen ? {} : { email, confirm_password: confirmPassword }),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        return Alert.alert('Error', data.detail || 'Algo salió mal');
      }

      setIsLoggedIn(true);
      setTokens({ access: data.access, refresh: data.refresh });

      if (isLoginScreen) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('¡Registro exitoso!', 'Ahora completa tu perfil', [
          {
            text: 'OK',
            onPress: () => router.replace('/perfil/CompletarPerfilScreen'),
          },
        ]);
      }
    } catch (err) {
      console.error('Error en handleAction:', err);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Fondo ligero con tu color de marca */}
        <View style={[styles.backgroundOverlay, { backgroundColor: colors.primary + '22' }]} />

        <Surface style={[styles.card, { shadowColor: colors.primary }]}>
          <View style={styles.header}>
            {/* Logo principal */}
            <Image
              source={require('../assets/images/suitcase.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Nombre de la app */}
            <Title style={[styles.appTitle, { color: colors.primary }]}>
              ServiMatch
            </Title>

            {/* Subtítulo reforzando el propósito */}
            <Text style={[styles.appTagline, { color: colors.secondary }]}>
              Conecta con profesionales cerca de ti
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.form}>
            <TextInput
              label="Correo electrónico"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" color={colors.primary} />}
              style={styles.input}
            />
            <TextInput
              label="Contraseña"
              placeholder="●●●●●●●●"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              left={<TextInput.Icon icon="lock-outline" color={colors.primary} />}
              style={styles.input}
            />
            {!isLoginScreen && (
              <TextInput
                label="Repetir contraseña"
                placeholder="●●●●●●●●"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                left={<TextInput.Icon icon="lock-check-outline" color={colors.primary} />}
                style={styles.input}
              />
            )}

            <Button
              mode="contained"
              onPress={handleAction}
              contentStyle={styles.buttonContent}
              style={[styles.button, { backgroundColor: colors.primary }]}
              labelStyle={styles.buttonLabel}
            >
              {isLoginScreen ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLoginScreen((prev) => !prev)}
              style={styles.toggle}
              labelStyle={{ color: colors.primary }}
            >
              {isLoginScreen
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia Sesión'}
            </Button>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginHorizontal: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 16,
  },
  form: {
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  button: {
    borderRadius: 8,
    marginTop: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggle: {
    marginTop: 12,
  },
});
