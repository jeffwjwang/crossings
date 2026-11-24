import * as Haptics from 'expo-haptics';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';

import { type Palette } from './theme';

const TOP = 'QWERTYUIOP';
const MIDDLE = 'ASDFGHJKL';
const BOTTOM = 'ZXCVBNM';
const GAP = 5;

function tick() {
  if (Platform.OS === 'web') return;
  void Haptics.selectionAsync();
}

/** Three full rows, sized from the screen width. Height is explicit so a row cannot collapse. */
export function keyboardMetrics(windowWidth: number): { keyWidth: number; keyHeight: number; deleteWidth: number } {
  const available = Math.max(260, windowWidth - 16);
  const keyWidth = Math.max(26, Math.floor((available - GAP * (TOP.length - 1)) / TOP.length));
  const keyHeight = Math.max(44, Math.min(48, keyWidth + 14));
  const deleteWidth = Math.min(keyWidth * 2 + GAP, Math.floor(available - BOTTOM.length * keyWidth - GAP * BOTTOM.length));
  return { keyWidth, keyHeight, deleteWidth: Math.max(keyWidth + 8, deleteWidth) };
}

export function Keyboard({
  colors,
  onKey,
  onDelete,
}: {
  colors: Palette;
  onKey: (letter: string) => void;
  onDelete: () => void;
}) {
  const { width } = useWindowDimensions();
  const { keyWidth, keyHeight, deleteWidth } = keyboardMetrics(width);
  const hitSlop = { top: 3, bottom: 3, left: 1, right: 1 };
  const letterSize = keyWidth >= 34 ? 20 : 17;

  const keyStyle = (pressed: boolean, widthPx: number) => [
    styles.key,
    {
      width: widthPx,
      height: keyHeight,
      backgroundColor: pressed ? colors.accent : '#fff',
      borderColor: colors.line,
    },
  ];

  const row = (letters: string) => (
    <View key={letters} style={[styles.row, { height: keyHeight, gap: GAP }]}>
      {letters.split('').map((letter) => (
        <Pressable
          key={letter}
          testID={`key-${letter}`}
          accessibilityLabel={letter}
          hitSlop={hitSlop}
          onPress={() => {
            tick();
            onKey(letter);
          }}
          style={({ pressed }) => keyStyle(pressed, keyWidth)}
        >
          <Text style={[styles.letter, { fontSize: letterSize, color: colors.ink }]}>{letter}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={[styles.wrap, { gap: GAP }]} testID="keyboard">
      {row(TOP)}
      {row(MIDDLE)}
      <View style={[styles.row, { height: keyHeight, gap: GAP }]}>
        {BOTTOM.split('').map((letter) => (
          <Pressable
            key={letter}
            testID={`key-${letter}`}
            accessibilityLabel={letter}
            hitSlop={hitSlop}
            onPress={() => {
              tick();
              onKey(letter);
            }}
            style={({ pressed }) => keyStyle(pressed, keyWidth)}
          >
            <Text style={[styles.letter, { fontSize: letterSize, color: colors.ink }]}>{letter}</Text>
          </Pressable>
        ))}
        <Pressable
          testID="key-back"
          accessibilityLabel="Delete"
          hitSlop={hitSlop}
          onPress={() => {
            tick();
            onDelete();
          }}
          style={({ pressed }) => keyStyle(pressed, deleteWidth)}
        >
          <Text style={[styles.letter, { fontSize: letterSize }]}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexShrink: 0, alignSelf: 'stretch' },
  row: { flexDirection: 'row', flexShrink: 0, justifyContent: 'center', alignItems: 'center' },
  key: {
    flexGrow: 0,
    flexShrink: 0,
    borderWidth: 2,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontFamily: 'AtkinsonBold', fontWeight: '800' },
});
