import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '@/src/ui/settings';
import { font, palette } from '@/src/ui/theme';

const SIZES = [
  { label: 'Regular', value: 1 },
  { label: 'Large', value: 1.15 },
  { label: 'Extra large', value: 1.35 },
];

export default function AboutScreen() {
  const settings = useSettings();
  const colors = palette(settings.highContrast);
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.panel }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { fontSize: font(settings.textScale, 32) }]}>Crossings</Text>
        <Text style={styles.by}>by Vervia</Text>
        <Text style={[styles.body, { fontSize: font(settings.textScale, 18) }]}>
          A street crossword on a real map. Each street is a word. Crossings share a letter. The place name stays hidden until you finish.
        </Text>
        <Text style={styles.section}>Text size</Text>
        <View style={styles.row}>
          {SIZES.map((size) => (
            <Pressable
              key={size.label}
              onPress={() => settings.setTextScale(size.value)}
              style={[styles.chip, settings.textScale === size.value && styles.chipOn]}
            >
              <Text style={styles.chipText}>{size.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.switchRow}>
          <Text style={[styles.body, { fontSize: font(settings.textScale, 18) }]}>High contrast</Text>
          <Switch
            accessibilityLabel="High contrast"
            value={settings.highContrast}
            onValueChange={settings.setHighContrast}
          />
        </View>
        <Text style={styles.section}>How to play</Text>
        <Text style={[styles.body, { fontSize: font(settings.textScale, 18) }]}>
          Only one street is clear at the start. Type with the big keyboard, then tap Check. A correct street lifts the fog and may reveal a street that crosses it. Hint fills one letter. On the puzzle screen, List is there if the map is hard to see, and Speak reads the clue.
        </Text>
        <Text style={styles.section}>About this build</Text>
        <Text style={[styles.body, { fontSize: font(settings.textScale, 18) }]}>
          Crossings 0.1.0, a local sample for Expo Go. No account, no purchases, no notifications. VERVIA LIMITED. The full neighbourhood is Medium. Easy is a shorter set of the same streets. Hard and Super Hard are reserved for later.
        </Text>
        <Text style={styles.section}>Maps and type</Text>
        <Text style={[styles.body, { fontSize: font(settings.textScale, 18) }]}>
          Street geometry © OpenStreetMap contributors, licensed under ODbL. The map in the puzzle always shows that credit.
        </Text>
        <Pressable onPress={() => void Linking.openURL('https://www.openstreetmap.org/copyright')}>
          <Text style={styles.link}>OpenStreetMap copyright</Text>
        </Pressable>
        <Text style={[styles.body, { fontSize: font(settings.textScale, 18) }]}>
          Atkinson Hyperlegible by the Braille Institute of America, used under the SIL Open Font License.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 18, gap: 10, paddingBottom: 40 },
  title: { fontFamily: 'AtkinsonBold', color: '#16130f' },
  by: { fontFamily: 'Atkinson', color: '#6b4e12', fontSize: 18, marginTop: -6 },
  section: { fontFamily: 'AtkinsonBold', fontSize: 18, marginTop: 8, color: '#16130f' },
  body: { fontFamily: 'Atkinson', lineHeight: 26, color: '#16130f' },
  row: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, minHeight: 48, borderWidth: 2, borderColor: '#16130f', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  chipOn: { backgroundColor: '#ffcf33' },
  chipText: { fontFamily: 'AtkinsonBold', fontSize: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontFamily: 'AtkinsonBold', color: '#0d47a1', fontSize: 18, textDecorationLine: 'underline' },
});
