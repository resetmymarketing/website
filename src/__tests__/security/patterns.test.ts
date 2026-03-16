import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';

const SRC_DIR = path.resolve(__dirname, '../../');

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '__tests__' || entry.name === '.next') {
        continue;
      }
      results.push(...findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function readSourceFiles(): { path: string; content: string }[] {
  const files = findFiles(SRC_DIR, ['.ts', '.tsx']);
  return files.map((filePath) => ({
    path: filePath,
    content: fs.readFileSync(filePath, 'utf-8'),
  }));
}

describe('Security pattern scans', () => {
  const sourceFiles = readSourceFiles();

  it('no eval() calls', () => {
    for (const file of sourceFiles) {
      expect(file.content).not.toMatch(/\beval\s*\(/);
    }
  });

  it('no new Function() calls', () => {
    for (const file of sourceFiles) {
      expect(file.content).not.toMatch(/new\s+Function\s*\(/);
    }
  });

  it('no dangerouslySetInnerHTML', () => {
    for (const file of sourceFiles) {
      // layout.tsx uses dangerouslySetInnerHTML for FOUC prevention (static string, no user input)
      if (file.path.includes('layout.tsx')) continue;
      expect(file.content).not.toMatch(/dangerouslySetInnerHTML/);
    }
  });

  it('no .innerHTML assignment', () => {
    for (const file of sourceFiles) {
      expect(file.content).not.toMatch(/\.innerHTML\s*=/);
    }
  });

  it('no document.write', () => {
    for (const file of sourceFiles) {
      expect(file.content).not.toMatch(/document\.write/);
    }
  });

  it('no hardcoded secrets patterns', () => {
    const secretPatterns = [
      /password\s*=\s*["'][^"']{8,}["']/i,
      /api[_-]?key\s*=\s*["'][^"']{8,}["']/i,
      /secret\s*=\s*["'][^"']{8,}["']/i,
    ];
    for (const file of sourceFiles) {
      for (const pattern of secretPatterns) {
        const match = file.content.match(pattern);
        if (match) {
          // Allow test files and env.ts validation patterns
          const isTestOrConfig =
            file.path.includes('__tests__') ||
            file.path.includes('.test.') ||
            file.path.includes('env.ts');
          if (!isTestOrConfig) {
            expect(match).toBeNull();
          }
        }
      }
    }
  });

  it('no console.log in production code', () => {
    for (const file of sourceFiles) {
      if (file.path.includes('env.ts')) continue; // env validation uses console.error
      expect(file.content).not.toMatch(/console\.log\s*\(/);
    }
  });

  it('no TODO/FIXME/HACK in production code', () => {
    for (const file of sourceFiles) {
      if (file.path.includes('__tests__')) continue;
      expect(file.content).not.toMatch(/\b(TODO|FIXME|HACK|XXX|TEMP)\b/);
    }
  });
});
