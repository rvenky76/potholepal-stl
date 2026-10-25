import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { HAZARDS } from '@/types/report';
import { useStore } from '@/store/AppStore';
import { spacing, type, useTheme, type Palette } from '@/ui/theme';

// Rough St. Louis metro center, used when there are no located reports yet.
const STL = { latitude: 38.627, longitude: -90.1994, latitudeDelta: 0.35, longitudeDelta: 0.35 };

export default function MapScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { reports } = useStore();

  const located = reports.filter((r) => r.location);

  const region = useMemo(() => {
    if (located.length === 0) return STL;
    const lats = located.map((r) => r.location!.latitude);
    const lngs = located.map((r) => r.location!.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.6),
      longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.6),
    };
  }, [located]);

  return (
    <View style={styles.root}>
      <MapView provider={PROVIDER_DEFAULT} style={StyleSheet.absoluteFill} initialRegion={region}>
        {located.map((r) => {
          const meta = HAZARDS[r.hazardType ?? 'pothole'];
          return (
            <Marker
              key={r.id}
              coordinate={r.location!}
              title={`${meta.emoji} ${meta.reportNoun}`}
              description={`${r.severity} · ${r.county ?? 'county n/a'} · ${new Date(r.createdAt).toLocaleDateString()}`}
              pinColor={meta.urgent ? '#EB5757' : '#F2A33C'}
            />
          );
        })}
      </MapView>

      <View style={styles.badge} pointerEvents="box-none">
        <Text style={styles.badgeText}>
          {located.length === 0
            ? 'No located reports yet — report a hazard to see it here.'
            : `${located.length} report${located.length === 1 ? '' : 's'} on the map`}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    badge: {
      position: 'absolute',
      top: spacing.md,
      alignSelf: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    badgeText: { ...type.caption, color: colors.text },
  });
