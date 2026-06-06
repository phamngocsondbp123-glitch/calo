import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 18, shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 }
});
