import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { font, type Palette } from './theme';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL'];

function tick() {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync();
}

export function Keyboard({
  colors,
  scale,
  onKey,
  onDelete,
}: {
  colors: Palette;
  scale: number;
  onKey: (letter: string) => void;
  onDelete: () => void;
}) {
  const keyHeight = font(scale, 54);
  return (
    <View style={styles.wrap}>
      {ROWS.map((row) => (
        <View key={row} style={styles.row}>
          {row.split('').map((letter) => (
            <Pressable
              key={letter}
              testID={`key-${letter}`}
              accessibilityLabel={letter}
              onPress={() => {
                tick();
                onKey(letter);
              }}
              style={({ pressed }) => [
                styles.key,
                {
                  minHeight: keyHeight,
                  backgroundColor: pressed ? colors.accent : '#fff',
                  borderColor: colors.line,
                },
              ]}
            >
              <Text style={[styles.letter, { fontSize: font(scale, 22), color: colors.ink }]}>{letter}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        {'ZXCVBNM'.split('').map((letter) => (
          <Pressable
            key={letter}
            testID={`key-${letter}`}
            accessibilityLabel={letter}
            onPress={() => {
              tick();
              onKey(letter);
            }}
            style={({ pressed }) => [
              styles.key,
              { minHeight: keyHeight, backgroundColor: pressed ? colors.accent : '#fff', borderColor: colors.line },
            ]}
          >
            <Text style={[styles.letter, { fontSize: font(scale, 22), color: colors.ink }]}>{letter}</Text>
          </Pressable>
        ))}
        <Pressable
          testID="key-back"
          accessibilityLabel="Delete"
          onPress={() => {
            tick();
            onDelete();
          }}
          style={({ pressed }) => [
            styles.key,
            styles.wide,
            { minHeight: keyHeight, backgroundColor: pressed ? colors.accent : '#fff', borderColor: colors.line },
          ]}
        >
          <Text style={[styles.letter, { fontSize: font(scale, 20) }]}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  key: {
    flex: 1,
    maxWidth: 44,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wide: { flex: 1.45, maxWidth: 68 },
  letter: { fontFamily: 'AtkinsonBold', fontWeight: '800' },
});
