import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Avatar, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const getFullImageUrl = (ruta: string | undefined): string => {
  if (!ruta) return 'https://via.placeholder.com/100';
  return ruta.startsWith('http') ? ruta : `${API_BASE_URL}${ruta}`;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.61:8000';

interface Profesion {
  id: number;
  nombre: string;
}

interface Worker {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil?: string;
  profesion: number;
  profesion_nombre: string;
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

export default function RankingScreen() {
  const router = useRouter();
  const [profesiones, setProfesiones] = useState<Profesion[]>([]);
  const [selectedProfesion, setSelectedProfesion] = useState<number | undefined>();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profesiones/`)
      .then(res => res.json())
      .then(setProfesiones)
      .catch(console.error);
  }, []);


  useEffect(() => {
    setLoading(true);

    const url = selectedProfesion
      ? `${API_BASE_URL}/api/ranking/trabajadores/?profesion=${selectedProfesion}`
      : `${API_BASE_URL}/api/ranking/trabajadores/`;

    console.log('Cargando ranking para profesion:', selectedProfesion); // TEMPORAL PARA DEPURAR

    fetch(url)
      .then(res => res.json())
      .then((data: Worker[]) => {
        const applyFilter = () => {
          setWorkers(data); // ya viene filtrado desde backend
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
      .catch(error => {
        console.error('Error al cargar ranking:', error);
        setLoading(false);
      });
  }, [selectedProfesion]);


  const getTopAndNext = (list: Worker[]) => {
    const top3: (Worker | null)[] = list.slice(0, 3);
    const next7: (Worker | null)[] = list.slice(3, 10);
    while (top3.length < 3) top3.push(null);
    while (next7.length < 7) next7.push(null);
    return { top3, next7 };
  };

  const { top3, next7 } = getTopAndNext(workers);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ranking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedProfesion}
            onValueChange={(value: string | number) => {
              const parsed = Number(value);
              setSelectedProfesion(isNaN(parsed) ? undefined : parsed);
            }}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Todas las profesiones" value={undefined} />
            {profesiones.map(p => (
              <Picker.Item key={p.id} label={p.nombre} value={p.id} />
            ))}
          </Picker>
        </View>



        <Text style={styles.sectionTitle}>Top 3 Destacados</Text>
        <View style={styles.topContainer}>
          {top3.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => item && router.push(`/perfil/${item.id}`)}
              disabled={!item}
              style={[
                styles.topCard,
                {
                  borderColor: ['#F59E0B', '#6B7280', '#D97706'][index],
                  backgroundColor: item
                    ? item.rating >= 4.5
                      ? '#ECFDF5'
                      : item.rating < 3.0
                      ? '#FEF3F2'
                      : '#fff'
                    : '#f3f4f6',
                },
              ]}
            >
              {item ? (
                <>
                  <View
                    style={[
                      styles.medalBadge,
                      { backgroundColor: ['#F59E0B', '#6B7280', '#D97706'][index] },
                    ]}
                  >
                    <Text style={styles.medalText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topCardContent}>
                    <Avatar.Image size={48} source={{ uri: getFullImageUrl(item?.foto_perfil) }} />
                    <Text style={styles.topNameText}>{item.nombre} {item.apellido}</Text>
                    <Text style={styles.topProfessionText}>{item.profesion_nombre}</Text>
                    <StarRating rating={item.rating} />
                  </View>
                </>
              ) : (
                <View style={styles.vacanteCard}>
                  <Text style={styles.placeholderText}>Vacante</Text>
                </View>
              )}
            </TouchableOpacity>

          ))}
        </View>

        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Siguientes 7</Text>
        {next7.map((item, index) => (
          item ? (
            <TouchableOpacity
              key={index}
              onPress={() => item && router.push(`/perfil/${item.id}`)}
              disabled={!item}
              style={[
                styles.listRow,
                {
                  backgroundColor: item
                    ? item.rating >= 4.5
                      ? '#ECFDF5'
                      : item.rating < 3.0
                      ? '#FEF3F2'
                      : '#fff'
                    : '#f3f4f6',
                },
              ]}
            >
              {item ? (
                <>
                  <Avatar.Image size={40} source={{ uri: getFullImageUrl(item?.foto_perfil) }} />
                  <View style={styles.listTextBlock}>
                    <Text style={styles.listNameText}>{item.nombre} {item.apellido}</Text>
                    <Text style={styles.listProfessionText}>{item.profesion_nombre}</Text>
                  </View>
                  <StarRating rating={item.rating} />
                </>
              ) : (
                <Text style={styles.placeholderText}>Vacante</Text>
              )}
            </TouchableOpacity>

          ) : (
            <View style={styles.vacanteCardList} key={index}>
              <Text style={styles.placeholderText}>Vacante</Text>
            </View>
          )
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00696E',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginVertical: 8,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topCard: {
    width: TOP_CARD_WIDTH,
    height: TOP_CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCardContent: {
    alignItems: 'center',
  },
  topNameText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  topProfessionText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  medalBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  vacanteCard: {
    width: TOP_CARD_WIDTH,
    height: TOP_CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacanteCardList: {
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  listTextBlock: {
    flex: 1,
    marginLeft: 10,
  },
  listNameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listProfessionText: {
    fontSize: 11,
    color: '#6B7280',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  starFilled: {
    fontSize: 14,
    color: '#FBBF24',
  },
  starEmpty: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
