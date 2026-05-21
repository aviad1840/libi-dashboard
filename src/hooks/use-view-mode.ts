import { usePersistedState } from "./use-persisted-state";

export type ViewMode = "coordinator" | "national";

export function useViewMode(): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = usePersistedState<ViewMode>("view-mode", "coordinator");
  return [mode, setMode];
}
