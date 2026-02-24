import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function MerchTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MERCH</Text>
      <Text style={styles.subtitle}>
        Merch storefront scaffold. Integrate Stripe products or Shopify later.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 42, fontFamily: 'BebasNeue_400Regular' },
  subtitle: { marginTop: 10, fontSize: 14, opacity: 0.85, fontFamily: 'Inter_400Regular' },
});
