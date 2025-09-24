const esbuild = require('esbuild');
const path = require('path');
const fse = require('fs-extra');
const fsPromises = require('fs/promises');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd(async (result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });

      console.log('[watch] build finished');
    });
  },
};

const erbModulePath = path.dirname(require.resolve('erb'));
const erbTemplatesSource = path.join(erbModulePath, 'lib/erb/templates');
const erbRubySource = path.join(erbModulePath, 'ruby');
const erbTemplatesDst = path.resolve('./dist/templates');
const erbRubyDst = path.resolve('./dist/ruby');

const pyStubsSource = path.resolve('./syntaxes/cosmos_globals.pyi');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildERBPatcherPlugin = {
  name: 'erb-patcher',
  setup(build) {
    build.onLoad({ filter: /getOpalScriptWithERBTemplate\.js$/ }, async (args) => {
      console.log(`[erb-patcher] Patching file: ${args.path}`);
      let contents = await fsPromises.readFile(args.path, 'utf8');

      // Resolve incorrect relative paths to dist path by replacing entire block of code
      const pattern1 = /replacement\:\sPromise[\s\S]*\.call\('join', '\\n'\)/;
      const replacement1 = `replacement: Promise.resolve([
        path.join(__dirname, 'ruby/opal.js'),
        path.join(__dirname, 'ruby/opal-compiler.js'),
        path.join(__dirname, 'ruby/opal-erb.js'),
        path.join(__dirname, 'ruby/json.js'),
        path.join(__dirname, 'ruby/base64.js'),
        path.join(__dirname, 'ruby/template.js'),
      ]).map(read).call('join', '\\n')`;

      // Apply both replacements using standard JavaScript string.replace()
      contents = contents.replace(pattern1, replacement1);

      return {
        contents: contents,
        loader: 'js',
      };
    });
    build.onEnd(async (result) => {
      /* Copy ERB non-module sources */
      if (result.errors.length === 0) {
        console.log('[erb-patcher] Copying ERB non-module sources');
        fse.copy(erbTemplatesSource, erbTemplatesDst);
        fse.copy(erbRubySource, erbRubyDst);
        fse.copy(pyStubsSource, './dist/cosmos_globals.pyi');
      }
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [esbuildProblemMatcherPlugin, esbuildERBPatcherPlugin],
  });
  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
