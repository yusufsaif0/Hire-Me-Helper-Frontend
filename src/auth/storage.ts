import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { CredentialStorage } from './client';
import type { MobileRole } from './contracts';
export function credentialStorage(role: MobileRole): CredentialStorage {
  const key = `trusted.${role.toLowerCase()}.refresh`;
  let memory: string | null = null;
  return {
    get: () => (Platform.OS === 'web' ? Promise.resolve(memory) : SecureStore.getItemAsync(key)),
    set: async (value) => {
      if (Platform.OS === 'web') memory = value;
      else
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    },
    clear: async () => {
      memory = null;
      if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(key);
    },
  };
}
