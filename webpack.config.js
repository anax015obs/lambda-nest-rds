const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = (options, webpack) => {
  const lazyImports = ["@nestjs/microservices/microservices-module", "@nestjs/websockets/socket-module"];

  return {
    ...options,
    target: "node",
    entry: {
      index: "./src/index.ts",
    },
    mode: "production",
    optimization: {
      splitChunks: false,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
          options: {
            transpileOnly: true,
          },
        },
      ],
    },
    resolve: {
      alias: {
        "@src": path.resolve(__dirname, "src"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      libraryTarget: "commonjs2",
    },
    externals: ["aws-sdk"],
    plugins: [
      ...options.plugins,
      new CopyPlugin({
        patterns: [{ from: "prisma/schema.prisma" }, { from: "prisma/*.x.so.node", to: "[name][ext]" }],
      }),
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
