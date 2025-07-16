import { Checkbox } from 'react-native-paper';
import { TouchableWithoutFeedback, Keyboard, Platform, View, StyleSheet, Image, KeyboardAvoidingView, Modal } from 'react-native';
import React, { useState, useRef } from 'react';
import {
  Button,
  Divider,
  Provider as PaperProvider,
  Surface,
  Text,
  TextInput,
  Title,
  useTheme,
  ProgressBar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import paperTheme from './theme';

const API_BASE_URL = 'http://192.168.100.4:8000';

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn, setTokens } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');

  const showModal = (type: 'success' | 'error' | 'warning', msg: string) => {
    setModalType(type);
    setModalMessage(msg);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const validatePassword = (p: string): string => {
    const errors = [];
    if (p.length < 8) errors.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(p)) errors.push('una mayúscula');
    if (!/[a-z]/.test(p)) errors.push('una minúscula');
    if (!/\d/.test(p)) errors.push('un número');
    if (!/[@$!%*#?&\-_]/.test(p)) errors.push('un símbolo especial');
    return errors.length > 0 ? `Debe incluir ${errors.join(', ')}` : '';
  };

  const validateEmail = (email: string): string => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email) ? '' : 'Correo inválido (ej: usuario@ejemplo.com)';
  };

  const translateError = (msg: string): string => {
    if (msg.includes('No active account')) return 'Credenciales inválidas';
    if (msg.includes('user with this email already exists')) return 'El correo ya está registrado';
    if (msg.includes('password')) return 'Contraseña inválida';
    return msg;
  };

  const handleAction = async () => {
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    if (!email || !password || (!isLoginScreen && !confirmPassword)) {
      showModal('warning', 'Completa todos los campos');
      return;
    }

    if (!isLoginScreen && password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      return;
    }

    if (!isLoginScreen && !acceptedTerms) {
      showModal('warning', 'Debes aceptar las Políticas de Privacidad');
      return;
    }

    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    const passValidation = validatePassword(password);
    if (passValidation) {
      setPasswordError(passValidation);
      return;
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
        showModal('error', translateError(data.detail || 'Error desconocido'));
        return;
      }

      showModal('success', isLoginScreen ? 'Inicio de sesión exitoso' : 'Registro completado');
      setIsLoggedIn(true);
      setTokens({ access: data.access, refresh: data.refresh });

      setTimeout(() => {
        if (isLoginScreen) {
          router.replace('/(tabs)');
        } else {
          router.replace('/perfil/CompletarPerfilScreen');
        }
      }, 2100);
    } catch (err) {
      console.error(err);
      showModal('error', 'No se pudo conectar al servidor');
    }
  };

  const totalFields = isLoginScreen ? 2 : 3;
  const filledFields =
    (!!email.trim() ? 1 : 0) +
    (!!password.trim() ? 1 : 0) +
    (!isLoginScreen && !!confirmPassword.trim() ? 1 : 0);

  const modalColor =
    modalType === 'success' ? colors.primary :
    modalType === 'error' ? colors.error :
    'orange';

  const iconName =
    modalType === 'success' ? 'check-circle' :
    modalType === 'error' ? 'close-circle' :
    'alert-circle';

  return (
    <>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Surface style={[styles.modalCard, { borderColor: modalColor }]}>
            <MaterialCommunityIcons name={iconName} size={48} color={modalColor} />
            <Text style={[styles.modalText, { color: modalColor }]}>{modalMessage}</Text>
          </Surface>
        </View>
      </Modal>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={[styles.backgroundOverlay, { backgroundColor: colors.primary + '22' }]} />
          <Surface style={[styles.card, { shadowColor: colors.primary }]}>
            <View style={styles.header}>
              <Image
                source={require('../assets/images/suitcase.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Title style={[styles.appTitle, { color: colors.primary }]}>ServiMatch</Title>
              <Text style={[styles.appTagline, { color: colors.secondary }]}>
                Conecta con profesionales cerca de ti
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.form}>
              <TextInput
                label="Correo electrónico"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setEmailError(validateEmail(t));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                placeholder="usuario@ejemplo.com"
                left={<TextInput.Icon icon="email-outline" />}
                style={styles.input}
              />
              {emailError ? <Text style={{ color: 'red' }}>{emailError}</Text> : null}

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setPasswordError(validatePassword(t));
                }}
                secureTextEntry={!showPassword}
                mode="outlined"
                placeholder="Ej: Servi123@"
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
                style={styles.input}
              />
              {!isLoginScreen && passwordError ? <Text style={{ color: 'red' }}>{passwordError}</Text> : null}

              {!isLoginScreen && (
                <>
                  <TextInput
                    label="Repetir contraseña"
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      setConfirmError(t !== password ? 'Las contraseñas no coinciden' : '');
                    }}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    placeholder="Repetir contraseña"
                    left={<TextInput.Icon icon="lock-check-outline" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword((v) => !v)}
                      />
                    }
                    style={styles.input}
                  />
                  {confirmError ? <Text style={{ color: 'red' }}>{confirmError}</Text> : null}

                  <View style={{ marginTop: 8 }}>
                    <ProgressBar progress={filledFields / totalFields} style={styles.progressBar} />
                    <Text style={styles.progressText}>
                      Campos completados: {filledFields} / {totalFields}
                    </Text>
                  </View>

                  <View style={styles.termsContainer}>
                    <Checkbox.Android
                      status={acceptedTerms ? 'checked' : 'unchecked'}
                      onPress={() => setAcceptedTerms(!acceptedTerms)}
                      color={colors.primary}
                    />
                    <Text style={styles.termsText}>
                      Acepto las{' '}
                      <Text style={{ color: colors.primary }} onPress={() => router.push('/configuracion/PoliticasPrivacidad')}>
                        Políticas de Privacidad
                      </Text>
                    </Text>
                  </View>
                </>
              )}

              <Button mode="contained" onPress={handleAction} style={styles.button}>
                {isLoginScreen ? 'Iniciar Sesión' : 'Registrarse'}
              </Button>

              <Button mode="text" onPress={() => setIsLoginScreen((v) => !v)} style={styles.toggle}>
                {isLoginScreen ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
              </Button>
            </View>
          </Surface>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    minWidth: 220,
    alignItems: 'center',
    elevation: 10,
  },
  modalText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    marginHorizontal: 8,
  },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 120, height: 120, marginBottom: 8 },
  appTitle: { fontSize: 32, fontWeight: '700', textAlign: 'center' },
  appTagline: { fontSize: 14, fontStyle: 'italic', textAlign: 'center' },
  divider: { marginVertical: 16 },
  form: { marginTop: 4 },
  input: { marginBottom: 12 },
  button: { borderRadius: 8, marginTop: 12 },
  toggle: { marginTop: 12 },
  progressBar: { height: 8, borderRadius: 4 },
  progressText: { fontSize: 12, textAlign: 'right', color: '#444', marginTop: 4 },
  termsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  termsText: { fontSize: 14, flex: 1, flexWrap: 'wrap' },
});
