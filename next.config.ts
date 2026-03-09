import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // TypeScriptエラーを無視してビルドを継続
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLintエラーでビルドを停止しない
    ignoreDuringBuilds: true,
  },
  turbopack: {
    resolveAlias: {
      // html2canvasのエイリアスを設定
      'html2canvas': 'html2canvas/dist/html2canvas.min.js',
    },
  },
  webpack: (config: any) => {
    // html2canvasモジュールの問題を回避
    config.resolve.alias = {
      ...config.resolve.alias,
      'html2canvas': 'html2canvas/dist/html2canvas.min.js',
    };
    
    // node_modulesの型チェックを無効化
    config.module.rules.push({
      test: /\.tsx?$/,
      include: /node_modules\/html2canvas/,
      use: 'ignore-loader',
    });

    return config;
  },
};

export default nextConfig;
