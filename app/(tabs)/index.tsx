import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import type { Agency, HazardType, PotholeReport, Severity } from '@/types/report';
import { HAZARDS } from '@/types/report';
import { AGENCIES, routeAgency } from '@/data/agencies';
import { resolveCurrentLocation } from '@/data/location';
import { composeReportText, formLink, mailtoLink, mapsLink, telLink } from '@/data/report';
import { useStore } from '@/store/AppStore';
import { Card, PrimaryButton, SectionTitle } from '@/ui/components';
import { radius, spacing, useTheme, type Palette } from '@/ui/theme';

const SEVERITIES: { value: Severity; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const HAZARD_ORDER: HazardType[] = [
  'pothole', 'tree', 'flooding', 'dead_animal', 'signal', 'sign', 'debris', 'other',
];

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { saveReport } = useStore();

  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [hazardType, setHazardType] = useState<HazardType>('pothole');
  const [loc, setLoc] = useState<PotholeReport['location']>(null);
  const [address, setAddress] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [county, setCounty] = useState<string | undefined>();
  const [severity, setSeverity] = useState<Severity>('medium');
  const [note, setNote] = useState('');
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [agencyOverride, setAgencyOverride] = useState<Agency | null>(null);

  const routedAgency: Agency = agencyOverride ?? routeAgency(county, city);
  const target = AGENCIES[routedAgency];

  const takePhoto = async () => {
    setPhotoMsg(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setPhotoMsg(
          perm.canAskAgain === false
            ? 'Camera permission is off — enable it in Settings, or use “Choose” instead.'
            : 'Camera permission denied — you can still report without a photo, or use “Choose”.',
        );
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.5,
      });
      if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
    } catch (e) {
      setPhotoMsg(
        `Couldn’t open the camera (${e instanceof Error ? e.message : 'unknown error'}). Try “Choose” to pick a photo instead.`,
      );
    }
  };

  const pickPhoto = async () => {
    setPhotoMsg(null);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
      });
      if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
    } catch (e) {
      setPhotoMsg(`Couldn’t open your photos (${e instanceof Error ? e.message : 'unknown error'}).`);
    }
  };

  const getLocation = async () => {
    setLocating(true);
    setLocMsg(null);
    const r = await resolveCurrentLocation();
    setLocating(false);
    if (!r.ok) {
      setLocMsg(
        r.reason === 'denied'
          ? 'Location permission denied — enable it, or type the nearest intersection in Details.'
          : 'Couldn\u2019t get a location fix — type the nearest intersection in Details.',
      );
      return;
    }
    setLoc(r.value.point);
    setAddress(r.value.address);
    setCity(r.value.city);
    setCounty(r.value.county);
    if (!r.value.county && !r.value.address) {
      setLocMsg('Got your coordinates, but couldn\u2019t resolve the street — add a landmark in Details.');
    }
  };

  const buildReport = (): PotholeReport => ({
    id: `rep_${Date.now()}`,
    createdAt: Date.now(),
    hazardType,
    photoUri,
    location: loc,
    address,
    city,
    county,
    severity,
    note: note.trim() || undefined,
    target: routedAgency,
    status: 'handed_off',
  });

  const handOff = async (kind: 'form' | 'call' | 'email' | 'maps') => {
    const r = buildReport();
    saveReport(r);
    let url: string | undefined;
    if (kind === 'form') url = formLink(r);
    else if (kind === 'call') url = telLink(r);
    else if (kind === 'email') url = mailtoLink(r);
    else url = mapsLink(r);
    if (url) {
      try {
        await Linking.openURL(url);
      } catch {
        setLocMsg('Couldn\u2019t open that — your report is saved under History.');
      }
    }
  };

  const canReport = !!loc || !!note.trim();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl, gap: spacing.lg }}
    >
      {/* 1. Hazard type */}
      <Card>
        <SectionTitle>1 · What are you reporting?</SectionTitle>
        <View style={styles.rowButtons}>
          {HAZARD_ORDER.map((h) => {
            const meta = HAZARDS[h];
            const active = hazardType === h;
            return (
              <Pressable
                key={h}
                onPress={() => setHazardType(h)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Hazard type ${meta.label}`}
                style={[styles.hazard, active && styles.sevActive]}
              >
                <Text style={[styles.sevText, active && styles.sevTextActive]}>
                  {meta.emoji} {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* 2. Photo */}
      <Card>
        <SectionTitle>2 · Photo (optional)</SectionTitle>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel={`${HAZARDS[hazardType].label} photo`} />
        ) : (
          <View style={[styles.photoPlaceholder, { borderColor: colors.border }]}>
            <Text style={styles.muted}>No photo yet</Text>
          </View>
        )}
        <View style={styles.rowButtons}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="📷 Take photo" onPress={takePhoto} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="🖼️ Choose" tone="surface" onPress={pickPhoto} />
          </View>
        </View>
        {photoMsg ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.muted, { color: colors.warn, marginTop: spacing.sm }]}
          >
            {photoMsg}
          </Text>
        ) : null}
      </Card>

      {/* 3. Location */}
      <Card>
        <SectionTitle>3 · Location</SectionTitle>
        {loc ? (
          <>
            <Text style={styles.body}>
              📍 {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
            </Text>
            {address ? <Text style={styles.muted}>{address}</Text> : null}
            <Text style={styles.muted}>
              {county ? `County: ${county}` : 'County not resolved'}
              {city ? `  ·  ${city}` : ''}
            </Text>
          </>
        ) : (
          <Text style={styles.muted}>Tap to pin exactly where the hazard is.</Text>
        )}
        <View style={{ marginTop: spacing.md }}>
          {locating ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.muted}>Getting your location…</Text>
            </View>
          ) : (
            <PrimaryButton label={loc ? '📍 Update location' : '📍 Use my location'} onPress={getLocation} />
          )}
        </View>
        {locMsg ? <Text style={[styles.muted, { color: colors.warn, marginTop: spacing.sm }]}>{locMsg}</Text> : null}
      </Card>

      {/* 4. Severity */}
      <Card>
        <SectionTitle>4 · How bad is it?</SectionTitle>
        <View style={styles.rowButtons}>
          {SEVERITIES.map((s) => (
            <Pressable
              key={s.value}
              onPress={() => setSeverity(s.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: severity === s.value }}
              accessibilityLabel={`Severity ${s.label}`}
              style={[styles.sev, severity === s.value && styles.sevActive]}
            >
              <Text style={[styles.sevText, severity === s.value && styles.sevTextActive]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* 5. Details */}
      <Card>
        <SectionTitle>5 · Details (optional)</SectionTitle>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={HAZARDS[hazardType].detailHint}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={`Details about the ${HAZARDS[hazardType].label}`}
          style={styles.input}
          multiline
        />
      </Card>

      {/* 6. Who to report to */}
      <Card>
        <SectionTitle>6 · Report to</SectionTitle>
        <Text style={styles.body}>{target.name}</Text>
        <Text style={styles.muted}>{target.covers}</Text>
        <Text style={[styles.muted, { marginTop: spacing.xs }]}>
          On a highway (I-44/64/70/270, a US/MO route)? Use MoDOT instead:
        </Text>
        <View style={styles.rowButtons}>
          {(['stlouis_city', 'stlouis_county', 'modot'] as Agency[]).map((a) => (
            <Pressable
              key={a}
              onPress={() => setAgencyOverride(a)}
              accessibilityRole="button"
              accessibilityState={{ selected: routedAgency === a }}
              style={[styles.sev, routedAgency === a && styles.sevActive]}
            >
              <Text style={[styles.sevText, routedAgency === a && styles.sevTextActive]}>
                {a === 'modot' ? 'MoDOT' : a === 'stlouis_city' ? 'City' : 'County'}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* 7. Send */}
      <Card>
        <SectionTitle>7 · Send your report</SectionTitle>
        <Text style={[styles.muted, { marginBottom: spacing.sm }]}>
          HazardHub prepares the full report. Pick how to send it — it opens the agency with your
          details ready (attach the photo when prompted).
        </Text>
        <View style={{ gap: spacing.sm }}>
          {target.formUrl ? (
            <PrimaryButton
              label="📝 Open the report form"
              onPress={() => handOff('form')}
              disabled={!canReport}
            />
          ) : null}
          <PrimaryButton
            label={`📞 Call ${target.phoneDisplay ?? 'the agency'}`}
            tone="surface"
            onPress={() => handOff('call')}
            disabled={!canReport}
          />
          <PrimaryButton
            label="🗺️ Open the spot in Maps"
            tone="surface"
            onPress={() => handOff('maps')}
            disabled={!loc}
          />
        </View>
        {!canReport ? (
          <Text style={[styles.muted, { color: colors.warn, marginTop: spacing.sm }]}>
            Add a location or details first.
          </Text>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    body: { color: colors.text, fontSize: 16 },
    muted: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
    center: { alignItems: 'center', gap: spacing.sm },
    photo: { width: '100%', height: 200, borderRadius: radius.md, marginBottom: spacing.md },
    photoPlaceholder: {
      width: '100%',
      height: 120,
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    rowButtons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
    sev: {
      flexGrow: 1,
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    sevActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    hazard: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    sevText: { color: colors.text, fontWeight: '700' },
    sevTextActive: { color: colors.bg },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      padding: spacing.md,
      minHeight: 70,
      textAlignVertical: 'top',
    },
  });
