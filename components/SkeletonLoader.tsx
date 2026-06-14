import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface SkeletonLoaderProps {
  count?: number;
}

function SkeletonItem({ delay }: { delay: number }) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: false, delay }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, delay]);

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={[styles.artwork, { backgroundColor: colors.secondary }]} />
      <View style={styles.textGroup}>
        <View style={[styles.titleLine, { backgroundColor: colors.secondary }]} />
        <View style={[styles.subtitleLine, { backgroundColor: colors.secondary }]} />
      </View>
    </Animated.View>
  );
}

export function SkeletonLoader({ count = 6 }: SkeletonLoaderProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} delay={i * 100} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  artwork: { width: 52, height: 52, borderRadius: 6 },
  textGroup: { flex: 1, gap: 8 },
  titleLine: { height: 13, borderRadius: 6, width: "70%" },
  subtitleLine: { height: 11, borderRadius: 6, width: "45%" },
});
