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
import { dirname, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

/**
 * Retrieves the list of changed packages for a given commit.
 * @param sha The SHA of the commit.
 * @param packageFolders Array of package folder paths to check for changes.
 * @returns An array of changed package names.
 */
export function getChangedPackagesForCommit({
  sha,
  packageFolders
}: {
  sha: string;
  packageFolders: Array<string>;
}): string[] {
  // Get the list of changed files in the commit using git diff
  const changedFiles = execSync(`git diff --name-only --diff-filter=d ${sha}^ ${sha}`)
    .toString()
    .trim()
    .split('\n')
    .filter((file) => packageFolders.some((p) => file.startsWith(p)));

  const changedPackages = new Set<string>();
  const processedPaths = new Set<string>();

  // Iterate over the changed files and find the corresponding package.json files
  for (const file of changedFiles) {
    let dir = dirname(file);
    while (dir !== '.') {
      if (processedPaths.has(dir)) {
        break;
      }
      const packageJsonPath = join(dir, 'package.json');
      if (existsSync(packageJsonPath)) {
        const fileContent = readFileSync(packageJsonPath, 'utf8');
        try {
          const packageJson = JSON.parse(fileContent) as { name?: string };
          if (typeof packageJson.name === 'string') {
            changedPackages.add(packageJson.name);
          }
        } catch {
          // Ignore invalid JSON
        }
        processedPaths.add(dir);
        break;
      }
      dir = dirname(dir);
    }
  }

  return [...changedPackages];
}
