import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <View style={styles.fill}>
        <Text style={styles.title}>That screen is not on the map.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to today</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fffaf0' },
  title: { fontFamily: 'AtkinsonBold', fontSize: 22, marginBottom: 12 },
  link: { padding: 12 },
  linkText: { fontFamily: 'AtkinsonBold', fontSize: 18, color: '#0d47a1' },
});
