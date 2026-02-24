import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function WorkoutTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WORKOUT</Text>
      <Text style={styles.subtitle}>
        Training plans built for performance—strength, speed, durability, and recovery with purpose.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 42, fontFamily: 'BebasNeue_400Regular' },
  subtitle: { marginTop: 10, fontSize: 14, opacity: 0.85, fontFamily: 'Inter_400Regular' },
});
