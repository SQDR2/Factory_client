/*
 * @Author: SQDR2 1842181703@qq.com
 * @Date: 2023-03-13 15:26:02
 * @LastEditors: SQDR2 1842181703@qq.com
 * @LastEditTime: 2023-05-05 20:26:32
 * @FilePath: \vue-manage-system-master\vite.config.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        VueSetupExtend(),
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver(), AntDesignVueResolver({
                importStyle: 'less', // 一定要开启这个配置项
            })]
        })
    ],
    optimizeDeps: {
        include: ['schart.js']
    }
});
