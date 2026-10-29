import { configDefaults, defineConfig } from 'vitest/config';

// Agent worktrees live under .claude/ and hold copies of test/.
export default defineConfig({ test: { exclude: [...configDefaults.exclude, '.claude/**'] } });
