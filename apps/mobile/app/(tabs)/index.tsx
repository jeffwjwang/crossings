import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LOCAL_SLOTS, bundledPuzzle, type DailySlot } from '@/src/content/catalog';
import { loadPlay, loadStreak } from '@/src/storage/progress';
import { useSettings } from '@/src/ui/settings';
import { font, palette } from '@/src/ui/theme';

interface SlotProgress {
  solved: number;
  total: number;
  done: boolean;
}

export default function TodayScreen() {
  const router = useRouter();
  const settings = useSettings();
  const colors = palette(settings.highContrast);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [progress, setProgress] = useState<Record<string, SlotProgress>>({});

  useFocusEffect(
    useCallback(() => {
      let live = true;
      void (async () => {
        const nextStreak = await loadStreak();
        const nextProgress: Record<string, SlotProgress> = {};
        for (const slot of LOCAL_SLOTS) {
          if (!slot.puzzleId || !slot.available) continue;
          const puzzle = bundledPuzzle(slot.puzzleId);
          const saved = await loadPlay(slot.puzzleId);
          if (!puzzle) continue;
          nextProgress[slot.puzzleId] = {
            solved: saved ? Object.values(saved.solved ?? {}).filter(Boolean).length : 0,
            total: puzzle.words.length,
            done: Boolean(saved?.completed),
          };
        }
        if (!live) return;
        setStreak({ current: nextStreak.current, best: nextStreak.best });
        setProgress(nextProgress);
      })();
      return () => {
        live = false;
      };
    }, []),
  );

  const open = (slot: DailySlot) => {
    if (!slot.available || !slot.puzzleId) return;
    settings.setLastDifficulty(slot.difficulty);
    router.push(`/puzzle/${slot.puzzleId}`);
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.night }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { fontSize: font(settings.textScale, 34) }]}>Crossings</Text>
        <Text style={styles.by}>by Vervia</Text>
        <Text style={[styles.ask, { fontSize: font(settings.textScale, 20) }]}>Where am I today?</Text>
        <Text style={styles.sample}>Sample puzzle · a real North Island neighbourhood</Text>
        <Text style={styles.streak}>
          Streak {streak.current} {streak.current === 1 ? 'day' : 'days'}
          {streak.best > streak.current ? ` · best ${streak.best}` : ''}
        </Text>
        {LOCAL_SLOTS.map((slot) => {
          const info = slot.puzzleId ? progress[slot.puzzleId] : undefined;
          const selected = settings.lastDifficulty === slot.difficulty;
          const label = !slot.available ? 'Not in this sample' : info?.done ? 'Solved' : info && info.solved > 0 ? `Continue · ${info.solved} of ${info.total}` : 'Play';
          return (
            <Pressable
              key={slot.difficulty}
              testID={`difficulty-${slot.difficulty}`}
              disabled={!slot.available}
              onPress={() => open(slot)}
              style={[
                styles.card,
                { borderColor: selected ? colors.accent : '#3a3428', opacity: slot.available ? 1 : 0.55 },
              ]}
            >
              <Text style={[styles.cardTitle, { fontSize: font(settings.textScale, 24) }]}>{slot.label}</Text>
              <Text style={[styles.cardBody, { fontSize: font(settings.textScale, 16) }]}>{slot.summary}</Text>
              <View style={[styles.play, !slot.available && styles.playOff]}>
                <Text style={styles.playText}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: 18, paddingBottom: 32, gap: 10 },
  title: { color: '#fff', fontFamily: 'AtkinsonBold' },
  by: { color: '#ffd96a', fontFamily: 'Atkinson', fontSize: 16, marginTop: -6 },
  ask: { color: '#fff', fontFamily: 'Atkinson', fontStyle: 'italic', marginTop: 8 },
  sample: { color: '#e8e3f0', fontFamily: 'Atkinson', fontSize: 15 },
  streak: { color: '#ffd96a', fontFamily: 'AtkinsonBold', fontSize: 16, marginBottom: 6 },
  card: { backgroundColor: '#fffaf0', borderRadius: 16, borderWidth: 3, padding: 14, gap: 8 },
  cardTitle: { fontFamily: 'AtkinsonBold', color: '#16130f' },
  cardBody: { fontFamily: 'Atkinson', color: '#3a3226', lineHeight: 22 },
  play: { alignSelf: 'flex-start', backgroundColor: '#ffcf33', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  playOff: { backgroundColor: '#e6dcc4' },
  playText: { fontFamily: 'AtkinsonBold', fontSize: 16, color: '#16130f' },
});
