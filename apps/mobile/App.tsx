import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddFoodScreen } from './src/screens/AddFoodScreen';
import { DiaryScreen } from './src/screens/DiaryScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const iconMap = { Home: 'home', Add: 'add-circle', Diary: 'restaurant', Stats: 'bar-chart', Profile: 'person' } as const;

type RouteName = keyof typeof iconMap;

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarStyle: { height: 72, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name as RouteName]} color={color} size={size} />
      })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Add" component={AddFoodScreen} />
        <Tab.Screen name="Diary" component={DiaryScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
