import { useMemo } from 'react';
import { FlatList, Image, Linking, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PotholeReport } from '@/types/report';
import { HAZARDS } from '@/types/report';
import { AGENCIES } from '@/data/agencies';
import { mapsLink } from '@/data/report';
import { useStore } from '@/store/AppStore';
import { Card, IconButton } from '@/ui/components';
import { radius, spacing, type, useTheme, type Palette } from '@/ui/theme';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { reports, deleteReport } = useStore();

  if (reports.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No reports yet</Text>
        <Text style={styles.muted}>Reports you send appear here, so you can re-open or follow up.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
      data={reports}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => <Row report={item} onDelete={() => deleteReport(item.id)} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
    />
  );
}

function Row({ report, onDelete }: { report: PotholeReport; onDelete: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const target = AGENCIES[report.target];
  const maps = mapsLink(report);
  const hazard = HAZARDS[report.hazardType ?? 'pothole'];
  return (
    <Card>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {report.photoUri ? (
          <Image source={{ uri: report.photoUri }} style={styles.thumb} accessibilityLabel="Report photo" />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {hazard.emoji} {report.address ?? report.note ?? hazard.reportNoun}
          </Text>
          <Text style={styles.muted}>
            {hazard.label} · {report.severity} · {report.county ?? 'county n/a'} · → {target.name}
          </Text>
          <Text style={styles.meta}>{new Date(report.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {maps ? (
          <IconButton icon="map" label="Map" onPress={() => Linking.openURL(maps)} />
        ) : null}
        {target.phone ? (
          <IconButton icon="call" label="Call" onPress={() => Linking.openURL(`tel:${target.phone}`)} />
        ) : null}
        <IconButton icon="trash" label="Delete" tone="danger" onPress={onDelete} />
      </View>
    </Card>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.sm },
    emptyTitle: { ...type.title, color: colors.text },
    muted: { ...type.caption, color: colors.textMuted, lineHeight: 18 },
    thumb: { width: 64, height: 64, borderRadius: radius.sm },
    title: { ...type.heading, color: colors.text },
    meta: { ...type.caption, fontSize: 12, color: colors.textMuted, marginTop: 4 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' },
  });
