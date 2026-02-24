import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';

export default function HomeTab() {
  const scheme = useColorScheme() ?? 'dark';

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>LIFE PREP ACADEMY DMV</Text>
      <Text style={styles.title}>LEAD. TRAIN. PREPARE.</Text>
      <Text style={styles.subtitle}>Leadership-first training for athletes.</Text>

      <Link href="/(tabs)/book" style={[styles.cta, { backgroundColor: Colors.lpa.accent }] as any}>
        <Text style={[styles.ctaText, { color: Colors.lpa.black }]}>Book Training</Text>
      </Link>

      <Text style={[styles.note, { color: scheme === 'dark' ? '#BBBBBB' : '#444444' }]}>
        Scaffold: add Firebase Auth, drill/workout content, and Stripe confirmations.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 10,
    fontSize: 44,
    lineHeight: 44,
    fontFamily: 'BebasNeue_400Regular',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.9,
    fontFamily: 'Inter_400Regular',
  },
  cta: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_600SemiBold',
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
