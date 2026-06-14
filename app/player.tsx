import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePlayer } from "@/context/PlayerContext";
import { useColors } from "@/hooks/useColors";

export default function PlayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    skipNext,
    skipPrev,
    seekTo,
    position,
    duration,
    isLoading,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    isFavorite,
    toggleFavorite,
  } = usePlayer();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!seeking) setSeekValue(position);
  }, [position, seeking]);

  useEffect(() => {
    if (isPlaying) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }).start();
    } else {
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: false }).start();
    }
  }, [isPlaying, scaleAnim]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const progress = duration > 0 ? Math.min(seekValue / duration, 1) : 0;

  const handleSeekTap = (event: { nativeEvent: { locationX: number }; currentTarget: { measure: (cb: (x: number, y: number, w: number, h: number) => void) => void } }) => {
    const { locationX } = event.nativeEvent;
    (event.currentTarget as View & { measure: (cb: (x: number, y: number, w: number, h: number) => void) => void }).measure((_x: number, _y: number, width: number) => {
      const ratio = Math.max(0, Math.min(locationX / width, 1));
      const newPos = ratio * duration;
      setSeekValue(newPos);
      seekTo(newPos);
    });
  };

  const haptic = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  if (!currentTrack) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-down" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Feather name="music" size={64} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Nenhuma música a tocar
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Background blur */}
      <View style={[StyleSheet.absoluteFill, styles.bgOverlay]}>
        {currentTrack.artworkUrl100 && (
          <Image
            source={{ uri: currentTrack.artworkUrl100 }}
            style={StyleSheet.absoluteFill}
            blurRadius={40}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(10,14,26,0.85)" }]} />
      </View>

      <View style={[styles.content, { paddingTop: topPadding + 12, paddingBottom: bottomPadding + 16 }]}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="chevron-down" size={28} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={[styles.playingFrom, { color: colors.mutedForeground }]}>A TOCAR</Text>
            <Text style={[styles.albumName, { color: colors.foreground }]} numberOfLines={1}>
              {currentTrack.collectionName || currentTrack.albumName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => { haptic(); toggleFavorite(currentTrack); }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name="heart"
              size={24}
              color={isFavorite(currentTrack.trackId) ? colors.primary : colors.foreground}
            />
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <Animated.View style={[styles.artworkWrapper, { transform: [{ scale: scaleAnim }] }]}>
          {currentTrack.artworkUrl100 ? (
            <Image
              source={{ uri: currentTrack.artworkUrl100.replace("300x300", "600x600") }}
              style={styles.artwork}
            />
          ) : (
            <View style={[styles.artwork, { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }]}>
              <Feather name="music" size={80} color={colors.mutedForeground} />
            </View>
          )}
        </Animated.View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <View style={styles.trackTextRow}>
            <View style={styles.trackText}>
              <Text style={[styles.trackName, { color: colors.foreground }]} numberOfLines={1}>
                {currentTrack.trackName}
              </Text>
              <Text style={[styles.artistName, { color: colors.mutedForeground }]} numberOfLines={1}>
                {currentTrack.artistName}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <TouchableOpacity
            style={styles.progressBarHit}
            onPress={handleSeekTap as unknown as (event: object) => void}
            activeOpacity={1}
          >
            <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
              <View style={[styles.progressThumb, { backgroundColor: colors.primary, left: `${progress * 100}%` }]} />
            </View>
          </TouchableOpacity>
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(seekValue)}</Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(duration || 30000)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={() => { haptic(); toggleShuffle(); }}>
            <Feather
              name="shuffle"
              size={22}
              color={isShuffle ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { haptic(); skipPrev(); }} style={styles.ctrlBtn}>
            <Feather name="skip-back" size={32} color={colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { haptic(); togglePlay(); }}
            style={[styles.playBtn, { backgroundColor: colors.primary }]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { haptic(); skipNext(); }} style={styles.ctrlBtn}>
            <Feather name="skip-forward" size={32} color={colors.foreground} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { haptic(); toggleRepeat(); }}>
            <Feather
              name={repeatMode === "one" ? "repeat" : "repeat"}
              size={22}
              color={repeatMode !== "off" ? colors.primary : colors.mutedForeground}
            />
            {repeatMode === "one" && (
              <View style={[styles.repeatBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.repeatBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Genre tag */}
        {currentTrack.primaryGenreName ? (
          <View style={styles.genreRow}>
            <View style={[styles.genreTag, { backgroundColor: colors.accent }]}>
              <Text style={[styles.genreText, { color: colors.primary }]}>
                {currentTrack.primaryGenreName}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgOverlay: { overflow: "hidden" },
  content: { flex: 1, paddingHorizontal: 24 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  topCenter: { flex: 1, alignItems: "center", paddingHorizontal: 16 },
  playingFrom: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  albumName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  artworkWrapper: {
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
    marginBottom: 36,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 16,
  },
  trackInfo: { marginBottom: 24 },
  trackTextRow: { flexDirection: "row", alignItems: "center" },
  trackText: { flex: 1 },
  trackName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  artistName: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  progressSection: { marginBottom: 28 },
  progressBarHit: { paddingVertical: 12 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    position: "relative",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  progressThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
    top: -5,
    marginLeft: -7,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  time: { fontSize: 12, fontFamily: "Inter_400Regular" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  ctrlBtn: { padding: 4 },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B7FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  genreRow: { alignItems: "center" },
  genreTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  genreText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  backBtn: { padding: 8 },
  repeatBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatBadgeText: { fontSize: 8, color: "#fff", fontFamily: "Inter_700Bold" },
});
