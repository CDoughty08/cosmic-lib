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

import { execSync } from 'node:child_process';
import type { CommitInfo } from './types';
import { parseCommit } from './parse-commit';

/**
 * Retrieves version bump commits since the main branch.
 * @param productionBranch The production branch name (default: 'main').
 * @param integrationBranch The integration branch name (default: 'develop').
 * @param packageFolders Array of package folder paths to check for changes.
 * @returns An array of CommitInfo objects representing version bump commits.
 */
export function getVersionBumpCommitsSinceMain({
  productionBranch,
  integrationBranch,
  packageFolders
}: {
  productionBranch: string;
  integrationBranch: string;
  packageFolders: Array<string>;
}): CommitInfo[] {
  const delimiter = '<!--|COMMIT|-->';
  return execSync(`git log --format="%H %B${delimiter}" ${productionBranch}..${integrationBranch}`)
    .toString()
    .trim()
    .split(delimiter)
    .slice(0, -1)
    .map((commitText) => parseCommit({ commitText, packageFolders }))
    .filter(({ upgradeType, changedPackages }) => upgradeType !== 'none' && changedPackages.length > 0);
}
