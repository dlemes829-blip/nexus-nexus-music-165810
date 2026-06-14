import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GenreCard } from "@/components/GenreCard";
import { MiniPlayer } from "@/components/MiniPlayer";
import { NexusLogo } from "@/components/NexusLogo";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { TrackCard } from "@/components/TrackCard";
import { Track, usePlayer } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";
import {
  getFeaturedPlaylists,
  getTopCharts,
  searchTracks,
} from "@/services/itunes";

const GENRES = [
  { genre: "pop", label: "Pop" },
  { genre: "hiphop", label: "Hip-Hop" },
  { genre: "electronic", label: "Electronic" },
  { genre: "rb", label: "R&B" },
  { genre: "rock", label: "Rock" },
  { genre: "latin", label: "Latin" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { playTrack, currentTrack, isFavorite, toggleFavorite } = usePlayer();
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [newTracks, setNewTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const load = async () => {
    try {
      const [top, fresh] = await Promise.all([
        getTopCharts("", 10),
        searchTracks("new music 2024", 10),
      ]);
      setTopTracks(top);
      setNewTracks(fresh);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPadding + 16, paddingBottom: Platform.OS === "web" ? 160 : 140 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <NexusLogo size="md" />
            <View>
              <Text style={[styles.appName, { color: colors.foreground }]}>Nexus Music</Text>
              <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                Powered by Agent N
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={[styles.searchBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="search" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Genres */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse Genres</Text>
        <FlatList
          data={GENRES}
          keyExtractor={(g) => g.genre}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
          renderItem={({ item }) => (
            <GenreCard
              genre={item.genre}
              label={item.label}
              onPress={() => router.push({ pathname: "/genre", params: { genre: item.genre, label: item.label } })}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        />

        {/* Top Charts */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Charts</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: "/genre", params: { genre: "", label: "Top Charts" } })}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Ver tudo</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <SkeletonLoader count={5} />
        ) : (
          topTracks.map((track, i) => (
            <TrackCard
              key={track.trackId}
              track={track}
              showIndex={i}
              isPlaying={currentTrack?.trackId === track.trackId}
              onPress={() => playTrack(track, topTracks)}
              onFavorite={() => toggleFavorite(track)}
              isFavorite={isFavorite(track.trackId)}
            />
          ))
        )}

        {/* New Music */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Novidades</Text>
        </View>
        {loading ? (
          <SkeletonLoader count={5} />
        ) : (
          newTracks.map((track, i) => (
            <TrackCard
              key={track.trackId}
              track={track}
              showIndex={i}
              isPlaying={currentTrack?.trackId === track.trackId}
              onPress={() => playTrack(track, newTracks)}
              onFavorite={() => toggleFavorite(track)}
              isFavorite={isFavorite(track.trackId)}
            />
          ))
        )}
      </ScrollView>

      {/* Mini Player */}
      <View style={[styles.miniPlayerWrapper, { bottom: Platform.OS === "web" ? 84 + 34 : 84 }]}>
        <MiniPlayer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { gap: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  greeting: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
    marginTop: 8,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  genreList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  miniPlayerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
