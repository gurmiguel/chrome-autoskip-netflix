import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import { readFileSync } from 'fs'
import path from 'path'
import ts from 'typescript'
import type webpack from 'webpack'
import manifest from './manifest'

const entries: webpack.Configuration['entry'] = {}

if (manifest.background) {
  entries['background'] = getManifestEntry(manifest.background.service_worker)
}

manifest.content_scripts?.forEach(cs => {
  cs.js?.forEach(jsFile => {
    entries[getManifestKey(jsFile)] = getManifestEntry(jsFile)
  })
})

if (manifest.action?.default_popup) {
  const html = readFileSync(path.resolve(__dirname, 'public', manifest.action.default_popup))
  const scripts = getScriptsFromHTML(html.toString())
  scripts.forEach(script => {
    entries[getManifestKey(script)] = getManifestEntry(script)
  })
}

module.exports = {
  mode: "production",
  entry: entries,
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: ".", to: ".", context: "public" },
        { from: "manifest.ts", to: "manifest.json", transform(content: Buffer) {
          const manifest = eval(`"use strict";{${ts.transpile(content.toString())}};`)

          return JSON.stringify(manifest)
        } }
      ]
    }),
  ],
} as webpack.Configuration

function getManifestKey(filepath: string) {
  const filename = filepath.replace(/\\/g, '/').split('/').pop()!

  return filename.split('.').shift()!
}

function getManifestEntry(filepath: string) {
  return path.resolve(__dirname, 'src', filepath.replace(/\.js$/, '.ts'))
}

function getScriptsFromHTML(html: string) {
  const matches = html.matchAll(/<script.*src=['"]([^'"]+)['"]/g) ?? []

  const scripts: string[] = []

  for (const match of matches) {
    const [, script] = match

    scripts.push(script)
  }

  return scripts
}