import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Track } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";

interface TrackCardProps {
  track: Track;
  onPress: () => void;
  isPlaying?: boolean;
  showIndex?: number;
  compact?: boolean;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function TrackCard({
  track,
  onPress,
  isPlaying,
  showIndex,
  compact,
  onFavorite,
  isFavorite,
}: TrackCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        compact && styles.compact,
        isPlaying && { backgroundColor: colors.accent },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {showIndex !== undefined && (
        <Text style={[styles.index, { color: colors.mutedForeground }]}>
          {isPlaying ? (
            <Feather name="volume-2" size={14} color={colors.primary} />
          ) : (
            showIndex + 1
          )}
        </Text>
      )}
      <View style={styles.artworkWrapper}>
        {track.artworkUrl100 ? (
          <Image
            source={{ uri: track.artworkUrl100 }}
            style={[styles.artwork, compact && styles.artworkSmall]}
          />
        ) : (
          <View
            style={[
              styles.artwork,
              compact && styles.artworkSmall,
              { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
            ]}
          >
            <Feather name="music" size={20} color={colors.mutedForeground} />
          </View>
        )}
        {isPlaying && (
          <View style={[styles.playingOverlay, { backgroundColor: "rgba(43,127,255,0.3)" }]}>
            <Feather name="volume-2" size={16} color={colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            { color: isPlaying ? colors.primary : colors.foreground },
          ]}
          numberOfLines={1}
        >
          {track.trackName}
        </Text>
        <Text style={[styles.artist, { color: colors.mutedForeground }]} numberOfLines={1}>
          {track.artistName}
          {!compact && ` • ${track.albumName}`}
        </Text>
      </View>
      <View style={styles.actions}>
        {!compact && (
          <Text style={[styles.duration, { color: colors.mutedForeground }]}>
            {formatDuration(track.trackTimeMillis)}
          </Text>
        )}
        {onFavorite && (
          <TouchableOpacity onPress={onFavorite} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather
              name={isFavorite ? "heart" : "heart"}
              size={18}
              color={isFavorite ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        )}
        <Feather name="more-vertical" size={18} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  index: {
    width: 20,
    textAlign: "center",
    fontSize: 13,
  },
  artworkWrapper: {
    position: "relative",
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 6,
  },
  artworkSmall: {
    width: 44,
    height: 44,
  },
  playingOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  artist: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  duration: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  favBtn: {
    padding: 2,
  },
});
