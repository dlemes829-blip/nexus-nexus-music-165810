import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MiniPlayer } from "@/components/MiniPlayer";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { TrackCard } from "@/components/TrackCard";
import { Track, usePlayer } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";
import { getTopCharts, searchTracks } from "@/services/itunes";

export default function GenreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { genre, label } = useLocalSearchParams<{ genre: string; label: string }>();
  const { playTrack, currentTrack, toggleFavorite, isFavorite } = usePlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    const load = async () => {
      try {
        const results = genre
          ? await getTopCharts(genre, 30)
          : await searchTracks("top hits 2024", 30);
        setTracks(results);
      } catch {}
      setLoading(false);
    };
    load();
  }, [genre]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>{label ?? "Músicas"}</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <SkeletonLoader count={8} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t) => String(t.trackId)}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 160 : 140, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TrackCard
              track={item}
              showIndex={index}
              isPlaying={currentTrack?.trackId === item.trackId}
              onPress={() => playTrack(item, tracks)}
              onFavorite={() => toggleFavorite(item)}
              isFavorite={isFavorite(item.trackId)}
            />
          )}
        />
      )}

      <View style={[styles.miniPlayerWrapper, { bottom: Platform.OS === "web" ? 34 : 0 }]}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  miniPlayerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
