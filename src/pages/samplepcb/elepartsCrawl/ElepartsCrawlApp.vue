<template>
    <div class="mx-auto py-4">
        <div class="mb-4">
            <input v-model="url"
                   type="text"
                   class="border p-2"
                   style="width: 800px;"
                   placeholder="URL을 입력하세요"
                   @keyup.enter="fetchData"> <!-- Enter 키를 눌렀을 때 fetchData 호출 -->
            <button @click="fetchData" class="bg-blue-500 text-white p-2 ml-2">데이터 불러오기</button>
            <button @click="nextPage" class="bg-green-500 text-white p-2 ml-2">다음 페이지</button> <!-- 다음 페이지 버튼 추가 -->
            page: {{ page }}
        </div>
        <div v-if="isLoading" class="text-center py-4">
            <div class="loader"></div>
            <p>로딩 중...</p>
        </div>
        <div v-else>
            <table class="min-w-full bg-white border border-gray-200">
                <thead>
                <tr class="text-left">
                    <th class="py-2 px-4 border-b">제목</th>
                    <th class="py-2 px-4 border-b">부제목</th>
                    <th class="py-2 px-4 border-b">품명</th>
                    <th class="py-2 px-4 border-b">제조사</th>
                    <th class="py-2 px-4 border-b">와트</th>
                    <th class="py-2 px-4 border-b">오차범위</th>
                    <th class="py-2 px-4 border-b">옴</th>
                    <th class="py-2 px-4 border-b">콘덴서</th>
                    <th class="py-2 px-4 border-b">전류</th>
                    <th class="py-2 px-4 border-b">전압</th>
                    <th class="py-2 px-4 border-b">가격</th>
                </tr>
                </thead>
                <tbody>
                <!-- 데이터 행 반복 -->
                <tr v-for="product in products" :key="product.id">
                    <td class="py-2 px-4 border-b break-all">{{ product.title }}</td>
                    <td class="py-2 px-4 border-b break-all">{{ product.subTitle }}</td>
                    <td class="py-2 px-4 border-b break-all">{{ product.productName }}</td>
                    <td class="py-2 px-4 border-b">{{ product.manufacturer }}</td>
                    <td class="py-2 px-4 border-b">{{ product.watt }}</td>
                    <td class="py-2 px-4 border-b">{{ product.tolerance }}</td>
                    <td class="py-2 px-4 border-b">{{ product.ohm }}</td>
                    <td class="py-2 px-4 border-b">{{ product.capacitor }}</td>
                    <td class="py-2 px-4 border-b">{{ product.current }}</td>
                    <td class="py-2 px-4 border-b">{{ product.voltage }}</td>
                    <td class="py-2 px-4 border-b">{{ product.price }}</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {ElepartsCrawlParams} from "@/model/eleparts-crawl-params";
import '@/tailwind.css';

export default defineComponent({
    name: 'ElepartsCrawlApp',
    props: {
        params: {
            type: Object as () => ElepartsCrawlParams,
            required: true
        }
    },
    data() {
        return {
            url: '', // 사용자가 입력한 URL
            products: [], // API 응답에서 가져온 제품 데이터
            isLoading: false, // 로딩 상태
            page: 1, // 현재 페이지 번호
        };
    },
    watch: {
        url: 'syncPageFromUrl' // URL 변화를 감지하고 페이지 번호 동기화
    },
    created() {
        console.log('created');
    },
    methods: {
        fetchData() {
            this.isLoading = true;
            this.url = this.addPageParam(this.url, this.page);
            const mlUrl = `https://ml.samplepcb.kr/api/searchEleparts?url=${encodeURIComponent(this.url)}`;
            $.get(mlUrl, (data) => {
                this.products = data;
                this.isLoading = false;
            }).fail(() => {
                console.error('데이터를 불러오는데 실패했습니다.');
                this.isLoading = false;
            });
        },
        nextPage() {
            this.page += 1;
            this.fetchData();
        },
        addPageParam(url: string, page: number) {
            const hasPageParam = url.includes('page=');
            if (hasPageParam) {
                return url.replace(/page=\d+/, `page=${page}`);
            } else {
                return url.includes('?') ? `${url}&page=${page}` : `${url}?page=${page}`;
            }
        },
        syncPageFromUrl() {
            const urlParams = new URLSearchParams(this.url.split('?')[1]);
            const pageParam = urlParams.get('page');
            if (pageParam) {
                this.page = Number(pageParam);
            }
        }
    }
});
</script>

<style lang="scss">
    .break-all {
        word-break: break-all;
    }

    .loader {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
