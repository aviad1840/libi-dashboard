import { useCallback, useEffect, useRef, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";

export function usePersistedState<T>(name: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => loadJSON(name, initial));
  const nameRef = useRef(name);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  const update = useCallback((v: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      saveJSON(nameRef.current, next);
      return next;
    });
  }, []);

  return [state, update];
}
