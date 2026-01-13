import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * Hash Utility
 * สำหรับ Hashing และ Encryption
 */

export class HashUtil {
  /**
   * Hash Password (bcrypt)
   */
  static async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compare Password (bcrypt)
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate SHA256 Hash
   */
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate Random Token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }
}
