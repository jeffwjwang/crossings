import { scorePlay } from '@crossings/scoring';
import { decryptSecret, type Puzzle, type PuzzleSecret } from '@crossings/puzzle-schema';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  AppState,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadPuzzle } from '../api/loader';
import { SAMPLE_NUMBER } from '../content/catalog';
import {
  buildContext,
  createInitialState,
  isDiscovered,
  isLocked,
  reduce,
  solvedCount,
  totalHints,
  wrongCells,
} from '../game/logic';
import { buildShareText, difficultyLabel, maskPlaceName } from '../game/share';
import type { GameAction, GameContext, GameState } from '../game/types';
import { MapCanvas } from '../render/MapCanvas';
import { clearPlay, loadPlay, recordCompletion, savePlay } from '../storage/progress';
import { Keyboard } from './Keyboard';
import { useSettings } from './settings';
import { font, palette } from './theme';

function mergeSave(initial: GameState, saved: GameState): GameState {
  return {
    ...initial,
    ...saved,
    entries: { ...initial.entries, ...saved.entries },
    hinted: { ...initial.hinted, ...saved.hinted },
    prefilled: initial.prefilled,
    solved: { ...initial.solved, ...saved.solved },
    hintsOnWord: { ...initial.hintsOnWord, ...saved.hintsOnWord },
    wrongChecksOnWord: { ...initial.wrongChecksOnWord, ...saved.wrongChecksOnWord },
    finaleVisible: false,
    cardWordId: null,
    feedback: null,
  };
}

export function PuzzlePlay({ puzzleId }: { puzzleId: string }) {
  const router = useRouter();
  const settings = useSettings();
  const colors = palette(settings.highContrast);
  const scale = settings.textScale;
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [secret, setSecret] = useState<PuzzleSecret | null>(null);
  const [ctx, setCtx] = useState<GameContext | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listMode, setListMode] = useState(false);
  const [streetsOpen, setStreetsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState(0);
  const [appActive, setAppActive] = useState(true);
  const [revealWordId, setRevealWordId] = useState<string | null>(null);
  const seenSolved = useRef<Set<string> | null>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let live = true;
    setReady(false);
    setError(null);
    void loadPuzzle(puzzleId).then(async (loaded) => {
      if (!live) return;
      if (!loaded?.key) {
        setError(loaded ? 'This puzzle is not unlocked yet.' : 'This difficulty is not in the sample yet.');
        setPuzzle(null);
        setReady(true);
        return;
      }
      try {
        const opened = decryptSecret(loaded.puzzle.secret, loaded.key);
        const nextCtx = buildContext(loaded.puzzle, opened.answers);
        const initial = createInitialState(nextCtx);
        const saved = await loadPlay(loaded.puzzle.id);
        if (!live) return;
        setPuzzle(loaded.puzzle);
        setSecret(opened);
        setCtx(nextCtx);
        setState(saved ? mergeSave(initial, saved) : initial);
        seenSolved.current = null;
      } catch {
        setError('This puzzle could not be opened.');
      } finally {
        if (live) setReady(true);
      }
    });
    return () => {
      live = false;
    };
  }, [puzzleId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => setAppActive(next === 'active'));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!ctx || !state || state.completed || state.cardWordId || state.finaleVisible || !appActive) return undefined;
    const timer = setInterval(() => {
      setState((current) => {
        if (!current || current.completed || current.cardWordId || current.finaleVisible) return current;
        return reduce(ctx, current, { type: 'addTime', seconds: 1 });
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [appActive, ctx, state?.cardWordId, state?.completed, state?.finaleVisible]);

  useEffect(() => {
    if (!ready || !puzzle || !state) return undefined;
    const timer = setTimeout(() => void savePlay(puzzle.id, state), 350);
    return () => clearTimeout(timer);
  }, [puzzle, ready, state]);

  useEffect(() => {
    if (!puzzle || !state?.completed) return;
    void recordCompletion(puzzle.id).then((next) => setStreak(next.current));
  }, [puzzle, state?.completed]);

  const solvedKey = state
    ? Object.entries(state.solved)
        .filter(([, on]) => on)
        .map(([id]) => id)
        .join('|')
    : '';
  useEffect(() => {
    const solved = new Set(solvedKey ? solvedKey.split('|') : []);
    if (!seenSolved.current) {
      seenSolved.current = solved;
      return;
    }
    const fresh = [...solved].find((id) => id && !seenSolved.current?.has(id));
    seenSolved.current = solved;
    if (!fresh) return undefined;
    setRevealWordId(fresh);
    const timer = setTimeout(() => setRevealWordId(null), 900);
    return () => clearTimeout(timer);
  }, [solvedKey]);

  useEffect(() => {
    if (!state?.failNonce) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shake, state?.failNonce]);

  const dispatch = (action: GameAction) => {
    if (!ctx) return;
    setState((current) => (current ? reduce(ctx, current, action) : current));
  };

  const discovered = useMemo(() => {
    const ids = new Set<string>();
    if (!ctx || !state) return ids;
    for (const word of ctx.puzzle.words) {
      if (isDiscovered(ctx, state, word.id)) ids.add(word.id);
    }
    return ids;
  }, [ctx, state]);

  if (!ready) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: colors.night }]}>
        <Text style={styles.loading}>Opening the map…</Text>
      </SafeAreaView>
    );
  }
  if (error || !puzzle || !secret || !ctx || !state) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: colors.panel, padding: 20 }]}>
        <Text style={[styles.errorTitle, { fontSize: font(scale, 28) }]}>Not ready</Text>
        <Text style={[styles.errorBody, { fontSize: font(scale, 18) }]}>{error}</Text>
        <Pressable onPress={() => router.back()} style={styles.primary}>
          <Text style={styles.primaryText}>Back to today</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const word = puzzle.words.find((item) => item.id === state.currentWordId) ?? puzzle.words[0];
  if (!word) return null;
  const wordIndex = puzzle.words.findIndex((item) => item.id === word.id);
  const bad = new Set(wrongCells(ctx, state));
  const hintsLeft = puzzle.rules.maxHints == null ? null : Math.max(0, puzzle.rules.maxHints - totalHints(state));
  const card = state.cardWordId
    ? puzzle.knowledgeCards.find((item) => item.id === puzzle.words.find((w) => w.id === state.cardWordId)?.cardId)
    : null;
  const minutes = state.activeSeconds > 0 ? Math.max(1, Math.round(state.activeSeconds / 60)) : null;
  const share = buildShareText({
    number: SAMPLE_NUMBER,
    difficulty: puzzle.difficulty,
    wordIds: puzzle.words.map((item) => item.id),
    hintsOnWord: state.hintsOnWord,
    totalHints: totalHints(state),
    minutes,
  });
  const score = scorePlay({
    difficulty: puzzle.difficulty,
    words: puzzle.words.map((item) => ({
      id: item.id,
      nonPrefilledLetters: item.cellIds.filter((cellId) => !state.prefilled[cellId]).length,
      hintedLetters: state.hintsOnWord[item.id] ?? 0,
      wrongChecks: state.wrongChecksOnWord[item.id] ?? 0,
    })),
    activeSeconds: state.activeSeconds,
    targetSeconds: puzzle.rules.targetSeconds,
    hintsUsed: totalHints(state),
    whereAmICorrect: state.whereAmICorrect === true,
    streak,
  });
  const where = puzzle.finale.whereAmI;
  const showGuess =
    where &&
    !state.completed &&
    !state.whereAmIGuess &&
    solvedCount(state) >= where.askAfterSolvedCount;
  const mapHeight = Math.max(240, Math.round(Dimensions.get('window').height * 0.34));

  const reset = () => {
    Alert.alert('Start again?', 'This clears your letters for this puzzle.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start again',
        style: 'destructive',
        onPress: () => {
          void clearPlay(puzzle.id);
          seenSolved.current = new Set();
          setState(createInitialState(ctx));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors.panel }]}>
      <View style={[styles.header, { backgroundColor: colors.night }]}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Today</Text>
        </Pressable>
        <Text style={styles.progress}>
          {solvedCount(state)} of {puzzle.words.length} streets explored
        </Text>
        <Pressable accessibilityLabel={listMode ? 'Show map' : 'List mode'} onPress={() => setListMode((on) => !on)}>
          <Text style={styles.backText}>{listMode ? 'Map' : 'List'}</Text>
        </Pressable>
      </View>
      <Text style={[styles.where, { color: colors.gold, backgroundColor: colors.night }]}>
        {state.completed
          ? `Today you explored: ${secret.locationName}`
          : `Where am I today?  ·  ${difficultyLabel(puzzle.difficulty)}`}
      </Text>
      <View style={{ height: mapHeight }}>
        {listMode ? (
          <ScrollView style={{ backgroundColor: colors.panel }} contentContainerStyle={{ padding: 12 }}>
            {puzzle.words.map((item, index) => renderStreet(item.id, index))}
          </ScrollView>
        ) : (
          <MapCanvas
            puzzle={puzzle}
            secret={secret}
            state={state}
            colors={colors}
            discovered={discovered}
            revealWordId={revealWordId}
            showLength={puzzle.rules.showWordLengthOnMap}
            onTapCell={(cellId) => {
              const cell = puzzle.cells.find((item) => item.id === cellId);
              const owners = cell?.wordIds.filter((id) => discovered.has(id)) ?? [];
              if (!owners.length) return;
              let next = owners.includes(state.currentWordId) ? state.currentWordId : owners[0];
              const current = puzzle.words.find((item) => item.id === state.currentWordId);
              if (
                next &&
                owners.length > 1 &&
                next === state.currentWordId &&
                current?.cellIds[state.cursor] === cellId
              ) {
                next = owners.find((id) => id !== state.currentWordId) ?? next;
              }
              const target = puzzle.words.find((item) => item.id === next);
              if (!target || !next) return;
              dispatch({ type: 'select', wordId: next, index: Math.max(0, target.cellIds.indexOf(cellId)) });
            }}
          />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.panel} keyboardShouldPersistTaps="handled">
        <View style={[styles.clue, { borderColor: colors.line }]}>
          <Text style={[styles.meta, { fontSize: font(scale, 15), color: colors.muted }]}>
            Street {wordIndex + 1} · {word.length} letters
            {state.solved[word.id] ? ' · solved' : ''}
          </Text>
          <Text testID="clue-text" style={[styles.clueText, { fontSize: font(scale, 22) }]}>
            {word.clue.text}
          </Text>
          <Animated.View style={{ transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.letters}>
              {word.cellIds.map((cellId, index) => {
                const locked = isLocked(ctx, state, cellId);
                const active = index === state.cursor && !state.solved[word.id];
                return (
                  <Pressable
                    key={cellId}
                    testID={`letter-${index}`}
                    onPress={() => dispatch({ type: 'select', wordId: word.id, index })}
                    style={[
                      styles.letter,
                      {
                        borderColor: bad.has(cellId) ? colors.bad : colors.line,
                        backgroundColor: locked ? colors.ok : active ? colors.accent : '#fff',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: 'AtkinsonBold',
                        fontSize: font(scale, 26),
                        color: state.hinted[cellId] ? colors.hint : state.prefilled[cellId] ? colors.prefill : bad.has(cellId) ? colors.bad : colors.ink,
                      }}
                    >
                      {state.entries[cellId] ?? ''}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
          <Text style={[styles.feedback, { color: state.feedback?.tone === 'bad' ? colors.bad : colors.okDark, fontSize: font(scale, 17) }]}>
            {state.feedback?.text ?? ''}
          </Text>
          <View style={styles.actions}>
            <Pressable
              testID="speak"
              accessibilityLabel="Read the clue"
              onPress={() => Speech.speak(word.clue.text, { rate: 0.92 })}
              style={[styles.secondary, { borderColor: colors.line }]}
            >
              <Text style={[styles.actionText, { fontSize: font(scale, 18) }]}>Speak</Text>
            </Pressable>
            <Pressable
              testID="hint"
              accessibilityLabel="Hint"
              onPress={() => dispatch({ type: 'hint' })}
              style={[styles.secondary, { borderColor: colors.line, opacity: hintsLeft === 0 ? 0.45 : 1 }]}
            >
              <Text style={[styles.actionText, { fontSize: font(scale, 18) }]}>
                Hint{hintsLeft == null ? '' : ` · ${hintsLeft} left`}
              </Text>
            </Pressable>
            <Pressable testID="check" accessibilityLabel="Check" onPress={() => dispatch({ type: 'check' })} style={styles.primary}>
              <Text style={[styles.primaryText, { fontSize: font(scale, 18) }]}>✓ Check</Text>
            </Pressable>
          </View>
        </View>
        {showGuess && where ? (
          <View style={styles.guess}>
            <Text style={[styles.guessTitle, { fontSize: font(scale, 18) }]}>Guess the suburb — one try</Text>
            {where.options.map((option) => (
              <Pressable key={option} onPress={() => dispatch({ type: 'guessWhere', option })} style={styles.guessOption}>
                <Text style={{ fontFamily: 'AtkinsonBold', fontSize: font(scale, 18) }}>{option}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Keyboard
          colors={colors}
          scale={scale}
          onKey={(letter) => dispatch({ type: 'type', letter })}
          onDelete={() => dispatch({ type: 'backspace' })}
        />
        <Pressable onPress={() => setStreetsOpen((open) => !open)} style={styles.streetsToggle}>
          <Text style={[styles.streetsTitle, { fontSize: font(scale, 18) }]}>
            {streetsOpen ? 'Hide streets' : 'Streets to explore'}
          </Text>
        </Pressable>
        {streetsOpen ? <View style={{ gap: 8 }}>{puzzle.words.map((item, index) => renderStreet(item.id, index))}</View> : null}
        <Pressable onPress={reset} style={[styles.secondary, { borderColor: colors.line, marginTop: 8 }]}>
          <Text style={styles.actionText}>Start again</Text>
        </Pressable>
      </ScrollView>
      {card ? (
        <View style={styles.card}>
          <Text style={styles.cardKicker}>
            Discovery {solvedCount(state)} of {puzzle.words.length}
          </Text>
          <Text style={[styles.cardTitle, { fontSize: font(scale, 22) }]}>{card.title}</Text>
          <Text style={[styles.cardBody, { fontSize: font(scale, 18) }]}>
            You uncovered {maskPlaceName(secret.streets[state.cardWordId ?? ''] ?? '', secret.locationName, state.completed)}.
          </Text>
          <Text style={[styles.cardBody, { fontSize: font(scale, 18) }]}>{card.body}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => dispatch({ type: 'dismissCard' })} style={[styles.secondary, { borderColor: colors.line }]}>
              <Text style={styles.actionText}>Close</Text>
            </Pressable>
            {state.completed ? (
              <Pressable testID="open-finale" onPress={() => dispatch({ type: 'showFinale' })} style={styles.primary}>
                <Text style={styles.primaryText}>Where was I?</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  dispatch({ type: 'dismissCard' });
                  dispatch({ type: 'nextUnsolved' });
                }}
                style={styles.primary}
              >
                <Text style={styles.primaryText}>Next street ▶</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}
      {state.completed && !state.finaleVisible && !card ? (
        <Pressable onPress={() => dispatch({ type: 'showFinale' })} style={styles.reopen}>
          <Text style={styles.primaryText}>Map complete — where was I?</Text>
        </Pressable>
      ) : null}
      {state.finaleVisible ? (
        <View testID="finale" style={styles.finaleScrim}>
          <View style={styles.finale}>
            <Text style={{ fontSize: 36 }}>🗺️</Text>
            <Text style={[styles.finaleTitle, { fontSize: font(scale, 28) }]}>Map complete!</Text>
            <Text style={{ fontSize: font(scale, 18) }}>Today you explored:</Text>
            <Text testID="place-name" style={[styles.place, { fontSize: font(scale, 30) }]}>
              {secret.locationName}
            </Text>
            <Text style={{ fontSize: font(scale, 16), textAlign: 'center' }}>
              {puzzle.words.length} streets · {totalHints(state)} hint{totalHints(state) === 1 ? '' : 's'}
              {minutes != null ? ` · about ${minutes} min` : ''} · score {score.score}
            </Text>
            <Text testID="share-text" style={styles.share}>
              {share}
            </Text>
            <Text style={styles.scoreNote}>Score is a preview on this phone. A later version checks it on the server.</Text>
            {copied ? <Text style={styles.copied}>Copied. Paste it to your family or friends.</Text> : null}
            <View style={styles.actions}>
              <Pressable
                testID="copy-share"
                onPress={() => {
                  void Clipboard.setStringAsync(share).then(() => setCopied(true));
                }}
                style={styles.primary}
              >
                <Text style={styles.primaryText}>Copy share text</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  void Share.share({ message: share });
                }}
                style={[styles.secondary, { borderColor: colors.line }]}
              >
                <Text style={styles.actionText}>Share</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => dispatch({ type: 'hideFinale' })} style={[styles.secondary, { borderColor: colors.line }]}>
              <Text style={styles.actionText}>Look at the map</Text>
            </Pressable>
            <Text style={styles.footer}>Crossings · by Vervia</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );

  function renderStreet(id: string, index: number) {
    const item = puzzle?.words.find((wordItem) => wordItem.id === id);
    if (!item || !secret || !state) return null;
    const open = discovered.has(id);
    const solved = Boolean(state.solved[id]);
    const label = solved
      ? `✔ ${secret.answers[id]} — ${maskPlaceName(secret.streets[id] ?? '', secret.locationName, state.completed)}`
      : open
        ? `${index + 1}. ${item.clue.text} (${item.length})`
        : 'Hidden in the fog — solve a street that crosses it.';
    return (
      <Pressable
        key={id}
        disabled={!open}
        onPress={() => dispatch({ type: 'select', wordId: id })}
        style={[styles.streetRow, id === state.currentWordId && { backgroundColor: colors.select }]}
      >
        <Text style={{ fontSize: font(scale, 17), color: open ? colors.ink : '#777', fontFamily: solved ? 'AtkinsonBold' : 'Atkinson' }}>
          {label}
        </Text>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  loading: { color: '#fff', textAlign: 'center', marginTop: 80, fontSize: 20, fontFamily: 'Atkinson' },
  errorTitle: { fontFamily: 'AtkinsonBold', marginBottom: 8 },
  errorBody: { fontFamily: 'Atkinson', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 },
  back: { minHeight: 44, justifyContent: 'center' },
  backText: { color: '#fff', fontFamily: 'AtkinsonBold', fontSize: 17 },
  progress: { color: '#fff', fontFamily: 'Atkinson', fontSize: 15 },
  where: { fontFamily: 'Atkinson', fontStyle: 'italic', fontSize: 16, paddingHorizontal: 12, paddingBottom: 8 },
  panel: { padding: 12, gap: 10, paddingBottom: 28 },
  clue: { backgroundColor: '#fff', borderWidth: 3, borderRadius: 14, padding: 12 },
  meta: { fontFamily: 'AtkinsonBold', textTransform: 'uppercase', letterSpacing: 0.4 },
  clueText: { fontFamily: 'Atkinson', marginVertical: 8, lineHeight: 28 },
  letters: { gap: 5, paddingVertical: 4 },
  letter: {
    width: 40,
    height: 50,
    borderWidth: 2.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: { minHeight: 24, fontFamily: 'AtkinsonBold', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  primary: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#ffcf33',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryText: { fontFamily: 'AtkinsonBold', fontSize: 18, color: '#16130f' },
  secondary: {
    flex: 1,
    minHeight: 52,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionText: { fontFamily: 'AtkinsonBold', fontSize: 17, color: '#16130f' },
  guess: { backgroundColor: '#fff', borderRadius: 14, padding: 12, gap: 8, borderWidth: 2, borderColor: '#16130f' },
  guessTitle: { fontFamily: 'AtkinsonBold' },
  guessOption: { minHeight: 48, borderWidth: 2, borderColor: '#16130f', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  streetsToggle: { minHeight: 44, justifyContent: 'center' },
  streetsTitle: { fontFamily: 'AtkinsonBold' },
  streetRow: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8 },
  card: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    backgroundColor: '#fffaf0',
    borderWidth: 3,
    borderColor: '#8a6d2b',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  cardKicker: { fontFamily: 'AtkinsonBold', color: '#6b4e12', fontSize: 16 },
  cardTitle: { fontFamily: 'AtkinsonBold' },
  cardBody: { fontFamily: 'Atkinson', lineHeight: 24 },
  reopen: { position: 'absolute', left: 16, right: 16, bottom: 16, backgroundColor: '#ffcf33', minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  finaleScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,8,16,0.62)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  finale: { backgroundColor: '#fffaf0', borderWidth: 4, borderColor: '#8a6d2b', borderRadius: 18, padding: 18, width: '100%', maxWidth: 480, alignItems: 'center', gap: 8 },
  finaleTitle: { fontFamily: 'AtkinsonBold' },
  place: { fontFamily: 'AtkinsonBold', color: '#6b4e12', textAlign: 'center' },
  share: { alignSelf: 'stretch', fontFamily: 'Atkinson', fontSize: 16, lineHeight: 22, backgroundColor: '#fff', borderWidth: 2, borderColor: '#333', borderRadius: 10, padding: 8 },
  scoreNote: { fontFamily: 'Atkinson', fontSize: 13, color: '#5a4a2a', textAlign: 'center' },
  copied: { color: '#1e5e22', fontFamily: 'AtkinsonBold' },
  footer: { fontFamily: 'Atkinson', color: '#6b4e12', marginTop: 4 },
});
