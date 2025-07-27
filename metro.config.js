// Learn more https://docs.expo.dev/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');
const os = require('os');

// Get the default configuration
const config = getDefaultConfig(__dirname);

// Ensure the project root is watched
config.watchFolders = [__dirname];

// Explicitly tell Metro where to find modules
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Configure maxWorkers to prevent memory issues
config.maxWorkers = Math.max(os.cpus().length - 1, 1);

// Increase Metro's buffer size to handle larger files
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    toplevel: false,
    keep_classnames: true,
    keep_fnames: true,
  },
  output: {
    ascii_only: true,
    quote_style: 3,
    wrap_iife: true,
  },
  sourceMap: {
    includeSources: false,
  },
  toplevel: false,
  compress: {
    reduce_funcs: false,
  },
};

// Fix Windows path issues
if (process.platform === 'win32') {
  console.log('Configuring Metro for Windows environment');

  // Fix Windows path resolution using absolute paths
  config.resolver.extraNodeModules = new Proxy(
    {},
    {
      get: (target, name) => {
        const modulePath = path.join(process.cwd(), `node_modules/${name}`);
        return path.resolve(modulePath);
      },
    },
  );

  // Normalize paths for Windows
  const originalResolveRequest = config.resolver.resolveRequest;
  if (originalResolveRequest) {
    config.resolver.resolveRequest = (context, moduleName, platform) => {
      if (moduleName && moduleName.includes('\\')) {
        moduleName = moduleName.replace(/\\/g, '/');
      }
      return originalResolveRequest(context, moduleName, platform);
    };
  }
}

// Transform configuration with increased heap size
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add more memory for processing large bundles
process.env.NODE_OPTIONS =
  process.env.NODE_OPTIONS || '--max-old-space-size=4096';

// Fix potential bundling issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ensure file types are properly resolved
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs', 'cjs'];

// Fix React Native Web compatibility
config.resolver.assetExts = [...config.resolver.assetExts, 'pem', 'crt'];

module.exports = config;
