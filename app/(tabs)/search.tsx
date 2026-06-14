import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MiniPlayer } from "@/components/MiniPlayer";
import { TrackCard } from "@/components/TrackCard";
import { Track, usePlayer } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";
import { searchTracks } from "@/services/itunes";

const SUGGESTIONS = [
  "Taylor Swift", "Drake", "The Weeknd", "Billie Eilish",
  "Bad Bunny", "Post Malone", "Doja Cat", "Ed Sheeran",
  "Ariana Grande", "Kendrick Lamar",
];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { playTrack, currentTrack, toggleFavorite, isFavorite } = usePlayer();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const tracks = await searchTracks(q, 25);
      setResults(tracks);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const handleSuggestion = (s: string) => {
    setQuery(s);
    doSearch(s);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Pesquisar</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Artistas, músicas, álbuns..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setHasSearched(false); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !hasSearched ? (
        <View style={styles.suggestions}>
          <Text style={[styles.suggestTitle, { color: colors.mutedForeground }]}>Sugestões</Text>
          <View style={styles.chipGrid}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                onPress={() => handleSuggestion(s)}
              >
                <Text style={[styles.chipText, { color: colors.foreground }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="search" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Nenhum resultado para "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(t) => String(t.trackId)}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 160 : 140, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TrackCard
              track={item}
              isPlaying={currentTrack?.trackId === item.trackId}
              onPress={() => playTrack(item, results)}
              onFavorite={() => toggleFavorite(item)}
              isFavorite={isFavorite(item.trackId)}
            />
          )}
        />
      )}

      <View style={[styles.miniPlayerWrapper, { bottom: Platform.OS === "web" ? 84 + 34 : 84 }]}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  suggestions: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  suggestTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  miniPlayerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
