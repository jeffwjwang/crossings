import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffcf33',
        tabBarInactiveTintColor: '#c8c0d4',
        tabBarStyle: { backgroundColor: '#1b1822', borderTopColor: '#1b1822' },
        tabBarLabelStyle: { fontFamily: 'AtkinsonBold', fontSize: 14 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="about" options={{ title: 'About' }} />
    </Tabs>
  );
}
