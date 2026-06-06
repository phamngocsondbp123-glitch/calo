import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Card } from '../components/Card';
import { api } from '../lib/api';

export function HomeScreen() {
  const [summary, setSummary] = useState<any>();
  const [suggestions, setSuggestions] = useState<any>();

  useEffect(() => {
    void api.get('/diary/summary').then((response) => setSummary(response.data)).catch(() => undefined);
    void api.get('/suggestions/today').then((response) => setSuggestions(response.data)).catch(() => undefined);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Hôm nay</Text>
      <Card>
        <Text style={styles.kicker}>Calories</Text>
        <Text style={styles.big}>{Math.round(summary?.totals?.calories ?? 0)} / {summary?.targets?.calories ?? 0} kcal</Text>
        <Text>Protein {Math.round(summary?.totals?.protein ?? 0)} / {summary?.targets?.macros?.protein ?? 0}g</Text>
      </Card>
      <Card>
        <Text style={styles.subtitle}>Gợi ý thông minh</Text>
        <Text>{suggestions?.message ?? 'Đăng nhập để nhận gợi ý.'}</Text>
        {suggestions?.suggestions?.map((suggestion: any) => <View key={suggestion.food.id} style={styles.food}><Text style={styles.foodName}>{suggestion.food.vietnameseName}</Text><Text>{suggestion.servingGram}g</Text></View>)}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { gap: 16, padding: 18, backgroundColor: '#f6f7f8' },
  title: { fontSize: 34, fontWeight: '900' },
  subtitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  kicker: { color: '#64748b' },
  big: { fontSize: 30, fontWeight: '900', color: '#16a34a', marginVertical: 8 },
  food: { marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: '#ecfdf5' },
  foodName: { fontWeight: '700' }
});
