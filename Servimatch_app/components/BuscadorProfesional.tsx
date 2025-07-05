import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Surface, Text, TextInput, Title, List } from 'react-native-paper';

interface Profesion {
  id: number;
  nombre: string;
}

interface Props {
  query: string;
  setQuery: (text: string) => void;
  suggestions: Profesion[];
  setSelectedId: (id: number | null) => void;
  buscar: () => void;
  theme: any;
}

export default function BuscadorProfesional({
  query,
  setQuery,
  suggestions,
  setSelectedId,
  buscar,
  theme,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Surface style={[styles.searchCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.searchHeader}>
          <Title style={[styles.searchTitle, { color: theme.colors.primary }]}>Busca un profesional</Title>
          <Text style={[styles.searchSubtitle, { color: theme.colors.onSurface }]}>Escribe la profesión o palabra clave</Text>
        </View>

        <TextInput
          mode="outlined"
          placeholder="Ej: Electricista, Plomero..."
          value={query}
          onChangeText={text => {
            setQuery(text);
            setSelectedId(null);
          }}
          onSubmitEditing={buscar}
          style={[styles.searchInput, { backgroundColor: theme.colors.background }]}
          right={<TextInput.Icon icon="magnify" onPress={buscar} color={theme.colors.primary} />}
        />

        {suggestions.length > 0 && (
          <Surface style={[styles.suggestionsCard, { backgroundColor: theme.colors.surface }]}>
            {suggestions.map(p => (
              <List.Item
                key={p.id}
                title={p.nombre}
                onPress={() => {
                  setQuery(p.nombre);
                  setSelectedId(p.id);
                }}
                left={props => <List.Icon {...props} icon="briefcase-search" />}
                style={styles.suggestionItem}
              />
            ))}
          </Surface>
        )}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.select({ ios: 100, android: 50 }),
    left: 12,
    right: 12,
    zIndex: 15,
  },
  searchCard: {
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    elevation: 4,
  },
  searchHeader: {
    marginBottom: 4,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchSubtitle: {
    fontSize: 11,
    marginTop: 0,
    fontStyle: 'italic',
  },
  searchInput: {
    height: 38,
    fontSize: 13,
  },
  suggestionsCard: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 6,
  },
});
