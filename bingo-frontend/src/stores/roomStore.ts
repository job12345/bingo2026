import { create } from 'zustand';
import { Room } from '@/types';
import { RoomService } from '@/services';

/**
 * Room Store State
 */
interface RoomState {
  // State
  rooms: Room[];
  currentRoom: Room | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRooms: (isActive?: boolean) => Promise<void>;
  fetchRoomById: (roomId: string) => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  clearError: () => void;
}

/**
 * Room Store
 */
export const useRoomStore = create<RoomState>((set, get) => ({
  // Initial State
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,

  // Fetch Rooms
  fetchRooms: async (isActive = true) => {
    try {
      set({ isLoading: true, error: null });
      const rooms = await RoomService.getAllRooms(isActive);
      set({ rooms, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch Room by ID
  fetchRoomById: async (roomId) => {
    try {
      set({ isLoading: true, error: null });
      const room = await RoomService.getRoomById(roomId);
      set({ currentRoom: room, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set Current Room
  setCurrentRoom: (room) => {
    set({ currentRoom: room });
  },

  // Update Room
  updateRoom: (roomId, updates) => {
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === roomId ? { ...room, ...updates } : room)),
      currentRoom: state.currentRoom?.id === roomId ? { ...state.currentRoom, ...updates } : state.currentRoom,
    }));
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },
}));
