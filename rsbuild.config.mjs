import { pluginBabel } from '@rsbuild/plugin-babel'
import { pluginVue2 } from '@rsbuild/plugin-vue2'
import { pluginVue2Jsx } from '@rsbuild/plugin-vue2-jsx'
import { pluginSass } from '@rsbuild/plugin-sass'
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'
import { defineConfig, loadEnv } from '@rsbuild/core'
import express from 'express'
import defaultSettings from './src/settings.js'
import mockServerMiddleware from './mock/mock-server'
import { resolve } from 'node:path'

// document title
const name = defaultSettings.title || 'vue Element Admin' // page title
// env compatibility
const { publicVars } = loadEnv({ prefixes: ['VUE_APP_'] })

const port = process.env.port || process.env.npm_config_port || 9527 // dev port

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/
    }),
    pluginVue2(),
    pluginVue2Jsx(),
    pluginSass(),
    pluginNodePolyfill()
  ],
  source: {
    entry: {
      index: './src/main.js'
    },
    define: publicVars
  },
  html: {
    template: './public/index.html',
    title: name
  },
  server: {
    port: port,
    open: true
  },
  dev: {
    setupMiddlewares: (middlewares) => {
      const app = express()
      mockServerMiddleware(app)
      middlewares.unshift(app)
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  output: {
    // distPath: 'dist', // outputDir: 'dist'，可删除，rsbuild 默认配置
    // assetPrefix: '/', // publicPath: '/'

    // 对应 assetsDir 其实和 rsbuild 的默认 assets 输出一致，可以不用新增保持默认配置也行
    // https://v1.rsbuild.rs/zh/config/output/dist-path#outputdistpath
    // distPath: {
    //   js: 'static/js',
    //   css: 'static/css',
    //   image: 'static/img',
    //   font: 'static/fonts'
    // }

    // 对应 productionSourceMap，可不添加，保持 rsbuild 默认配置即可。
    // sourceMap: {
    //   js: process.env.NODE_ENV === 'development' ? 'cheap-module-source-map' : false,
    //   css: false
    // },

    // 对应 chainWebpack 的 script-ext-html-webpack-plugin
    inlineScripts: {
      include: /runtime\..*\.js$/
    }
  },
  performance: {
    preload: {
      type: 'initial', // include: 'initial'
      exclude: [/\.map$/, /hot-update\.js/, /runtime\..*\.js$/] // fileBlacklist
    }
  },
  tools: {
    bundlerChain: (chain) => {
      chain.module
        .rule('svg')
        .exclude.add(resolve('src/icons'))
        .end()
      chain.module
        .rule('svg-icons')
        .test(/\.svg$/)
        .include.add(resolve('src/icons'))
        .end()
        .use('svg-sprite-loader')
        .loader('svg-sprite-loader')
        .options({
          symbolId: 'icon-[name]'
        })
    },
    rspack: (config) => {
      config.optimization.runtimeChunk = 'single'
    }
  }
})
