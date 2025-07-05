// ranking_alternate.tsx

import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Avatar, Divider } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = 'https://Recnok.pythonanywhere.com';

interface Profesion {
  id: number;
  nombre: string;
}

interface Worker {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil?: string;
  profesion: string;
  rating: number;
  servicios: number[];
}

// Dimensiones para las tarjetas Top 3
const TOP_CARD_WIDTH = SCREEN_WIDTH * 0.3;
const TOP_CARD_HEIGHT = 220;

// Componente para pintar estrellas según rating
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const filledStars = Math.floor(rating);
  return (
    <View style={styles.starsContainer}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < filledStars) {
          return (
            <Text key={i} style={styles.starFilled}>
              ★
            </Text>
          );
        } else {
          return (
            <Text key={i} style={styles.starEmpty}>
              ☆
            </Text>
          );
        }
      })}
    </View>
  );
};

const RankingScreen: React.FC = () => {
  const [profesiones, setProfesiones] = useState<Profesion[]>([]);
  const [selectedProfesion, setSelectedProfesion] = useState<string | undefined>(undefined);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Animación fade-in/fade-out al filtrar
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 1) Cargar profesiones para el Picker
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profesiones/`)
      .then(res => res.json())
      .then((data: Profesion[]) => setProfesiones(data))
      .catch(err => console.error(err));
  }, []);

  // 2) Cargar ranking completo y aplicar filtro con animación
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/trabajadores/ranking/`)
      .then(res => res.json())
      .then((data: Worker[]) => {
        const applyFilter = () => {
          if (selectedProfesion) {
            const filtrados = data.filter(w => w.profesion === selectedProfesion);
            setWorkers(filtrados);
          } else {
            setWorkers(data);
          }
          setLoading(false);
          // Fade-in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        };

        // Fade-out y luego filtro
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => applyFilter());
      })
      .catch(err => console.error(err));
  }, [selectedProfesion]);

  // 3) Dividir en Top 3 y Siguientes 7 (rellenar con null si faltan)
  const getTopAndNext = (list: Worker[]) => {
    const top3: (Worker | null)[] = list.slice(0, 3);
    const next7: (Worker | null)[] = list.slice(3, 10);
    while (top3.length < 3) top3.push(null);
    while (next7.length < 7) next7.push(null);
    return { top3, next7 };
  };
  const { top3, next7 } = getTopAndNext(workers);

  // 4) Render Top 3
  const renderTopItem = (item: Worker | null, index: number) => {
    if (!item) {
      // Placeholder “Vacante”
      return (
        <View style={styles.topPlaceholder} key={`top-placeholder-${index}`}>
          <Text style={styles.placeholderText}>Vacante</Text>
        </View>
      );
    }
    // Colores de borde según posición
    const borderColors = ['#F59E0B', '#6B7280', '#D97706']; // dorado, gris, bronce
    return (
      <View
        style={[
          styles.topCard,
          {
            borderColor: borderColors[index],
            shadowOpacity: 0.1 + (3 - index) * 0.05, // sombra según posición
            backgroundColor:
              item.rating >= 4.5
                ? '#ECFDF5'
                : item.rating < 3.0
                ? '#FEF3F2'
                : '#FFFFFF',
          },
        ]}
        key={`top-${item.id}`}
      >
        {/* Sticker de medalla */}
        <View style={[styles.medalBadge, { backgroundColor: borderColors[index] }]}>
          <Text style={styles.medalText}>{index + 1}</Text>
        </View>
        <View style={styles.topCardContent}>
          {item.foto_perfil ? (
            <Avatar.Image
              size={64}
              source={{ uri: item.foto_perfil }}
              style={styles.topAvatar}
            />
          ) : (
            <Avatar.Icon size={64} icon="account" style={styles.topAvatar} />
          )}
          <Text style={styles.topNameText} numberOfLines={1} ellipsizeMode="tail">
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.topProfessionText} numberOfLines={1} ellipsizeMode="tail">
            {item.profesion}
          </Text>
          <StarRating rating={item.rating} />
        </View>
      </View>
    );
  };

  // 5) Render Siguientes 7 (listas de filas)
  const renderListItem = ({ item, index }: { item: Worker | null; index: number }) => {
    if (!item) {
      // Placeholder “Vacante”
      return (
        <View style={[styles.listRow, styles.placeholderRow]} key={`list-ph-${index}`}>
          <Text style={styles.placeholderText}>Vacante</Text>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.listRow,
          {
            backgroundColor:
              item.rating >= 4.5
                ? '#ECFDF5'
                : item.rating < 3.0
                ? '#FEF3F2'
                : '#FFFFFF',
            shadowOpacity: 0.05 + (7 - index) * 0.01, // sombra según posición
          },
        ]}
        key={`list-${item.id}`}
      >
        {item.foto_perfil ? (
          <Avatar.Image
            size={48}
            source={{ uri: item.foto_perfil }}
            style={styles.listAvatar}
          />
        ) : (
          <Avatar.Icon size={48} icon="account" style={styles.listAvatar} />
        )}
        <View style={styles.listTextBlock}>
          <Text style={styles.listNameText} numberOfLines={1} ellipsizeMode="tail">
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.listProfessionText} numberOfLines={1} ellipsizeMode="tail">
            {item.profesion}
          </Text>
        </View>
        <StarRating rating={item.rating} />
      </View>
    );
  };

  // 6) Mostrar loader mientras carga
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Título general */}
      <Text style={styles.mainTitle}>Ranking</Text>

      {/* Picker de Profesión */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedProfesion}
          onValueChange={(value: string) => setSelectedProfesion(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Todas las profesiones" value={undefined} />
          {profesiones.map((p: Profesion) => (
            <Picker.Item key={p.id} label={p.nombre} value={p.nombre} />
          ))}
        </Picker>
      </View>

      {/* Top 3 Destacados */}
      <Text style={styles.sectionTitle}>Top 3 Destacados</Text>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <View style={styles.topContainer}>
          {top3.map((item, idx) => renderTopItem(item, idx))}
        </View>

        <Divider style={styles.divider} />

        {/* Siguientes 7 */}
        <Text style={styles.sectionTitle}>Siguientes 7</Text>
        <FlatList
          data={next7}
          keyExtractor={(item, index) =>
            item ? `list-${item.id}` : `list-ph-${index}`
          }
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Título general
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  // Picker
  pickerContainer: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d0d3db',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 1,
  },
  picker: {
    height: 48,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
  },

  // Secciones
  sectionTitle: {
    fontSize: 22,
    marginHorizontal: 16,
    marginVertical: 12,
    fontWeight: '700',
    color: '#333',
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: '#e0e0e0',
    height: 1,
  },

  // Contenedor animado con flex:1 para que FlatList pueda scrollear
  animatedContainer: {
    flex: 1,
  },

  // === Top 3 Destacados ===
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  topCard: {
    width: TOP_CARD_WIDTH,
    height: TOP_CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    position: 'relative',
  },
  topCardContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  topAvatar: {
    marginBottom: 12,
    backgroundColor: '#e6eaf2',
  },
  topNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  topProfessionText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },

  // Sticker medalla
  medalBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Placeholder Top
  topPlaceholder: {
    width: TOP_CARD_WIDTH,
    height: TOP_CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Placeholder texto
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  // === Siguientes 7 ===
  listContainer: {
    paddingBottom: 100, // espacio extra para que no queden ocultos por la tab
    paddingHorizontal: 16,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 84,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  listAvatar: {
    marginRight: 12,
    backgroundColor: '#e6eaf2',
  },
  listTextBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  listNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  listProfessionText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholderRow: {
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },

  // Estrellas
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  starFilled: {
    fontSize: 18,
    color: '#FBBF24',
    marginHorizontal: 2,
  },
  starEmpty: {
    fontSize: 18,
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
});

export default RankingScreen;
