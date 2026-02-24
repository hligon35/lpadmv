import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { pricingCatalog, type PricingSelection } from '@lpa/pricing';

import Colors from '@/constants/Colors';
import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getFunctionsBaseUrl } from '@/lib/config';

export default function BookTab() {
  const scheme = useColorScheme() ?? 'dark';

  const programOptions = pricingCatalog.catalog.programOptions;
  const freqOptions = pricingCatalog.catalog.frequencyOptions;
  const commitmentOptions = pricingCatalog.catalog.commitmentOptions;

  const [selection, setSelection] = useState<PricingSelection>({
    programKey: programOptions[0]!.value,
    frequencyPerWeek: freqOptions[0]!.value,
    commitmentMonths: commitmentOptions[0]!.value,
  });

  const amountCents = useMemo(() => {
    const program = pricingCatalog.programs.find((p) => p.programKey === selection.programKey);
    const row = program?.prices.find(
      (p) => p.frequencyPerWeek === selection.frequencyPerWeek && p.commitmentMonths === selection.commitmentMonths,
    );
    return row?.amountCents;
  }, [selection]);

  async function requestBooking() {
    try {
      const baseUrl = getFunctionsBaseUrl();
      const res = await fetch(`${baseUrl}/createBooking`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...selection,
          preferredTimes: [],
          customerEmail: 'user@example.com',
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      Alert.alert('Booking submitted', `Pending approval. Booking: ${json.bookingId}`);

      // Scaffold note:
      // In production, use @stripe/stripe-react-native to confirm the PaymentIntent clientSecret returned here,
      // then capture after admin approval.
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not create booking');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BOOK</Text>
      <Text style={styles.subtitle}>
        Pricing is based off strength of the commitment!
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Program</Text>
        <Text style={styles.value}>{selection.programKey}</Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Estimated Total</Text>
        <Text style={styles.value}>${amountCents ? (amountCents / 100).toFixed(2) : '—'}</Text>

        <Pressable
          onPress={requestBooking}
          style={[styles.cta, { backgroundColor: Colors.lpa.accent }]}
        >
          <Text style={[styles.ctaText, { color: Colors.lpa.black }]}>Request Booking</Text>
        </Pressable>

        <Text style={[styles.note, { color: scheme === 'dark' ? '#BBBBBB' : '#444444' }]}>
          This screen is a scaffold: replace the hardcoded email, add date/time pickers, and confirm PaymentIntents with Stripe.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 42, fontFamily: 'BebasNeue_400Regular' },
  subtitle: { marginTop: 8, fontSize: 14, opacity: 0.85, fontFamily: 'Inter_400Regular' },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  label: { fontSize: 12, opacity: 0.85, fontFamily: 'Inter_400Regular' },
  value: { marginTop: 4, fontSize: 16, fontWeight: '700', fontFamily: 'Inter_600SemiBold' },
  cta: { marginTop: 16, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  ctaText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  note: { marginTop: 12, fontSize: 12, fontFamily: 'Inter_400Regular' },
});
