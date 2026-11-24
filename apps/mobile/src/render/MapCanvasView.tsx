import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
  Skia,
  Text as SkiaText,
  useFont,
} from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Puzzle, PuzzleSecret } from '@crossings/puzzle-schema';

import type { GameState } from '../game/types';
import { maskPlaceName } from '../game/share';
import type { Palette } from '../ui/theme';

function useSkiaReady(): boolean {
  const [ready, setReady] = useState(Platform.OS !== 'web');
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    let live = true;
    void (async () => {
      try {
        const web = await import('@shopify/react-native-skia/lib/module/web');
        if (typeof web.LoadSkiaWeb === 'function') await web.LoadSkiaWeb();
      } catch {
        // Expo's web bundle often loads CanvasKit for us.
      }
      if (live) setReady(true);
    })();
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

function FogHole({ cx, cy, radius, animate }: { cx: number; cy: number; radius: number; animate: boolean }) {
  const r = useSharedValue(animate ? 0 : radius);
  useEffect(() => {
    r.value = animate ? withTiming(radius, { duration: 800 }) : radius;
  }, [animate, r, radius]);
  return <Circle cx={cx} cy={cy} r={r} color="#000" />;
}

function makePath(pts: [number, number][]) {
  const path = Skia.PathBuilder.Make();
  pts.forEach((point, index) => {
    if (index === 0) path.moveTo(point[0], point[1]);
    else path.lineTo(point[0], point[1]);
  });
  return path.build();
}

function cameraFor(x0: number, y0: number, x1: number, y1: number, viewW: number, viewH: number, pad: number) {
  const width = Math.max(40, x1 - x0);
  const height = Math.max(40, y1 - y0);
  const scale = Math.min((viewW - pad * 2) / width, (viewH - pad * 2) / height);
  const safe = Math.max(0.15, Math.min(scale, 8));
  const worldW = viewW / safe;
  const worldH = viewH / safe;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { scale: safe, originX: cx - worldW / 2, originY: cy - worldH / 2 };
}

export function MapCanvasView({
  puzzle,
  secret,
  state,
  colors,
  discovered,
  revealWordId,
  onTapCell,
  showLength,
}: {
  puzzle: Puzzle;
  secret: PuzzleSecret;
  state: GameState;
  colors: Palette;
  discovered: Set<string>;
  revealWordId: string | null;
  onTapCell: (cellId: number) => void;
  showLength: boolean;
}) {
  const ready = useSkiaReady();
  const font = useFont(require('../../assets/fonts/AtkinsonHyperlegible-Bold.ttf'), 12);
  const small = useFont(require('../../assets/fonts/AtkinsonHyperlegible-Bold.ttf'), 7);
  const labelFont = useFont(require('../../assets/fonts/AtkinsonHyperlegible-Bold.ttf'), 11);
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const scale = useSharedValue(1);
  const viewW = useSharedValue(300);
  const viewH = useSharedValue(280);
  const [size, setSize] = useState({ w: 300, h: 280 });
  const gestureStart = useSharedValue({ x: 0, y: 0, s: 1 });

  const roads = useMemo(
    () =>
      ready
        ? puzzle.background.roads.map((road) => ({
            id: road.id,
            cls: road.cls,
            path: makePath(road.pts),
          }))
        : [],
    [puzzle, ready],
  );
  const wordPaths = useMemo(
    () => (ready ? new Map(puzzle.words.map((word) => [word.id, makePath(word.path)])) : new Map()),
    [puzzle, ready],
  );

  const fit = (wordIds: string[], pad: number) => {
    const cells = puzzle.cells.filter((cell) => cell.wordIds.some((id) => wordIds.includes(id)));
    if (!cells.length || size.w < 20) return;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const cell of cells) {
      x0 = Math.min(x0, cell.x);
      y0 = Math.min(y0, cell.y);
      x1 = Math.max(x1, cell.x);
      y1 = Math.max(y1, cell.y);
    }
    const next = cameraFor(x0, y0, x1, y1, size.w, size.h, pad);
    originX.value = withTiming(next.originX, { duration: 420 });
    originY.value = withTiming(next.originY, { duration: 420 });
    scale.value = withTiming(next.scale, { duration: 420 });
  };

  useEffect(() => {
    const ids = state.completed
      ? puzzle.words.map((word) => word.id)
      : puzzle.words.filter((word) => discovered.has(word.id)).map((word) => word.id);
    fit(ids.length ? ids : [puzzle.startWordId], state.completed ? 70 : 48);
  }, [state.currentWordId, state.completed, discovered.size, size.w, size.h, revealWordId]);

  const transform = useDerivedValue(() => [
    { translateX: -originX.value * scale.value },
    { translateY: -originY.value * scale.value },
    { scale: scale.value },
  ]);

  const fogOpacity = useSharedValue(state.completed ? 0 : 0.96);
  useEffect(() => {
    fogOpacity.value = withTiming(state.completed ? 0 : 0.96, { duration: state.completed ? 1400 : 180 });
  }, [fogOpacity, state.completed]);

  const tapWorld = (x: number, y: number) => {
    let best: { id: number; dist: number } | null = null;
    for (const cell of puzzle.cells) {
      if (!cell.wordIds.some((id) => discovered.has(id))) continue;
      const dist = Math.hypot(cell.x - x, cell.y - y);
      if (dist < 16 && (!best || dist < best.dist)) best = { id: cell.id, dist };
    }
    if (best) onTapCell(best.id);
  };

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      gestureStart.value = { x: originX.value, y: originY.value, s: scale.value };
    })
    .onUpdate((event) => {
      const next = Math.max(0.2, Math.min(12, gestureStart.value.s * event.scale));
      const wx = gestureStart.value.x + event.focalX / gestureStart.value.s;
      const wy = gestureStart.value.y + event.focalY / gestureStart.value.s;
      scale.value = next;
      originX.value = wx - event.focalX / next;
      originY.value = wy - event.focalY / next;
    });
  const pan = Gesture.Pan()
    .onBegin(() => {
      gestureStart.value = { x: originX.value, y: originY.value, s: scale.value };
    })
    .onUpdate((event) => {
      originX.value = gestureStart.value.x - event.translationX / gestureStart.value.s;
      originY.value = gestureStart.value.y - event.translationY / gestureStart.value.s;
    });
  const tap = Gesture.Tap()
    .maxDistance(14)
    .onEnd((event) => {
      const x = originX.value + event.x / scale.value;
      const y = originY.value + event.y / scale.value;
      runOnJS(tapWorld)(x, y);
    });
  const gesture = Gesture.Simultaneous(pinch, pan, tap);

  const zoom = (factor: number) => {
    const s0 = scale.value;
    const s1 = Math.max(0.2, Math.min(12, s0 * factor));
    const cx = viewW.value / 2;
    const cy = viewH.value / 2;
    const wx = originX.value + cx / s0;
    const wy = originY.value + cy / s0;
    scale.value = withTiming(s1, { duration: 180 });
    originX.value = withTiming(wx - cx / s1, { duration: 180 });
    originY.value = withTiming(wy - cy / s1, { duration: 180 });
  };

  const [bx0, by0, bx1, by1] = puzzle.bbox;
  const cellRadius = puzzle.cellSpacing * 0.46;

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={gesture}>
        <View
          style={styles.canvas}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            viewW.value = width;
            viewH.value = height;
            setSize({ w: width, h: height });
          }}
        >
          {ready ? (
            <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
              <Group transform={transform}>
                <Rect x={bx0 - 400} y={by0 - 400} width={bx1 - bx0 + 800} height={by1 - by0 + 800} color={colors.paper} />
                {roads.map((road) => (
                  <Path
                    key={road.id}
                    path={road.path}
                    style="stroke"
                    strokeWidth={[2.4, 4.2, 6.4, 8.5][road.cls] ?? 3}
                    color={colors.road}
                    strokeCap="round"
                    strokeJoin="round"
                  />
                ))}
                <Group layer opacity={fogOpacity}>
                  <Rect x={bx0 - 500} y={by0 - 500} width={bx1 - bx0 + 1000} height={by1 - by0 + 1000} color={colors.fog} />
                  <Group blendMode="dstOut">
                    <BlurMask blur={14} style="normal" />
                    {puzzle.words.map((word) =>
                      discovered.has(word.id)
                        ? word.cellIds.map((cellId) => {
                            const cell = puzzle.cells.find((item) => item.id === cellId);
                            if (!cell) return null;
                            return (
                              <FogHole
                                key={`${word.id}-${cellId}-${state.solved[word.id] ? 's' : 'd'}`}
                                cx={cell.x}
                                cy={cell.y}
                                radius={state.solved[word.id] ? 76 : 48}
                                animate={revealWordId === word.id}
                              />
                            );
                          })
                        : null,
                    )}
                  </Group>
                </Group>
                {puzzle.words.map((word) => {
                  if (!discovered.has(word.id)) return null;
                  const path = wordPaths.get(word.id);
                  if (!path) return null;
                  const selected = word.id === state.currentWordId && !state.completed;
                  const solved = Boolean(state.solved[word.id]);
                  return (
                    <Path
                      key={word.id}
                      path={path}
                      style="stroke"
                      strokeWidth={selected ? 8 : 4.5}
                      color={solved ? colors.okDark : selected ? '#ff9f1c' : '#e9c46a'}
                      strokeCap="round"
                      strokeJoin="round"
                      opacity={solved ? 0.8 : 1}
                    />
                  );
                })}
                {puzzle.cells.map((cell) => {
                  if (!cell.wordIds.some((id) => discovered.has(id))) return null;
                  const word = puzzle.words.find((item) => item.id === state.currentWordId);
                  const inWord = word?.cellIds.includes(cell.id) ?? false;
                  const active = inWord && word?.cellIds[state.cursor] === cell.id && !state.solved[state.currentWordId];
                  const locked = cell.wordIds.some((id) => state.solved[id]) || state.prefilled[cell.id];
                  const fill = locked ? colors.ok : active ? colors.accent : inWord ? colors.select : '#fffdf6';
                  const letter = state.entries[cell.id] ?? '';
                  const letterColor = state.hinted[cell.id] ? colors.hint : state.prefilled[cell.id] ? colors.prefill : colors.ink;
                  return (
                    <Group key={cell.id}>
                      {cell.wordIds.length > 1 ? (
                        <Circle cx={cell.x} cy={cell.y} r={cellRadius + 2.4} color={colors.line} style="stroke" strokeWidth={1.4} />
                      ) : null}
                      <Circle cx={cell.x} cy={cell.y} r={cellRadius} color={fill} />
                      <Circle cx={cell.x} cy={cell.y} r={cellRadius} color={active ? colors.line : colors.line} style="stroke" strokeWidth={active ? 2.4 : 1.5} />
                      {font && letter ? (
                        <SkiaText x={cell.x - 4.2} y={cell.y + 4} text={letter} font={font} color={letterColor} />
                      ) : null}
                    </Group>
                  );
                })}
                {showLength && small
                  ? puzzle.words.map((word) => {
                      if (!discovered.has(word.id) || state.solved[word.id] || word.id !== state.currentWordId) {
                        return null;
                      }
                      const cell = puzzle.cells.find((item) => item.id === word.cellIds[0]);
                      if (!cell) return null;
                      return (
                        <SkiaText
                          key={`len-${word.id}`}
                          x={cell.x + 12}
                          y={cell.y - 10}
                          text={`${word.length}`}
                          font={small}
                          color="#5a3d00"
                        />
                      );
                    })
                  : null}
                {puzzle.words.map((word, index) => {
                  if (!state.solved[word.id] || !labelFont) return null;
                  const path = word.path;
                  if (path.length < 2) return null;
                  const a = path[0];
                  const b = path[path.length - 1];
                  if (!a || !b) return null;
                  const mx = (a[0] + b[0]) / 2;
                  const my = (a[1] + b[1]) / 2;
                  const dx = b[0] - a[0];
                  const dy = b[1] - a[1];
                  const len = Math.hypot(dx, dy) || 1;
                  let angle = Math.atan2(dy, dx);
                  if (angle > Math.PI / 2) angle -= Math.PI;
                  if (angle < -Math.PI / 2) angle += Math.PI;
                  const label = maskPlaceName(secret.streets[word.id] ?? word.maskedStreet, secret.locationName, state.completed);
                  const x = mx - (dy / len) * 18;
                  const y = my + (dx / len) * 18;
                  return (
                    <Group key={`label-${word.id}`} transform={[{ translateX: x }, { translateY: y }, { rotate: angle }]}>
                      <Rect x={-label.length * 3.4} y={-12} width={label.length * 6.8} height={16} color={colors.panel} opacity={0.92} />
                      <SkiaText x={-label.length * 3.1} y={0} text={label} font={labelFont} color={colors.okDark} />
                      {small ? <SkiaText x={0} y={-18} text={String(index + 1)} font={small} color={colors.muted} /> : null}
                    </Group>
                  );
                })}
              </Group>
            </Canvas>
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.loading]} />
          )}
        </View>
      </GestureDetector>
      <View style={styles.buttons} pointerEvents="box-none">
        <Pressable
          accessibilityLabel="Whole map"
          onPress={() => fit(puzzle.words.filter((word) => discovered.has(word.id)).map((word) => word.id), 64)}
          style={styles.buttonFace}
        >
          <Text style={styles.buttonText}>Whole map</Text>
        </Pressable>
        <Pressable accessibilityLabel="Zoom in" onPress={() => zoom(1.35)} style={styles.buttonFace}>
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
        <Pressable accessibilityLabel="Zoom out" onPress={() => zoom(0.75)} style={styles.buttonFace}>
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
      </View>
      <View style={styles.attrib} pointerEvents="none">
        <Text style={styles.attribText}>Map data {puzzle.attribution.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#15131c' },
  canvas: { flex: 1 },
  loading: { backgroundColor: '#15131c' },
  buttons: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 8 },
  button: { minHeight: 44, justifyContent: 'center' },
  buttonFace: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(20,18,28,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 17, fontFamily: 'AtkinsonBold' },
  attrib: { position: 'absolute', right: 6, bottom: 4 },
  attribFace: {
    minHeight: 0,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  attribText: { fontSize: 11, fontFamily: 'Atkinson' },
});
