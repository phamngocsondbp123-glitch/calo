import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Card } from '../components/Card';
import { api } from '../lib/api';

export function DiaryScreen() {
  const [diary, setDiary] = useState<any>();

  useEffect(() => {
    void api.get('/diary').then((response) => setDiary(response.data)).catch(() => undefined);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Meal Diary</Text>
      <Card>
        <Text style={styles.subtitle}>Tổng hôm nay: {Math.round(diary?.totals?.calories ?? 0)} kcal</Text>
        {diary?.entries?.map((entry: any) => (
          <View key={entry.id} style={styles.row}>
            <View>
              <Text style={styles.food}>{entry.food.vietnameseName}</Text>
              <Text>{entry.mealType} • {entry.quantityGram}g</Text>
            </View>
            <Text style={styles.kcal}>{Math.round(entry.calories)} kcal</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { gap: 16, padding: 18, backgroundColor: '#f6f7f8' },
  title: { fontSize: 34, fontWeight: '900' },
  subtitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  row: { marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: '#f8fafc', flexDirection: 'row', justifyContent: 'space-between' },
  food: { fontWeight: '800' },
  kcal: { fontWeight: '800', color: '#16a34a' }
});
