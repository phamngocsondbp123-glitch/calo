import { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Card } from '../components/Card';
import { api } from '../lib/api';

export function ProfileScreen() {
  const [profile, setProfile] = useState<any>();

  useEffect(() => {
    void api.get('/users/me').then((response) => setProfile(response.data)).catch(() => undefined);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Profile</Text>
      <Card>
        <Text style={styles.name}>{profile?.user?.name ?? 'Demo User'}</Text>
        <Text>{profile?.user?.email ?? 'demo@calo.vn'}</Text>
        <Text style={styles.metric}>BMI {profile?.targets?.bmi ?? 0} • TDEE {profile?.targets?.tdee ?? 0} kcal</Text>
        <Text>{profile?.targets?.explanation ?? 'Demo mode is enabled.'}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { gap: 16, padding: 18, backgroundColor: '#f6f7f8' },
  title: { fontSize: 34, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900' },
  metric: { marginVertical: 12, fontWeight: '800', color: '#16a34a' }
});
