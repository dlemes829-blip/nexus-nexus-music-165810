import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePlayer } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";

export function MiniPlayer() {
  const colors = useColors();
  const { currentTrack, isPlaying, togglePlay, isLoading, skipNext } = usePlayer();

  if (!currentTrack) return null;

  const handleToggle = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    togglePlay();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push("/player")}
      activeOpacity={0.9}
    >
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: "30%" }]} />
      </View>
      <View style={styles.content}>
        {currentTrack.artworkUrl100 ? (
          <Image source={{ uri: currentTrack.artworkUrl100 }} style={styles.artwork} />
        ) : (
          <View style={[styles.artwork, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
            <Feather name="music" size={16} color={colors.mutedForeground} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {currentTrack.trackName}
          </Text>
          <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>
            {currentTrack.artistName}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleToggle} style={styles.btn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={22}
                color={colors.foreground}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={skipNext}
            style={styles.btn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="skip-forward" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  progressBar: {
    height: 2,
    width: "100%",
  },
  progressFill: {
    height: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  artist: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  btn: {
    padding: 4,
  },
});
