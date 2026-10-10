import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AuthClient, ApiError } from './client';
import { credentialStorage } from './storage';
import type { Challenge, MobileRole, User } from './contracts';
import { tokens } from '../theme/tokens';
import { FoundationScreen } from '../components/FoundationScreen';
export function AuthScreen({ role, apiUrl }: { role: MobileRole; apiUrl: string }) {
  const client = useMemo(
    () => new AuthClient(role, apiUrl, credentialStorage(role)),
    [role, apiUrl],
  );
  const [user, setUser] = useState<User | null>(null),
    [phone, setPhone] = useState('+91'),
    [code, setCode] = useState('');
  const [challenge, setChallenge] = useState<Challenge | null>(null),
    [busy, setBusy] = useState(true),
    [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(0),
    [remaining, setRemaining] = useState(0),
    [diagnostics, setDiagnostics] = useState(false);
  useEffect(() => {
    let mounted = true;
    void client
      .restore()
      .then((value) => {
        if (mounted) setUser(value);
      })
      .catch((error) => {
        if (mounted) setMessage(error instanceof Error ? error.message : 'Please sign in again.');
      })
      .finally(() => {
        if (mounted) setBusy(false);
      });
    return () => {
      mounted = false;
    };
  }, [client]);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [resendAt]);
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const check = () => {
      void client
        .me()
        .then((value) => {
          if (mounted) setUser(value);
        })
        .catch((error) => {
          if (!mounted) return;
          setMessage(error instanceof Error ? error.message : 'Connection unavailable.');
          if (error instanceof ApiError && [401, 403].includes(error.status)) {
            setUser(null);
            setChallenge(null);
          }
        });
    };
    const interval = setInterval(check, 60000),
      subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') check();
      });
    return () => {
      mounted = false;
      clearInterval(interval);
      subscription.remove();
    };
  }, [client, user?.id]);
  async function begin() {
    setBusy(true);
    setMessage('');
    try {
      const value = await client.begin(phone);
      setChallenge(value);
      setCode('');
      setResendAt(Date.now() + value.resendAfterSeconds * 1000);
    } catch (error) {
      if (error instanceof ApiError && error.retryAfter)
        setResendAt(Date.now() + error.retryAfter * 1000);
      setMessage(error instanceof Error ? error.message : 'Unable to connect.');
    } finally {
      setBusy(false);
    }
  }
  async function verify() {
    if (!challenge) return;
    setBusy(true);
    setMessage('');
    try {
      setUser(await client.verify(challenge, code));
      setCode('');
      setChallenge(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  }
  async function logout(all = false) {
    setBusy(true);
    try {
      await client.logout(all);
      setMessage('You have signed out.');
    } catch {
      setMessage('Signed out on this device. Server revocation could not be confirmed.');
    } finally {
      setUser(null);
      setChallenge(null);
      setBusy(false);
    }
  }
  if (user)
    return (
      <View style={styles.safe}>
        <View style={styles.session}>
          <Text accessibilityRole="header" style={styles.sessionTitle}>
            {role === 'WORKER' ? 'Worker home' : 'Your home'}
          </Text>
          <Text style={styles.copy}>
            {user.maskedPhone}
            {role === 'WORKER' ? ' · Pending onboarding' : ''}
          </Text>
          <View style={styles.row}>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void logout()}>
              <Text style={styles.link}>Sign out</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busy} onPress={() => void logout(true)}>
              <Text style={styles.link}>Sign out all devices</Text>
            </Pressable>
          </View>
          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.message}>
              {message}
            </Text>
          ) : null}
        </View>
        <FoundationScreen audience={role === 'WORKER' ? 'worker' : 'customer'} apiUrl={apiUrl} />
      </View>
    );
  if (diagnostics)
    return (
      <View style={styles.safe}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setDiagnostics(false)}
          style={styles.back}
        >
          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
        <FoundationScreen audience={role === 'WORKER' ? 'worker' : 'customer'} apiUrl={apiUrl} />
      </View>
    );
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>trusted · ASSISTANCE</Text>
        <Text style={styles.eyebrow}>{role === 'WORKER' ? 'FOR ASSISTANTS' : 'FOR FAMILIES'}</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {challenge ? 'Verify your number' : 'Welcome. Let’s get you connected.'}
        </Text>
        <Text style={styles.copy}>
          {challenge
            ? `Enter the six-digit code for ${challenge.maskedPhone}.`
            : 'Sign in with your phone number. Use your country code, for example +91.'}
        </Text>
        <View style={styles.panel}>
          {!challenge ? (
            <>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                accessibilityLabel="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                maxLength={40}
                style={styles.input}
                editable={!busy}
              />
              <Pressable
                accessibilityRole="button"
                disabled={busy || remaining > 0}
                onPress={() => void begin()}
                style={[styles.button, (busy || remaining > 0) && styles.disabled]}
              >
                <Text style={styles.buttonText}>
                  {busy
                    ? 'Connecting…'
                    : remaining > 0
                      ? `Try again in ${remaining}s`
                      : 'Send verification code'}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Verification code</Text>
              <TextInput
                accessibilityLabel="Verification code"
                value={code}
                onChangeText={(value) => setCode(value.replace(/\D/g, ''))}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                maxLength={6}
                style={styles.input}
                editable={!busy}
              />
              <Pressable
                accessibilityRole="button"
                disabled={busy || code.length !== 6}
                onPress={() => void verify()}
                style={[styles.button, (busy || code.length !== 6) && styles.disabled]}
              >
                <Text style={styles.buttonText}>{busy ? 'Verifying…' : 'Verify and sign in'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy || remaining > 0}
                onPress={() => void begin()}
              >
                <Text style={styles.link}>
                  {remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  setChallenge(null);
                  setCode('');
                  setMessage('');
                }}
              >
                <Text style={styles.link}>Change phone number</Text>
              </Pressable>
              {__DEV__ ? (
                <Text selectable style={styles.development}>
                  Mock SMS test challenge: {challenge.challengeId}. Use the private local test inbox
                  CLI; no real SMS is sent.
                </Text>
              ) : null}
            </>
          )}
          {busy ? (
            <ActivityIndicator accessibilityLabel="Working" color={tokens.colors.primary} />
          ) : null}
          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.message}>
              {message}
            </Text>
          ) : null}
        </View>
        <Text style={styles.copy}>Non-medical assistance. Consent comes first.</Text>
        {__DEV__ ? (
          <Pressable accessibilityRole="button" onPress={() => setDiagnostics(true)}>
            <Text style={styles.link}>Local connection diagnostics</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  container: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 28, paddingTop: 64 },
  brand: { color: tokens.colors.primary, fontSize: 20, fontWeight: '700', marginBottom: 48 },
  eyebrow: { fontSize: 10, letterSpacing: 2, color: tokens.colors.muted, marginBottom: 16 },
  title: { fontSize: 34, lineHeight: 43, fontWeight: '600', color: tokens.colors.ink },
  copy: { fontSize: 14, lineHeight: 23, color: tokens.colors.muted, marginVertical: 16 },
  panel: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 24,
    marginVertical: 16,
    borderColor: tokens.colors.border,
    borderWidth: 1,
  },
  label: { fontSize: 14, color: tokens.colors.ink, marginBottom: 10 },
  input: {
    minHeight: 50,
    fontSize: 18,
    padding: 14,
    borderColor: tokens.colors.border,
    borderWidth: 1,
    borderRadius: 9,
    color: tokens.colors.ink,
    backgroundColor: '#fff',
  },
  button: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.primary,
    borderRadius: 9,
    marginTop: 18,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  disabled: { opacity: 0.5 },
  link: { color: tokens.colors.primary, fontSize: 14, paddingVertical: 12 },
  message: { color: tokens.colors.ink, lineHeight: 22, marginTop: 12 },
  development: { fontSize: 11, lineHeight: 18, color: tokens.colors.muted, marginTop: 12 },
  session: { paddingHorizontal: 24, paddingTop: 20, backgroundColor: tokens.colors.surface },
  sessionTitle: { fontSize: 20, fontWeight: '600', color: tokens.colors.ink },
  row: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  back: { padding: 20 },
});
