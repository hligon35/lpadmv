import Constants from 'expo-constants';

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type Extra = {
  FUNCTIONS_BASE_URL?: string;
  FIREBASE?: Partial<FirebaseConfig>;
  STRIPE_PUBLISHABLE_KEY?: string;
};

function getExtra(): Extra {
  return ((Constants.expoConfig?.extra as any) ?? {}) as Extra;
}

export function getFunctionsBaseUrl(): string {
  const v = getExtra().FUNCTIONS_BASE_URL;
  if (!v) throw new Error('Missing expo.extra.FUNCTIONS_BASE_URL');
  return v;
}

export function getFirebaseConfig(): FirebaseConfig {
  const cfg = getExtra().FIREBASE ?? {};
  const required: Array<keyof FirebaseConfig> = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const k of required) {
    if (!cfg[k]) throw new Error(`Missing expo.extra.FIREBASE.${k}`);
  }

  return cfg as FirebaseConfig;
}

export function getStripePublishableKey(): string {
  const v = getExtra().STRIPE_PUBLISHABLE_KEY;
  if (!v) throw new Error('Missing expo.extra.STRIPE_PUBLISHABLE_KEY');
  return v;
}
