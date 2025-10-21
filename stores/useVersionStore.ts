import { create } from 'zustand';
import type { VersionCheckResult } from '@/types/version';

interface VersionState {
  versionCheckResult: VersionCheckResult | null;
  showUpdateModal: boolean;
  hasCheckedVersion: boolean;
  setVersionCheckResult: (result: VersionCheckResult | null) => void;
  setShowUpdateModal: (show: boolean) => void;
  setHasCheckedVersion: (checked: boolean) => void;
}

export const useVersionStore = create<VersionState>((set) => ({
  versionCheckResult: null,
  showUpdateModal: false,
  hasCheckedVersion: false,
  setVersionCheckResult: (result) => set({ versionCheckResult: result }),
  setShowUpdateModal: (show) => set({ showUpdateModal: show }),
  setHasCheckedVersion: (checked) => set({ hasCheckedVersion: checked }),
}));
