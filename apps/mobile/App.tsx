import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddFoodScreen } from './src/screens/AddFoodScreen';
import { SimpleScreen } from './src/screens/SimpleScreen';

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
        <Tab.Screen name="Diary">{() => <SimpleScreen title="Meal Diary" description="Breakfast, lunch, dinner, snacks, copy yesterday, and meal templates are backed by the shared API." />}</Tab.Screen>
        <Tab.Screen name="Stats">{() => <SimpleScreen title="Statistics" description="Daily, weekly, monthly reports with calories, macros, weight progress, and top foods." />}</Tab.Screen>
        <Tab.Screen name="Profile">{() => <SimpleScreen title="Profile" description="Onboarding, authentication, BMI/TDEE, goals, settings, and logout architecture." />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
