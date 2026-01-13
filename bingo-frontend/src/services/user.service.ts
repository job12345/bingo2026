import { apiClient } from './api';
import { User, UserStatistics, LeaderboardEntry } from '@/types';

/**
 * User Service
 */
export class UserService {
  /**
   * ดูข้อมูลผู้ใช้ปัจจุบัน
   */
  static async getCurrentUser(): Promise<User> {
    return apiClient.get('/users/me');
  }

  /**
   * อัปเดตข้อมูลผู้ใช้
   */
  static async updateProfile(data: {
    displayName?: string;
    avatarUrl?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
  }): Promise<User> {
    return apiClient.put('/users/me', data);
  }

  /**
   * ดูสถิติการเล่น
   */
  static async getStatistics(): Promise<UserStatistics> {
    return apiClient.get('/users/me/statistics');
  }

  /**
   * ดู Leaderboard (Top Winners)
   */
  static async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    return apiClient.get('/users/leaderboard', { limit });
  }

  /**
   * ดูข้อมูล User ตาม ID
   */
  static async getUserById(userId: string): Promise<User> {
    return apiClient.get(`/users/${userId}`);
  }
}
