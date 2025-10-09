/**
 * Based on:https://github.com/bob-obringer/monorepo/blob/develop/packages/conventional-changesets
 *
 * MIT License
 *
 * Copyright (c) 2024 Bob Obringer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

import { parseCommit } from '../parse-commit';
import { getChangedPackagesForCommit } from '../get-changed-packages';
import type { Commit } from 'conventional-commits-parser';

// Mock the getChangedPackagesForCommit function
jest.mock('../get-changed-packages');
const mockGetChangedPackagesForCommit = getChangedPackagesForCommit as jest.MockedFunction<
  typeof getChangedPackagesForCommit
>;

describe('parseCommit', () => {
  const mockPackageFolders = ['packages/pkg1', 'packages/pkg2'];
  const mockSha = '1234567890abcdef1234567890abcdef12345678';

  // Helper function to create properly typed commit message expectations
  const expectCommitMessage = (expected: Partial<Commit>) => {
    return expect.objectContaining(expected) as jest.Expect;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetChangedPackagesForCommit.mockReturnValue(['@test/package1']);
  });

  describe('basic parsing', () => {
    it('should parse a basic feat commit correctly', () => {
      const commitText = `${mockSha} feat: add new feature`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add new feature'
        }),
        isBreakingChange: false,
        upgradeType: 'minor',
        changedPackages: ['@test/package1']
      });
      expect(mockGetChangedPackagesForCommit).toHaveBeenCalledWith({
        sha: mockSha,
        packageFolders: mockPackageFolders
      });
    });

    it('should parse a fix commit correctly', () => {
      const commitText = `${mockSha} fix: resolve bug in authentication`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'fix',
          subject: 'resolve bug in authentication'
        }),
        isBreakingChange: false,
        upgradeType: 'patch',
        changedPackages: ['@test/package1']
      });
    });

    it('should parse a refactor commit correctly', () => {
      const commitText = `${mockSha} refactor: improve code structure`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'refactor',
          subject: 'improve code structure'
        }),
        isBreakingChange: false,
        upgradeType: 'patch',
        changedPackages: ['@test/package1']
      });
    });

    it('should parse a perf commit correctly', () => {
      const commitText = `${mockSha} perf: optimize database queries`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'perf',
          subject: 'optimize database queries'
        }),
        isBreakingChange: false,
        upgradeType: 'patch',
        changedPackages: ['@test/package1']
      });
    });

    it('should handle unknown commit types as none', () => {
      const commitText = `${mockSha} docs: update README`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'docs',
          subject: 'update README'
        }),
        isBreakingChange: false,
        upgradeType: 'none',
        changedPackages: ['@test/package1']
      });
    });
  });

  describe('breaking changes detection', () => {
    it('should detect breaking changes in commit body', () => {
      const commitText = `${mockSha} feat: add new API\n\nThis is a new feature\n\nBREAKING CHANGE: API has changed`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add new API'
        }),
        isBreakingChange: true,
        upgradeType: 'major',
        changedPackages: ['@test/package1']
      });
    });

    it('should detect breaking changes in commit footer', () => {
      const commitText = `${mockSha} feat: add new feature\n\nBREAKING CHANGE: This changes the API`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add new feature'
        }),
        isBreakingChange: true,
        upgradeType: 'major',
        changedPackages: ['@test/package1']
      });
    });

    it('should detect breaking changes with different casing', () => {
      const commitText = `${mockSha} feat: add new feature\n\nbreaking change: API changed`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add new feature'
        }),
        isBreakingChange: true,
        upgradeType: 'major',
        changedPackages: ['@test/package1']
      });
    });

    it('should not detect breaking changes when pattern is not present', () => {
      const commitText = `${mockSha} feat: add new feature\n\nThis is a regular feature`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add new feature'
        }),
        isBreakingChange: false,
        upgradeType: 'minor',
        changedPackages: ['@test/package1']
      });
    });

    it('should prioritize breaking changes over commit type for upgrade type', () => {
      const commitText = `${mockSha} fix: bug fix\n\nBREAKING CHANGE: This breaks something`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'fix',
          subject: 'bug fix'
        }),
        isBreakingChange: true,
        upgradeType: 'major', // Should be major despite being a fix
        changedPackages: ['@test/package1']
      });
    });
  });

  describe('commit message parsing', () => {
    it('should parse commit with scope', () => {
      const commitText = `${mockSha} feat(auth): add login functionality`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          scope: 'auth',
          subject: 'add login functionality'
        }),
        isBreakingChange: false,
        upgradeType: 'minor',
        changedPackages: ['@test/package1']
      });
    });

    it('should parse commit with body and footer', () => {
      const commitText = `${mockSha} feat: add new feature\n\nThis feature adds new functionality\n\nCloses #123`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add new feature'
        }),
        isBreakingChange: false,
        upgradeType: 'minor',
        changedPackages: ['@test/package1']
      });
    });

    it('should handle multiline commit messages', () => {
      const commitText = `${mockSha} feat: add comprehensive feature\n\nThis is a long description\nthat spans multiple lines\nand provides detailed information`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: 'add comprehensive feature'
        }),
        isBreakingChange: false,
        upgradeType: 'minor',
        changedPackages: ['@test/package1']
      });
    });
  });

  describe('SHA extraction', () => {
    it('should extract SHA correctly from commit text', () => {
      const commitText = `${mockSha} feat: test commit`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.sha).toBe(mockSha);
    });

    it('should handle commit text with extra whitespace', () => {
      const commitText = `  ${mockSha}  feat: test commit  `;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.sha).toBe(mockSha);
      expect(result.commitMessage.subject).toBe('test commit');
    });
  });

  describe('changed packages integration', () => {
    it('should call getChangedPackagesForCommit with correct parameters', () => {
      const commitText = `${mockSha} feat: test commit`;
      parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(mockGetChangedPackagesForCommit).toHaveBeenCalledWith({
        sha: mockSha,
        packageFolders: mockPackageFolders
      });
    });

    it('should return changed packages from getChangedPackagesForCommit', () => {
      const mockChangedPackages = ['@test/package1', '@test/package2'];
      mockGetChangedPackagesForCommit.mockReturnValue(mockChangedPackages);

      const commitText = `${mockSha} feat: test commit`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.changedPackages).toEqual(mockChangedPackages);
    });

    it('should handle empty changed packages array', () => {
      mockGetChangedPackagesForCommit.mockReturnValue([]);

      const commitText = `${mockSha} feat: test commit`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.changedPackages).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle commit without type', () => {
      const commitText = `${mockSha} just a message without type`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: null,
          subject: 'just a message without type'
        }),
        isBreakingChange: false,
        upgradeType: 'none',
        changedPackages: ['@test/package1']
      });
    });

    it('should handle commit with only type', () => {
      const commitText = `${mockSha} feat:`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result).toEqual({
        sha: mockSha,
        commitMessage: expectCommitMessage({
          type: 'feat',
          subject: ''
        }),
        isBreakingChange: false,
        upgradeType: 'minor',
        changedPackages: ['@test/package1']
      });
    });

    it('should handle very short commit text', () => {
      const shortSha = '123';
      const commitText = `${shortSha} a`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.sha).toBe(shortSha);
      expect(result.commitMessage.subject).toBe('a');
    });

    it('should handle empty package folders array', () => {
      const commitText = `${mockSha} feat: test commit`;
      parseCommit({ commitText, packageFolders: [] });

      expect(mockGetChangedPackagesForCommit).toHaveBeenCalledWith({
        sha: mockSha,
        packageFolders: []
      });
    });

    it('should handle null/undefined commit message parts', () => {
      // This tests the nullish coalescing in the breaking change detection
      const commitText = `${mockSha} feat: test commit`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.isBreakingChange).toBe(false);
      expect(result.upgradeType).toBe('minor');
    });
  });

  describe('upgrade type mapping', () => {
    it.each([
      ['feat', 'minor'],
      ['fix', 'patch'],
      ['refactor', 'patch'],
      ['perf', 'patch'],
      ['docs', 'none'],
      ['style', 'none'],
      ['test', 'none'],
      ['chore', 'none'],
      ['unknown', 'none']
    ])('should map %s commit type to %s upgrade type', (commitType, expectedUpgradeType) => {
      const commitText = `${mockSha} ${commitType}: test message`;
      const result = parseCommit({ commitText, packageFolders: mockPackageFolders });

      expect(result.upgradeType).toBe(expectedUpgradeType);
    });
  });
});
