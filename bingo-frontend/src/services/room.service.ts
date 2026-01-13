import { apiClient } from './api';
import { Room, DrawMode, BallSet } from '@/types';

/**
 * Room Service
 */
export class RoomService {
  /**
   * ดูรายการห้องทั้งหมด
   */
  static async getAllRooms(isActive?: boolean): Promise<Room[]> {
    return apiClient.get('/rooms', { isActive });
  }

  /**
   * ดูรายละเอียดห้อง
   */
  static async getRoomById(roomId: string): Promise<Room> {
    return apiClient.get(`/rooms/${roomId}`);
  }

  /**
   * สร้างห้องใหม่
   */
  static async createRoom(data: {
    name: string;
    drawMode: DrawMode;
    ballSet: BallSet;
    maxPlayers: number;
    maxRounds: number;
    cardPrice: number;
    maxCardsPerPlayer: number;
    feePercentage: number;
  }): Promise<Room> {
    return apiClient.post('/rooms', data);
  }

  /**
   * แก้ไขการตั้งค่าห้อง
   */
  static async updateRoom(roomId: string, data: Partial<Room>): Promise<Room> {
    return apiClient.put(`/rooms/${roomId}`, data);
  }

  /**
   * ปิดห้อง
   */
  static async deleteRoom(roomId: string): Promise<void> {
    return apiClient.delete(`/rooms/${roomId}`);
  }
}
