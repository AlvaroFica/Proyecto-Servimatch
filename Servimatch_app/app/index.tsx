
import { Checkbox } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
  ProgressBar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import paperTheme from './theme';

const API_BASE_URL = 'http://192.168.100.109:8000';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning'>('success');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { setIsLoggedIn, setTokens } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const passwordRef = React.useRef<any>(null);
  const confirmPasswordRef = React.useRef<any>(null);

  const showModal = (
    type: 'success' | 'error' | 'warning',
    msg: string
  ) => {
    setModalType(type);
    setModalMessage(msg);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const handleAction = async () => {
    // 1) Revisar campos vacíos
    if (!email.trim()) {
      showModal('warning', 'Falta el campo correo electrónico');
      return;
    }
    if (!password.trim()) {
      showModal('warning', 'Falta el campo contraseña');
      return;
    }
    if (!isLoginScreen && !confirmPassword.trim()) {
      showModal('warning', 'Falta repetir la contraseña');
      return;
    }
    // 2) Validar confirmación de contraseña
    if (!isLoginScreen && password !== confirmPassword) {
      showModal('error', 'Las contraseñas no coinciden');
      return;
    }
    if (!isLoginScreen && !acceptedTerms) {
      showModal('warning', 'Debes aceptar las Políticas de Privacidad');
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
          ...(isLoginScreen
            ? {}
            : { email, confirm_password: confirmPassword }),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        showModal('error', 'Credencial inválida, inténtelo nuevamente');
        return;
      }

      // Éxito
      showModal(
        'success',
        isLoginScreen
          ? '¡Inicio de sesión exitoso!'
          : 'Tu cuenta ha sido creada correctamente'
      );

      setIsLoggedIn(true);
      setTokens({ access: data.access, refresh: data.refresh });

      // Navegar tras cerrar modal
      setTimeout(() => {
        if (isLoginScreen) {
          router.replace('/(tabs)');
        } else {
          router.replace('/perfil/CompletarPerfilScreen');
        }
      }, 2100);
    } catch (err) {
      console.error(err);
      showModal('error', 'Credencial inválida, inténtelo nuevamente');
    }
  };

  // 2️⃣ Calcula progreso
  const totalFields = isLoginScreen ? 2 : 3;
  const filledFields =
    (!!email.trim() ? 1 : 0) +
    (!!password.trim() ? 1 : 0) +
    (!isLoginScreen && !!confirmPassword.trim() ? 1 : 0);

  // Color dinámico según tipo
  const modalColor =
    modalType === 'success'
      ? colors.primary ?? 'green'
      : modalType === 'error'
        ? colors.error ?? 'red'
        : 'orange';

  const iconName =
    modalType === 'success'
      ? 'check-circle'
      : modalType === 'error'
        ? 'close-circle'
        : 'alert-circle';

  return (
    <>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Surface
            style={[
              styles.modalCard,
              { borderColor: modalColor },
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={48}
              color={modalColor}
              style={{ marginBottom: 8 }}
            />
            <Text
              style={[
                styles.modalText,
                { color: modalColor },
              ]}
            >
              {modalMessage}
            </Text>
          </Surface>
        </View>
      </Modal>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View
            style={[
              styles.backgroundOverlay,
              { backgroundColor: colors.primary + '22' },
            ]}
          />
          <Surface style={[styles.card, { shadowColor: colors.primary }]}>
            <View style={styles.header}>
              <Image
                source={require('../assets/images/suitcase.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Title style={[styles.appTitle, { color: colors.primary }]}>
                ServiMatch
              </Title>
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
                left={
                  <TextInput.Icon
                    icon="email-outline"
                    color={colors.primary}
                  />
                }
                style={styles.input}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <TextInput
                ref={passwordRef}
                label="Contraseña"
                placeholder="******"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                left={
                  <TextInput.Icon
                    icon="lock-outline"
                    color={colors.primary}
                  />
                }
                style={styles.input}
                returnKeyType={isLoginScreen ? 'done' : 'next'}
                onSubmitEditing={() =>
                  isLoginScreen
                    ? handleAction()
                    : confirmPasswordRef.current?.focus()
                }
              />
              {!isLoginScreen && (
                <TextInput
                  ref={confirmPasswordRef}
                  label="Repetir contraseña"
                  placeholder="●●●●●●●●"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  mode="outlined"
                  left={
                    <TextInput.Icon
                      icon="lock-check-outline"
                      color={colors.primary}
                    />
                  }
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={handleAction}
                />
              )}
              {/* 3️⃣ Indicador de progreso solo en registro */}
              {!isLoginScreen && (
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={filledFields / totalFields}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    Campos completados: {filledFields} / {totalFields}
                  </Text>
                </View>
              )}
              {!isLoginScreen && (
                <View style={styles.termsContainer}>
                  <Checkbox.Android
                    status={acceptedTerms ? 'checked' : 'unchecked'}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    color={colors.primary}
                  />
                  <Text style={styles.termsText}>
                    Acepto las{' '}
                    <Text
                      style={{ color: colors.primary }}
                      onPress={() => router.push('/configuracion/PoliticasPrivacidad')}
                    >
                      Políticas de Privacidad
                    </Text>
                  </Text>
                </View>
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
                onPress={() => setIsLoginScreen((v) => !v)}
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
  buttonContent: { paddingVertical: 12 },
  button: { borderRadius: 8, marginTop: 12 },
  buttonLabel: { fontSize: 16, fontWeight: '600' },
  toggle: { marginTop: 12 },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'right',
    color: '#444',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
});
