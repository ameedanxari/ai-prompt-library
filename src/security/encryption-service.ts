/**
 * Encryption Service
 *
 * Provides AES-256-GCM encryption for sensitive data at rest
 * and key management utilities.
 *
 * Validates: Requirements 10.2, 10.3
 */

import * as crypto from 'crypto';

/**
 * Encrypted payload structure
 */
export interface EncryptedPayload {
  iv: string;       // hex
  authTag: string;  // hex
  ciphertext: string; // hex
}

export class EncryptionService {
  private algorithm = 'aes-256-gcm' as const;
  private keyLength = 32; // bytes

  /**
   * Derives an encryption key from a passphrase
   */
  public deriveKey(passphrase: string, salt?: string): Buffer {
    const s = salt || crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(passphrase, s, 100000, this.keyLength, 'sha512');
  }

  /**
   * Encrypts a plaintext string
   */
  public encrypt(plaintext: string, key: Buffer): EncryptedPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return { iv: iv.toString('hex'), authTag, ciphertext };
  }

  /**
   * Decrypts an encrypted payload
   */
  public decrypt(payload: EncryptedPayload, key: Buffer): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(payload.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

    let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    return plaintext;
  }

  /**
   * Generates a random encryption key
   */
  public generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Hashes a value using SHA-256 (one-way)
   */
  public hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}
