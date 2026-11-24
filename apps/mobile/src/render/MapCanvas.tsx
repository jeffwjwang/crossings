import { useEffect, useState, type ComponentType } from 'react';
import { Platform, View } from 'react-native';

import type { Puzzle, PuzzleSecret } from '@crossings/puzzle-schema';

import type { GameState } from '../game/types';
import type { Palette } from '../ui/theme';

export interface MapCanvasProps {
  puzzle: Puzzle;
  secret: PuzzleSecret;
  state: GameState;
  colors: Palette;
  discovered: Set<string>;
  revealWordId: string | null;
  onTapCell: (cellId: number) => void;
  showLength: boolean;
}

/**
 * On web, CanvasKit has to exist before the Skia module is evaluated.
 * The drawing code is loaded only after that.
 */
export function MapCanvas(props: MapCanvasProps) {
  const [CanvasView, setCanvasView] = useState<ComponentType<MapCanvasProps> | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      if (Platform.OS === 'web') {
        const web = await import('@shopify/react-native-skia/lib/module/web');
        await web.LoadSkiaWeb({
          locateFile: (file: string) => `/${file}`,
        });
      }
      const mod = await import('./MapCanvasView');
      if (live) setCanvasView(() => mod.MapCanvasView);
    })();
    return () => {
      live = false;
    };
  }, []);

  if (!CanvasView) return <View style={{ flex: 1, backgroundColor: '#15131c' }} />;
  return <CanvasView {...props} />;
}
