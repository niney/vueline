const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    filenameHashing: false,
    css: {
        extract: false
    },
    pages: {
        index: {
            entry: 'src/main.ts',
            template: 'public/index.html',
            filename: 'index.html',
            title: 'Index Page',
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        partnerChat: {
            entry: 'src/pages/samplepcb/partnerChat/partner-chat.ts',
            template: 'src/pages/samplepcb/partnerChat/index.html',
            filename: 'partnerChat.html',
            title: 'partnerChatApp'
        },
        elepartsCrawl: {
            entry: 'src/pages/samplepcb/elepartsCrawl/eleparts-crawl.ts',
            template: 'src/pages/samplepcb/elepartsCrawl/index.html',
            filename: 'elepartsCrawl.html',
            title: 'elepartsCrawlApp'
        },
        samBom: {
            entry: 'src/pages/samplepcb/samBom/sam-bom.ts',
            template: 'src/pages/samplepcb/samBom/index.html',
            filename: 'samBom.html',
            title: 'samBomApp'
        },
        spSmartBom: {
            entry: 'src/pages/samplepcb/spSmartBom/sp-smart-bom.ts',
            template: 'src/pages/samplepcb/spSmartBom/index.html',
            filename: 'spSmartBom.html',
            title: 'spSmartBomApp'
        },
    }
})
