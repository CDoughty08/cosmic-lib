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

import { sync } from 'conventional-commits-parser';
import type { CommitInfo } from './types';
import { BREAKING_PATTERN, bumpMap } from './constants';
import { getChangedPackagesForCommit } from './get-changed-packages';

/**
 * Parses a commit message and extracts relevant information.
 * @param commitText The commit message text.
 * @param packageFolders Array of package folder paths to check for changes.
 * @returns A CommitInfo object containing parsed commit information.
 */
export function parseCommit({
  commitText,
  packageFolders
}: {
  commitText: string;
  packageFolders: Array<string>;
}): CommitInfo {
  const commit = commitText.trim();
  const sha = commit.substring(0, 40);
  const message = commit.substring(40).trim();
  const commitMessage = sync(message);
  const isBreakingChange = Boolean(
    commitMessage.body?.includes(BREAKING_PATTERN) ?? commitMessage.footer?.includes(BREAKING_PATTERN)
  );
  const upgradeType = isBreakingChange ? 'major' : bumpMap[commitMessage.type ?? ''] || 'none';
  const changedPackages = getChangedPackagesForCommit({ sha, packageFolders });
  return {
    changedPackages,
    sha,
    commitMessage,
    isBreakingChange,
    upgradeType
  };
}
