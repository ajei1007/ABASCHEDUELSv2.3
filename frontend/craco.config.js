const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      /* -------------------------------------------------- */
      /* 1.  Node‑core polyfills you actually need          */
      /* -------------------------------------------------- */
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        buffer: require.resolve('buffer/'), // npm i buffer
        stream: require.resolve('stream-browserify'), // npm i stream-browserify
        crypto: require.resolve('crypto-browserify'), // npm i crypto-browserify
        util: require.resolve('util'), // npm i util
        vm: require.resolve('vm-browserify'), // npm i vm-browserify
        /* add others (fs, path, …) as required */
      };

      config.plugins.push(
        /* global Buffer -> browser shim                */
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      );

      config.module.rules.push({
        test: /\.m?js$/, // both .mjs and plain .js in esm pkgs
        resolve: { fullySpecified: false },
      });

      return config;
    },
  },
};
