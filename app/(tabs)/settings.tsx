import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStore } from '@/store/AppStore';
import { Card, SectionTitle } from '@/ui/components';
import { radius, spacing, useTheme, type Palette } from '@/ui/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { settings, updateSettings } = useStore();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
    >
      <Card>
        <SectionTitle>Appearance</SectionTitle>
        <View style={styles.row}>
          {([
            ['dark', '🌙 Dark'],
            ['light', '☀️ Light'],
            ['system', '📱 System'],
          ] as const).map(([t, label]) => (
            <Pressable
              key={t}
              onPress={() => updateSettings({ theme: t })}
              accessibilityRole="button"
              accessibilityState={{ selected: settings.theme === t }}
              accessibilityLabel={`${t} theme`}
              style={[styles.sel, settings.theme === t && styles.selActive]}
            >
              <Text style={[styles.selText, settings.theme === t && styles.selTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>How reporting works</SectionTitle>
        <Text style={styles.body}>
          PotholePal does the hard part — a photo, your exact GPS spot, and the county — then opens
          the right agency with your report ready to send. It does not submit on your behalf (the
          agencies have no app or API), so you tap the final send.
        </Text>
        <Text style={[styles.body, { marginTop: spacing.sm }]}>
          Road ownership is split: the City of St. Louis, St. Louis County, and MoDOT (state
          highways) each handle their own roads. PotholePal makes its best guess and lets you switch
          if you know it's a highway.
        </Text>
        <Pressable onPress={() => Linking.openURL('tel:18882756636')} accessibilityRole="button">
          <Text style={styles.link}>📞 MoDOT 1-888-ASK-MODOT</Text>
        </Pressable>
      </Card>

      <Text style={styles.footer}>
        PotholePal STL · a community reporting assistant. Not affiliated with MoDOT or the City/County
        of St. Louis.
      </Text>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
    sel: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    selText: { color: colors.text, fontWeight: '700' },
    selTextActive: { color: colors.bg },
    body: { color: colors.text, fontSize: 15, lineHeight: 22 },
    link: { color: colors.accent, fontSize: 16, fontWeight: '800', marginTop: spacing.md },
    footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.sm },
  });
