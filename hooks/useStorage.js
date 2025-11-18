import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);

  // Carrega ao iniciar
  useEffect(() => {
    async function load() {
      const stored = await AsyncStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    }
    load();
  }, []);

  // Salva automaticamente sempre que mudar
  useEffect(() => {
    AsyncStorage.setItem(key, JSON.stringify(value));
  }, [value]);

  return [value, setValue];
}

