import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadSettings, saveSettings, type Settings } from '../storage/progress';

interface SettingsContextValue extends Settings {
  ready: boolean;
  setTextScale: (textScale: number) => void;
  setHighContrast: (highContrast: boolean) => void;
  setLastDifficulty: (lastDifficulty: Settings['lastDifficulty']) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    textScale: 1,
    highContrast: false,
    lastDifficulty: 'medium',
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    void loadSettings().then((stored) => {
      if (!live) return;
      setSettings(stored);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      ready,
      setTextScale: (textScale) => {
        const next = { ...settings, textScale };
        setSettings(next);
        void saveSettings(next);
      },
      setHighContrast: (highContrast) => {
        const next = { ...settings, highContrast };
        setSettings(next);
        void saveSettings(next);
      },
      setLastDifficulty: (lastDifficulty) => {
        const next = { ...settings, lastDifficulty };
        setSettings(next);
        void saveSettings(next);
      },
    }),
    [ready, settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
