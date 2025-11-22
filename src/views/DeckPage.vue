<template>
  <div class="deck-page">
    <h1>덱 목록</h1>
    <button @click="downloadJson">Download JSON</button>
    <div v-if="isLoading" class="loading">로딩 중...</div>

    <!-- 티어별로 덱 나누기 -->
    <div class="tier-section" v-for="tier in sortedTiers" :key="tier">
      <h2>{{ tier }} 티어</h2>
      <div class="deck-list">
        <div v-for="deck in sortedDecks[tier]" :key="deck.main_card" class="deck-item">
          <img :src="deck.main_card_url" alt="메인 카드 이미지" class="deck-card-image" @click="viewDeckDetails(deck.main_card)" />
          <p>{{ deck.main_card_name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '../utils/apiClient';
import { useRouter } from 'vue-router';

export default {
  data() {
    return {
      decks: [],  // API로 받은 덱 리스트
      isLoading: false,  // 로딩 상태
      sortedDecks: {},  // 티어별로 정렬된 덱
      sortedTiers: [],  // 티어 순서 배열
      jsonData:null
    };
  },
  methods: {
    downloadJson() {
      const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], { type: "application/json" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = "card_data.json";
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
    },
    // 덱 리스트 가져오기
    async fetchDecks() {
      this.isLoading = true;
      try {
        const response = await apiClient.get('decks');  // 덱 데이터를 가져오는 API 요청
        this.jsonData = response;
        this.decks = response.data;
        this.sortDecksByTier();  // 티어별로 덱 정렬
      } catch (error) {
        console.error('덱 목록을 가져오는 중 오류:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // 덱을 티어별로 정렬
    sortDecksByTier() {
      // 티어별로 덱 그룹화
      const tiers = [1, 2, 3, 4];
      this.sortedDecks = {};

      // 각 덱을 티어에 맞게 분류
      tiers.forEach((tier) => {
        this.sortedDecks[tier] = this.decks.filter(deck => {
          // tier를 숫자로 변환 후 비교
          const deckTier = Number(deck.tier);
          return deckTier === tier;
        });
      });
      console.log(this.sortedDecks);
      // 티어 순서 배열 설정
      this.sortedTiers = tiers;
    },

    // 덱 클릭 시 상세 페이지로 이동
    viewDeckDetails(mainCardId) {
      this.$router.push({name: 'DeckLists', params: { main_card_id: mainCardId}});
    },
  },
  mounted() {
    this.fetchDecks();  // 덱 데이터 로딩
  },
};
</script>

<style>
.deck-page {
  padding: 20px;
}

.tier-section {
  margin-bottom: 20px;
}

.deck-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.deck-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.deck-card-image {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.loading {
  text-align: center;
  font-size: 16px;
}
</style>
