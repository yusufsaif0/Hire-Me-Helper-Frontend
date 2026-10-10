import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { tokens } from '../theme/tokens';
import { healthResponseSchemaFor, pilotServices } from '../lib/contracts';
export function FoundationScreen({
  audience,
  apiUrl,
}: {
  audience: 'customer' | 'worker';
  apiUrl: string;
}) {
  const isCustomer = audience === 'customer';
  const [status, setStatus] = useState('Check your connection to the local API.');
  const [checking, setChecking] = useState(false);
  async function checkHealth() {
    setChecking(true);
    try {
      const response = await fetch(apiUrl + '/v1/health', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('API unavailable');
      healthResponseSchemaFor(
        isCustomer ? 'trusted-assistance-customer-api' : 'trusted-assistance-worker-api',
      ).parse(await response.json());
      setStatus('Connected. All external integrations are mocked.');
    } catch {
      setStatus('API offline. Start the API and check the device API URL.');
    } finally {
      setChecking(false);
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <Text style={styles.markText}>t·</Text>
          </View>
          <View>
            <Text style={styles.brand}>trusted</Text>
            <Text style={styles.brandSub}>ASSISTANCE</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>
          {isCustomer ? 'FOR FAMILIES' : 'FOR ASSISTANTS'} · DELHI NCR PILOT
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          {isCustomer ? 'Someone there.\nWhen it matters.' : 'Your care makes\na difference.'}
        </Text>
        <Text style={styles.subtitle}>
          {isCustomer
            ? 'Thoughtful, non-medical help for yourself or a loved one. Start with the moments that matter most.'
            : 'Help people feel supported through everyday moments. This is the beginning of your dedicated worker workspace.'}
        </Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Phase 1 · Foundation preview</Text>
          <Text style={styles.noticeText}>
            {isCustomer
              ? 'Profiles and bookings will arrive in later phases.'
              : 'Onboarding, job offers and payouts will arrive in later phases.'}
          </Text>
        </View>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {isCustomer ? 'A focused first step' : 'The services we are building for'}
        </Text>
        {pilotServices.map((service, i) => (
          <View key={service.id} style={styles.card}>
            <Text style={styles.number}>0{i + 1}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{service.name}</Text>
              <Text style={styles.cardText}>{service.description}</Text>
            </View>
          </View>
        ))}
        <View style={styles.connection}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Local connection
          </Text>
          <Text accessibilityLiveRegion="polite" style={styles.cardText}>
            {status}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={checking}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => void checkHealth()}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check API connection</Text>
            )}
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            void Linking.openURL(apiUrl + '/docs').catch(() =>
              setStatus('Unable to open API documentation. Check the API URL.'),
            );
          }}
        >
          <Text style={styles.link}>Open local API documentation ↗</Text>
        </Pressable>
        <Text style={styles.footer}>
          {'People before everything.\nNon-medical assistance · Consent comes first'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  container: { padding: 24, paddingTop: 40, width: '100%', maxWidth: 680, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 48 },
  mark: {
    backgroundColor: tokens.colors.primary,
    width: 46,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: { fontSize: 32, color: '#eef2d7' },
  brand: { fontSize: 27, fontWeight: '700', color: tokens.colors.ink },
  brandSub: { fontSize: 9, letterSpacing: 3, color: tokens.colors.ink },
  eyebrow: { fontSize: 10, letterSpacing: 1.5, color: tokens.colors.muted, marginBottom: 18 },
  title: {
    fontSize: 39,
    fontWeight: '600',
    lineHeight: 47,
    letterSpacing: -1.3,
    color: tokens.colors.ink,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 25,
    color: tokens.colors.muted,
    marginTop: 20,
    marginBottom: 25,
  },
  notice: {
    padding: 17,
    borderRadius: 12,
    backgroundColor: tokens.colors.accent,
    marginBottom: 32,
  },
  noticeTitle: { fontSize: 13, fontWeight: '600', color: tokens.colors.primary, marginBottom: 6 },
  noticeText: { fontSize: 12, lineHeight: 20, color: tokens.colors.muted },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: tokens.colors.ink, marginBottom: 16 },
  card: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  number: { color: tokens.colors.primary, fontSize: 12, marginTop: 3 },
  cardBody: { flex: 1 },
  cardTitle: { color: tokens.colors.ink, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cardText: { color: tokens.colors.muted, fontSize: 13, lineHeight: 21 },
  connection: { marginTop: 25, padding: 22, borderRadius: 16, backgroundColor: '#fff' },
  button: {
    marginTop: 18,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    borderRadius: 9,
  },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  link: { paddingVertical: 22, color: tokens.colors.primary, fontSize: 13, textAlign: 'center' },
  footer: {
    fontSize: 11,
    color: tokens.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});
