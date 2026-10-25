import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, useTheme } from '@/ui/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  tone = 'accent',
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  tone?: 'accent' | 'surface' | 'danger';
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const bg = tone === 'accent' ? colors.accent : tone === 'danger' ? colors.danger : colors.surfaceAlt;
  const fg = tone === 'surface' ? colors.text : '#15202B';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.btn, { backgroundColor: bg }, disabled && { opacity: 0.4 }]}
    >
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: spacing.lg, borderWidth: 1 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  btn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnText: { fontWeight: '800', fontSize: 16 },
});
