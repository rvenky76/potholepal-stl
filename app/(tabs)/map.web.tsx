import { useMemo } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HAZARDS } from '@/types/report';
import { useStore } from '@/store/AppStore';
import { radius, spacing, type, useTheme, type Palette } from '@/ui/theme';

/**
 * Web fallback: react-native-maps renders only on iOS/Android. On web we show the
 * located reports as a list, each opening the spot on OpenStreetMap. The native
 * build (map.tsx) shows the real interactive map with pins.
 */
export default function MapScreenWeb() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { reports } = useStore();
  const located = reports.filter((r) => r.location);

  if (located.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="map-outline" size={40} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No located reports yet</Text>
        <Text style={styles.muted}>Report a hazard with a location and it appears here. The Android/iOS app shows these as pins on an interactive map.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
      data={located}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={
        <Text style={styles.muted}>
          {located.length} located report{located.length === 1 ? '' : 's'}. The mobile app shows these on an interactive map.
        </Text>
      }
      renderItem={({ item }) => {
        const meta = HAZARDS[item.hazardType ?? 'pothole'];
        const osm = `https://www.openstreetmap.org/?mlat=${item.location!.latitude}&mlon=${item.location!.longitude}#map=17/${item.location!.latitude}/${item.location!.longitude}`;
        return (
          <Pressable
            onPress={() => Linking.openURL(osm)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${meta.reportNoun} on the map`}
            style={styles.row}
          >
            <Text style={styles.rowTitle}>{meta.emoji} {meta.reportNoun}</Text>
            <Text style={styles.muted}>
              {item.severity} · {item.county ?? 'county n/a'} · {item.location!.latitude.toFixed(4)}, {item.location!.longitude.toFixed(4)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.sm },
    emptyTitle: { ...type.title, color: colors.text, marginTop: spacing.sm },
    muted: { ...type.caption, color: colors.textMuted, lineHeight: 18, textAlign: 'center' },
    row: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.lg,
    },
    rowTitle: { ...type.heading, color: colors.text, marginBottom: 4 },
  });
