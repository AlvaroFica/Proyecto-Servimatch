// app/PlanesScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Paragraph,
    Title,
    useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseLayout from '../components/BaseLayout';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://192.168.0.186:8000';

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  duracion_estimado: string;
  precio: string;
}

export default function PlanesScreen() {
  const { tokens } = useAuth();
  const { trabajadorId } = useLocalSearchParams<{ trabajadorId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  useEffect(() => {
    if (tokens?.access && trabajadorId) {
      fetchPlanes();
    }
  }, [tokens, trabajadorId]);

  const fetchPlanes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/planes/?trabajador=${trabajadorId}`,
        { headers: { Authorization: `Bearer ${tokens!.access}` } }
      );
      const data: Plan[] = await res.json();
      setPlanes(data);
      if (data.length) {
        setSelectedPlanId(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching planes:', e);
    } finally {
      setLoading(false);
    }
  };

  const renderPlan = ({ item }: { item: Plan }) => {
    const selected = item.id === selectedPlanId;
    return (
      <Card
        style={[
          styles.card,
          selected && { borderColor: theme.colors.primary, borderWidth: 2 },
        ]}
        onPress={() => setSelectedPlanId(item.id)}
      >
        <Card.Content>
          <Title style={{ color: theme.colors.onSurface }}>{item.nombre}</Title>
          <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
            {item.descripcion}
          </Paragraph>
          <View style={styles.footer}>
            <Paragraph style={{ color: theme.colors.onSurface }}>
              Duración: {item.duracion_estimado}
            </Paragraph>
            <Paragraph style={{ color: theme.colors.onSurface }}>
              Precio: ${item.precio}
            </Paragraph>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <BaseLayout title="Planes" back>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>  
          <FlatList
            data={planes}
            keyExtractor={(p) => p.id.toString()}
            renderItem={renderPlan}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 80 },
            ]}
          />
          <Button
            mode="contained"
            onPress={() => router.push(`/disponibilidad?planId=${selectedPlanId}`)}
            disabled={!selectedPlanId}
            style={[
              styles.continueButton,
              { bottom: insets.bottom + 16, backgroundColor: theme.colors.primary },
            ]}
            contentStyle={styles.buttonContent}
          >
            Continuar
          </Button>
        </View>
      )}
    </BaseLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  card: { marginBottom: 12, borderRadius: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  continueButton: {
    position: 'absolute',
    left: 24,
    right: 24,
  },
  buttonContent: { height: 48 },
});
