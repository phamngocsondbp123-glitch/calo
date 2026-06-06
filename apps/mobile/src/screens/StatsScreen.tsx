import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Card } from '../components/Card';
import { api } from '../lib/api';

export function StatsScreen() {
  const [report, setReport] = useState<any>();

  useEffect(() => {
    void api.get('/reports/weekly').then((response) => setReport(response.data)).catch(() => undefined);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Statistics</Text>
      <Card>
        <Text style={styles.subtitle}>7 ngày gần nhất</Text>
        {report?.nutrition?.map((day: any) => (
          <View key={day.date} style={styles.row}>
            <Text>{day.date}</Text>
            <Text style={styles.kcal}>{Math.round(day.calories)} kcal</Text>
          </View>
        ))}
      </Card>
      <Card>
        <Text style={styles.subtitle}>Top foods</Text>
        {report?.topFoods?.map((food: any) => <Text key={food.food}>{food.food} • {food.servings} lần</Text>)}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { gap: 16, padding: 18, backgroundColor: '#f6f7f8' },
  title: { fontSize: 34, fontWeight: '900' },
  subtitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  row: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  kcal: { fontWeight: '800', color: '#16a34a' }
});
