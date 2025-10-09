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

import type { CommitInfo, UpgradeType } from './types.js';

/**
 * Generates the content of a changeset file in markdown format.
 * @param commit The CommitInfo object representing the commit.
 * @returns The generated markdown content for the changeset file.
 */
export function getChangesetMarkdown(commit: CommitInfo): string {
  const {
    upgradeType,
    commitMessage: { subject, body, footer }
  } = commit;

  const packageUpgrades: Record<string, UpgradeType> = {};
  for (const packageName of commit.changedPackages) {
    packageUpgrades[packageName] = upgradeType;
  }

  const headerContent = Object.entries(packageUpgrades)
    .filter(([_, upgradeType]) => upgradeType !== 'none')
    .map(([packageName, upgradeType]) => `"${packageName}": ${upgradeType}`)
    .join('\n');

  const message = [subject, body, footer].filter(Boolean).join('\n\n');

  return '---\n' + headerContent + '---\n' + message;
}
