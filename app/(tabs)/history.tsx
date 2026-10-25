import { useMemo } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PotholeReport } from '@/types/report';
import { HAZARDS } from '@/types/report';
import { AGENCIES } from '@/data/agencies';
import { mapsLink } from '@/data/report';
import { useStore } from '@/store/AppStore';
import { Card } from '@/ui/components';
import { radius, spacing, useTheme, type Palette } from '@/ui/theme';

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
          <Pressable onPress={() => Linking.openURL(maps)} accessibilityRole="button" style={styles.action}>
            <Text style={styles.actionText}>🗺️ Map</Text>
          </Pressable>
        ) : null}
        {target.phone ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${target.phone}`)}
            accessibilityRole="button"
            style={styles.action}
          >
            <Text style={styles.actionText}>📞 Call</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel="Delete report" style={styles.action}>
          <Text style={[styles.actionText, { color: colors.danger }]}>🗑 Delete</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.xl, gap: spacing.sm },
    emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
    muted: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
    thumb: { width: 64, height: 64, borderRadius: radius.sm },
    title: { color: colors.text, fontSize: 16, fontWeight: '700' },
    meta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    action: { paddingVertical: spacing.xs },
    actionText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  });
