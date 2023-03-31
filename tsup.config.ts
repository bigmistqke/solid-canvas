import { defineConfig } from 'tsup-preset-solid'

export default defineConfig(
  [
    {
      entry: 'src/index.tsx',
      devEntry: true,
    },
    {
      entry: 'src/controllers/controllers.ts',
    },
    {
      entry: 'src/d/d.ts',
    },
  ],
  {
    // Setting `true` will console.log the package.json fields
    printInstructions: true,
    // Setting `true` will write export fields to package.json
    writePackageJson: true,
    // Setting `true` will remove all `console.*` calls and `debugger` statements
    dropConsole: true,
    // Setting `true` will generate a CommonJS build alongside ESM (default: `false`)
    cjs: true,
  },
)
