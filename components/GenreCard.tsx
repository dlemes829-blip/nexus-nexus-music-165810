import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { useColors } from "@/hooks/useColors";

const GENRE_COLORS: Record<string, string> = {
  pop: "#E91E8C",
  rock: "#FF5722",
  hiphop: "#9C27B0",
  electronic: "#00BCD4",
  rb: "#FF9800",
  latin: "#4CAF50",
  country: "#795548",
  jazz: "#607D8B",
};

const GENRE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  pop: "star",
  rock: "zap",
  hiphop: "mic",
  electronic: "radio",
  rb: "heart",
  latin: "music",
  country: "sunset",
  jazz: "headphones",
};

interface GenreCardProps {
  genre: string;
  label: string;
  onPress: () => void;
}

export function GenreCard({ genre, label, onPress }: GenreCardProps) {
  const colors = useColors();
  const bgColor = GENRE_COLORS[genre] ?? colors.accent;
  const icon = GENRE_ICONS[genre] ?? "music";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name={icon} size={24} color="#fff" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 140,
    height: 90,
    borderRadius: 10,
    padding: 14,
    justifyContent: "space-between",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
