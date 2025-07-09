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
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.100.9:8000';

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

const TOP_CARD_WIDTH = SCREEN_WIDTH * 0.26;
const TOP_CARD_HEIGHT = 160;

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const filledStars = Math.floor(rating);
  return (
    <View style={styles.starsContainer}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={i < filledStars ? styles.starFilled : styles.starEmpty}>
          {i < filledStars ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
};

const RankingScreen: React.FC = () => {
  const router = useRouter();

  const [profesiones, setProfesiones] = useState<Profesion[]>([]);
  const [selectedProfesion, setSelectedProfesion] = useState<string | undefined>(undefined);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profesiones/`)
      .then(res => res.json())
      .then((data: Profesion[]) => setProfesiones(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/ranking/trabajadores/`)
      .then(res => res.json())
      .then((data: Worker[]) => {
        const applyFilter = () => {
          if (selectedProfesion) {
            setWorkers(data.filter(w => w.profesion === selectedProfesion));
          } else {
            setWorkers(data);
          }
          setLoading(false);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        };

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => applyFilter());
      })
      .catch(err => console.error(err));
  }, [selectedProfesion]);

  const getTopAndNext = (list: Worker[]) => {
    const top3: (Worker | null)[] = list.slice(0, 3);
    const next7: (Worker | null)[] = list.slice(3, 10);
    while (top3.length < 3) top3.push(null);
    while (next7.length < 7) next7.push(null);
    return { top3, next7 };
  };

  const { top3, next7 } = getTopAndNext(workers);

  const renderTopItem = (item: Worker | null, index: number) => {
    const borderColors = ['#F59E0B', '#6B7280', '#D97706'];
    if (!item) {
      return (
        <View style={styles.topPlaceholder} key={`top-placeholder-${index}`}>
          <Text style={styles.placeholderText}>Vacante</Text>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.topCard,
          {
            borderColor: borderColors[index],
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
        <View style={[styles.medalBadge, { backgroundColor: borderColors[index] }]}>
          <Text style={styles.medalText}>{index + 1}</Text>
        </View>
        <View style={styles.topCardContent}>
          {item.foto_perfil ? (
            <Avatar.Image size={64} source={{ uri: item.foto_perfil }} style={styles.topAvatar} />
          ) : (
            <Avatar.Icon size={64} icon="account" style={styles.topAvatar} />
          )}
          <Text style={styles.topNameText} numberOfLines={1}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.topProfessionText} numberOfLines={1}>
            {item.profesion}
          </Text>
          <StarRating rating={item.rating} />
        </View>
      </View>
    );
  };

  const renderListItem = ({ item, index }: { item: Worker | null; index: number }) => {
    if (!item) {
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
          },
        ]}
        key={`list-${item.id}`}
      >
        {item.foto_perfil ? (
          <Avatar.Image size={48} source={{ uri: item.foto_perfil }} style={styles.listAvatar} />
        ) : (
          <Avatar.Icon size={48} icon="account" style={styles.listAvatar} />
        )}
        <View style={styles.listTextBlock}>
          <Text style={styles.listNameText} numberOfLines={1}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.listProfessionText} numberOfLines={1}>
            {item.profesion}
          </Text>
        </View>
        <StarRating rating={item.rating} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado tipo notificaciones */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ranking</Text>
      </View>

      {/* Selector de profesiones */}
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

      <Text style={styles.sectionTitle}>Top 3 Destacados</Text>

      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        <View style={styles.topContainer}>
          {top3.map((item, idx) => renderTopItem(item, idx))}
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Siguientes 7</Text>

        <FlatList
          data={next7}
          keyExtractor={(item, index) => (item ? `list-${item.id}` : `list-ph-${index}`)}
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
    backgroundColor: '#f9fafb',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  pickerContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 40,
    width: '100%',
  },
  pickerItem: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 14,
    backgroundColor: '#e5e7eb',
    height: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 14,
    marginBottom: 16,
  },
  topCard: {
    width: TOP_CARD_WIDTH,
    height: TOP_CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
  },
  topCardContent: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 6,
  },
  topAvatar: {
    marginBottom: 8,
    backgroundColor: '#e5e7eb',
  },
  topNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  topProfessionText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  medalBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  topPlaceholder: {
    width: TOP_CARD_WIDTH,
    height: TOP_CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 80,
    paddingHorizontal: 14,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listAvatar: {
    marginRight: 10,
    backgroundColor: '#e5e7eb',
  },
  listTextBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  listNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  listProfessionText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  placeholderRow: {
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  starFilled: {
    fontSize: 14,
    color: '#FBBF24',
    marginHorizontal: 1,
  },
  starEmpty: {
    fontSize: 14,
    color: '#D1D5DB',
    marginHorizontal: 1,
  },
});

export default RankingScreen;
