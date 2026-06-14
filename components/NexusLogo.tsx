import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface NexusLogoProps {
  size?: "sm" | "md" | "lg";
}

export function NexusLogo({ size = "md" }: NexusLogoProps) {
  const colors = useColors();
  const dims = size === "sm" ? 28 : size === "lg" ? 56 : 38;
  const fontSize = size === "sm" ? 14 : size === "lg" ? 28 : 20;

  return (
    <View style={[styles.container, { width: dims, height: dims, borderRadius: dims * 0.22, backgroundColor: colors.primary }]}>
      <Text style={[styles.letter, { fontSize, color: "#fff" }]}>N</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2B7FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  letter: {
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
});
