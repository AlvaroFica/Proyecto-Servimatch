// app/mis-pagos.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Image } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Paragraph,
  Title,
  useTheme,
  Text,
  Appbar,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'http://192.168.100.4:8000';

interface Pago {
  id: number;
  plan: { nombre: string };
  trabajador: { nombre: string; apellido: string };
  monto: string;
  estado: string;
  fecha: string;
}

export default function MisPagosScreen() {
  const { tokens } = useAuth();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    if (!tokens?.access) return;

    const fetchPagos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pagos/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });

        const data = await res.json();
        if (res.ok) {
          setPagos(data);
        } else {
          console.error('Error al cargar pagos:', data);
        }
      } catch (err) {
        console.error('Error de red:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, [tokens]);

  const totalGastado = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0);
  const ultimoPago = pagos.length > 0
    ? pagos.reduce((a, b) => (new Date(a.fecha) > new Date(b.fecha) ? a : b))
    : null;

  const servicioMasFrecuente = (() => {
    const frecuencia: { [nombre: string]: number } = {};
    pagos.forEach(p => {
      const nombre = p.plan.nombre;
      frecuencia[nombre] = (frecuencia[nombre] || 0) + 1;
    });
    const entradas = Object.entries(frecuencia);
    if (entradas.length === 0) return null;
    return entradas.sort((a, b) => b[1] - a[1])[0][0];
  })();

  const renderPago = ({ item }: { item: Pago }) => (
    <Card style={styles.card} elevation={3}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.left}>
          <Image
            source={require('../assets/images/success-check.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.right}>
          <Title style={styles.planNombre}>{item.plan.nombre}</Title>
          <Paragraph style={styles.text}>
            <Text style={styles.label}>Trabajador: </Text>
            {item.trabajador.nombre} {item.trabajador.apellido}
          </Paragraph>
          <Paragraph style={styles.text}>
            <Text style={styles.label}>Monto: </Text>
            ${parseInt(item.monto).toLocaleString('es-CL')}
          </Paragraph>
          <Paragraph style={styles.text}>
            <Text style={styles.label}>Estado: </Text>
            <Text style={styles.estado}>{item.estado}</Text>
          </Paragraph>
          <Paragraph style={styles.text}>
            <Text style={styles.label}>Fecha: </Text>
            {new Date(item.fecha).toLocaleDateString()}
          </Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ✅ Header con SafeArea y color personalizado */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Header style={{ backgroundColor: theme.colors.primary, elevation: 0 }}>
          <Appbar.Content title="Mis pagos" titleStyle={{ color: 'white' }} />
        </Appbar.Header>
      </SafeAreaView>

      {/* Encabezado informativo */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/images/wallet.png')} style={styles.headerIcon} />
        <Title style={styles.headerTitle}>Mis pagos realizados</Title>
        <Paragraph style={styles.headerSubtitle}>
          Aquí puedes revisar todos los pagos que has hecho en ServiMatch.
        </Paragraph>

        {pagos.length > 0 && (
          <View style={styles.resumenBox}>
            <Text style={styles.resumenItem}>
              Servicios pagados: <Text style={styles.bold}>{pagos.length}</Text>
            </Text>
            <Text style={styles.resumenItem}>
              Total gastado:{' '}
              <Text style={styles.bold}>
                ${totalGastado.toLocaleString('es-CL')}
              </Text>
            </Text>
            {ultimoPago && (
              <Text style={styles.resumenItem}>
                Último pago:{' '}
                <Text style={styles.bold}>
                  {new Date(ultimoPago.fecha).toLocaleDateString()}
                </Text>
              </Text>
            )}
            {servicioMasFrecuente && (
              <Text style={styles.resumenItem}>
                Servicio favorito:{' '}
                <Text style={styles.bold}>{servicioMasFrecuente}</Text>
              </Text>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pagos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPago}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          ListEmptyComponent={
            <Paragraph style={{ textAlign: 'center', marginTop: 40 }}>
              Aún no has realizado pagos. ¡Cuando lo hagas, aparecerán aquí!
            </Paragraph>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  left: {
    marginRight: 16,
  },
  icon: {
    width: 48,
    height: 48,
    tintColor: '#4caf50',
  },
  right: {
    flex: 1,
  },
  planNombre: {
    fontSize: 18,
    marginBottom: 6,
    color: '#2e7d32',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  text: {
    fontSize: 14,
    marginBottom: 2,
  },
  estado: {
    textTransform: 'capitalize',
    color: '#388e3c',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 8,
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  resumenBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  resumenItem: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});
