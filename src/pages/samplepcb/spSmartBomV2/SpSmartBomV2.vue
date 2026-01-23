<template>
    <div class="sp-smart-bom-v2" :class="darkMode ? '' : 'light-mode'">
        <!-- 사이드바 -->
        <aside class="sidebar" :class="{ collapsed: !sidebarOpen }">
            <div class="logo flex items-center gap-2.5 mb-6">
                <span class="logo-icon">SB</span>
                <div class="logo-text">
                    <strong>SmartBOM</strong>
                    <small>Part Matching Engine</small>
                </div>
            </div>
            <nav class="nav-menu flex-1">
                <div class="nav-title">Navigation</div>
                <ul class="list-none p-0 m-0">
                    <li class="nav-item active"><i class="fas fa-file-alt"></i> BOMs</li>
                    <li class="nav-item"><i class="fas fa-microchip"></i> Parts Library</li>
                    <li class="nav-item"><i class="fas fa-chart-bar"></i> Analytics</li>
                    <li class="nav-item"><i class="fas fa-warehouse"></i> InvenTree</li>
                    <li class="nav-item"><i class="fas fa-cog"></i> Settings</li>
                </ul>
            </nav>
            <div class="sidebar-footer text-xs">
                <div>SmartBOM v0.1</div>
                <div class="link">InvenTree Integration</div>
            </div>
        </aside>

        <!-- 메인 컨텐츠 -->
        <main class="content flex-1 flex flex-col">
            <div class="content-toolbar flex items-center">
                <button class="btn-icon" @click="sidebarOpen = !sidebarOpen">
                    <IconPanelLeft :size="18" :stroke-width="1.5" />
                </button>
                <div class="flex-1"></div>
                <button class="btn-icon" @click="darkMode = !darkMode">
                    <IconSun v-if="darkMode" :size="18" :stroke-width="1.5" />
                    <IconMoon v-else :size="18" :stroke-width="1.5" />
                </button>
            </div>
            <div class="toolbar-divider"></div>
            <section class="content-body flex-1 p-6">
                <!-- 업로드 영역 -->
                <div class="upload-area">
                    <div class="upload-dropzone">
                        <div class="upload-icon">
                            <IconUpload :size="48" :stroke-width="1.5" />
                        </div>
                        <h2 class="upload-title">BOM 파일을 업로드하세요</h2>
                        <p class="upload-desc">파일을 드래그하거나 클릭하여 선택하세요</p>
                        <div class="upload-formats">xlsx, xls, csv 파일 지원</div>
                        <label class="upload-btn">
                            <input type="file" accept=".xlsx,.xls,.csv" hidden />
                            파일 선택
                        </label>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script lang="ts">
import "./sp-smart-bom-v2-style.scss";
import {defineComponent, PropType, ref} from 'vue';
import {SpSmartBomV2Params} from "@/model/sp-smart-bom-params";
import IconPanelLeft from "@/components/icons/IconPanelLeft.vue";
import IconSun from "@/components/icons/IconSun.vue";
import IconMoon from "@/components/icons/IconMoon.vue";
import IconUpload from "@/components/icons/IconUpload.vue";

export default defineComponent({
    name: 'SpSmartBomV2',
    components: {
        IconPanelLeft,
        IconSun,
        IconMoon,
        IconUpload
    },
    props: {
        params: {
            type: Object as PropType<SpSmartBomV2Params>,
            required: true
        }
    },
    setup(props) {
        const sidebarOpen = ref(true);
        const darkMode = ref(true);

        return {
            sidebarOpen,
            darkMode
        };
    }
});
</script>

