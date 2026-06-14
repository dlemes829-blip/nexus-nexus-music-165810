import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { TrackCard } from "@/components/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";

type Tab = "favorites" | "recent";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites, recentlyPlayed, playTrack, currentTrack, toggleFavorite, isFavorite } = usePlayer();
  const [tab, setTab] = useState<Tab>("favorites");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const data = tab === "favorites" ? favorites : recentlyPlayed;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Sua Biblioteca</Text>
        <View style={[styles.tabs, { backgroundColor: colors.secondary }]}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "favorites" && { backgroundColor: colors.primary }]}
            onPress={() => setTab("favorites")}
          >
            <Feather name="heart" size={14} color={tab === "favorites" ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: tab === "favorites" ? "#fff" : colors.mutedForeground }]}>
              Favoritos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "recent" && { backgroundColor: colors.primary }]}
            onPress={() => setTab("recent")}
          >
            <Feather name="clock" size={14} color={tab === "recent" ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: tab === "recent" ? "#fff" : colors.mutedForeground }]}>
              Recentes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Feather
            name={tab === "favorites" ? "heart" : "clock"}
            size={52}
            color={colors.border}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {tab === "favorites" ? "Sem favoritos ainda" : "Histórico vazio"}
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {tab === "favorites"
              ? "Toca o coração em qualquer música para guardar aqui"
              : "As músicas que ouvires aparecerão aqui"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(t) => String(t.trackId)}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 160 : 140, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TrackCard
              track={item}
              isPlaying={currentTrack?.trackId === item.trackId}
              onPress={() => playTrack(item, data)}
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  tabs: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  miniPlayerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
