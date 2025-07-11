// app/historial.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text, useTheme, Divider, Badge } from 'react-native-paper';
import BaseLayout from '../components/BaseLayout';
import { useAuth } from '../context/AuthContext';

export default function HistorialScreen() {
  const { tokens } = useAuth();
  const accessToken = tokens?.access;
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState<any[]>([]);
  const theme = useTheme();

  useEffect(() => {
    if (!accessToken) return;

    const fetchPagos = async () => {
      try {
        const res = await fetch('http://192.168.0.186:8000/api/pagos/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();
        setPagos(data);
      } catch (e) {
        console.error('Error al cargar pagos:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, [accessToken]);

  const renderEstado = (estado: string) => (
    <Badge
      style={[
        styles.badge,
        {
          backgroundColor: estado === 'pagado' ? theme.colors.primary : theme.colors.error,
        },
      ]}
    >
      {estado.toUpperCase()}
    </Badge>
  );

  return (
    <BaseLayout title="Historial de Pagos" back>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator animating color={theme.colors.primary} />
        ) : pagos.length === 0 ? (
          <Text style={styles.emptyText}>No hay pagos registrados aún.</Text>
        ) : (
          <FlatList
            data={pagos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Card.Title
                  title={item.plan?.nombre || 'Plan sin nombre'}
                  subtitle={`Trabajador: ${item.trabajador?.nombre} ${item.trabajador?.apellido}`}
                />
                <Divider />
                <Card.Content style={styles.contentRow}>
                  <View style={styles.detailColumn}>
                    <Text style={styles.label}>Monto:</Text>
                    <Text style={styles.value}>${item.monto}</Text>
                  </View>
                  <View style={styles.detailColumn}>
                    <Text style={styles.label}>Fecha:</Text>
                    <Text style={styles.value}>{new Date(item.fecha).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.detailColumn}>{renderEstado(item.estado)}</View>
                </Card.Content>
              </Card>
            )}
          />
        )}
      </View>
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  detailColumn: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'center',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});
