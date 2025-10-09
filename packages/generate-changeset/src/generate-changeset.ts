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

import { getVersionBumpCommitsSinceMain } from './get-version-bump-commits';
import { createChangesets } from './create-changesets';

/**
 * Main function to generate changesets based on version bump commits.
 * @param productionBranch The production branch name (default: 'main').
 * @param integrationBranch The integration branch name (default: 'develop').
 * @param packageFolders Array of package folder paths to check for changes (default: ['packages']).
 */
export async function generateChangeset({
  productionBranch = 'main',
  integrationBranch = 'develop',
  packageFolders = ['packages']
}: {
  productionBranch?: string;
  integrationBranch?: string;
  packageFolders?: Array<string>;
} = {}): Promise<void> {
  const versionBumpCommits = getVersionBumpCommitsSinceMain({
    productionBranch,
    integrationBranch,
    packageFolders
  });
  await createChangesets(versionBumpCommits);
}

export default generateChangeset;
