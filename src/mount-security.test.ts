import path from 'path';
import { describe, expect, it } from 'vitest';

import { matchesBlockedPattern } from './mount-security.js';

const DEFAULT_BLOCKED = [
  '.ssh',
  '.gnupg',
  '.gpg',
  '.aws',
  '.azure',
  '.gcloud',
  '.kube',
  '.docker',
  'credentials',
  '.env',
  '.netrc',
  '.npmrc',
  '.pypirc',
  'id_rsa',
  'id_ed25519',
  'private_key',
  '.secret',
];

describe('matchesBlockedPattern', () => {
  describe('exact component matches', () => {
    it('blocks .env as a path component', () => {
      expect(matchesBlockedPattern('/home/user/.env', DEFAULT_BLOCKED)).toBe('.env');
    });

    it('blocks .ssh as a path component', () => {
      expect(matchesBlockedPattern('/home/user/.ssh/config', DEFAULT_BLOCKED)).toBe('.ssh');
    });

    it('blocks credentials as a path component', () => {
      expect(matchesBlockedPattern('/home/user/credentials', DEFAULT_BLOCKED)).toBe('credentials');
    });

    it('blocks id_rsa as a path component', () => {
      expect(matchesBlockedPattern('/home/user/keys/id_rsa', DEFAULT_BLOCKED)).toBe('id_rsa');
    });

    it('blocks private_key as a path component', () => {
      expect(matchesBlockedPattern('/home/user/private_key', DEFAULT_BLOCKED)).toBe('private_key');
    });
  });

  describe('dotfile variants (pattern.* suffix)', () => {
    it('blocks .env.local', () => {
      expect(matchesBlockedPattern('/home/user/project/.env.local', DEFAULT_BLOCKED)).toBe('.env');
    });

    it('blocks .env.production', () => {
      expect(matchesBlockedPattern('/home/user/.env.production', DEFAULT_BLOCKED)).toBe('.env');
    });

    it('blocks .secret.key', () => {
      expect(matchesBlockedPattern('/home/user/.secret.key', DEFAULT_BLOCKED)).toBe('.secret');
    });
  });

  describe('false positives that should NOT match', () => {
    it('allows "development" directory (does not contain .env)', () => {
      expect(matchesBlockedPattern('/home/user/development/project', DEFAULT_BLOCKED)).toBeNull();
    });

    it('allows "environment" directory', () => {
      expect(matchesBlockedPattern('/home/user/environment/config', DEFAULT_BLOCKED)).toBeNull();
    });

    it('allows "my_credentials_backup" directory', () => {
      expect(matchesBlockedPattern('/home/user/my_credentials_backup/file', DEFAULT_BLOCKED)).toBeNull();
    });

    it('allows "private_key_generator" directory', () => {
      expect(matchesBlockedPattern('/home/user/private_key_generator/main.py', DEFAULT_BLOCKED)).toBeNull();
    });

    it('allows "docker-compose.yml" file', () => {
      expect(matchesBlockedPattern('/home/user/project/docker-compose.yml', DEFAULT_BLOCKED)).toBeNull();
    });

    it('allows "envconfig" directory', () => {
      expect(matchesBlockedPattern('/home/user/envconfig/settings', DEFAULT_BLOCKED)).toBeNull();
    });

    it('allows "secretstore" directory', () => {
      expect(matchesBlockedPattern('/home/user/secretstore/data', DEFAULT_BLOCKED)).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null for empty patterns list', () => {
      expect(matchesBlockedPattern('/home/user/anything', [])).toBeNull();
    });

    it('handles root path', () => {
      expect(matchesBlockedPattern('/', DEFAULT_BLOCKED)).toBeNull();
    });

    it('handles deeply nested blocked pattern', () => {
      expect(matchesBlockedPattern('/a/b/c/d/.env', DEFAULT_BLOCKED)).toBe('.env');
    });

    it('matches first blocked pattern found', () => {
      const result = matchesBlockedPattern('/home/.ssh/id_rsa', DEFAULT_BLOCKED);
      expect(result).toBe('.ssh');
    });
  });
});
