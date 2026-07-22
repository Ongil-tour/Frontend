import { create } from 'zustand';

interface MapState {
  category: string | null;
  distance: number;
  center: { lat: number; lng: number } | null;
  setCategory: (category: string | null) => void;
  setDistance: (distance: number) => void;
  setCenter: (center: { lat: number; lng: number }) => void;
}

export const useMapStore = create<MapState>((set) => ({
  category: null,
  distance: 5,
  center: null,
  setCategory: (category) => set({ category }),
  setDistance: (distance) => set({ distance }),
  setCenter: (center) => set({ center }),
}));
