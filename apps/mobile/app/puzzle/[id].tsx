import { useLocalSearchParams } from 'expo-router';

import { PuzzlePlay } from '@/src/ui/PuzzlePlay';

export default function PuzzleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PuzzlePlay puzzleId={String(id ?? '')} />;
}
