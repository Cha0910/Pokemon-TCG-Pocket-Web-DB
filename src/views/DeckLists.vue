<template>
  <div class="deck-list-page">
    <!-- 왼쪽: 덱 리스트 -->
    <div class="deck-list">
      <h3>덱 리스트</h3>
      <div
          v-for="deck in decks"
          :key="deck.deck_id"
          class="deck-item"
          @click="viewDeckDetails(deck)"
      >
        <!-- 메인 카드와 서브 카드를 가로로 정렬 -->
        <div class="cards-container">
          <!-- 메인 카드 이미지 -->
          <img :src="getCardImage(deck.main_card)" :alt="deck.main_card" class="deck-img" />

          <!-- 서브 카드 이미지들 -->
          <div class="sub-cards">
            <div v-for="subCard in deck.sub_cards" :key="subCard">
              <img :src="getCardImage(subCard)" :alt="subCard" class="sub-card-img" />
            </div>
          </div>
        </div>

        <!-- 덱 이름 -->
        <p class="deck-name">{{ deck.name }}</p>
      </div>
    </div>

    <!-- 우측: 선택된 덱 상세 정보 -->
    <div v-if="selectedDeck" class="deck-details">
      <h3>덱 상세 정보</h3>
      <p><strong>덱 이름:</strong> {{ selectedDeck.name }}</p>
      <p><strong>타입:</strong> {{ selectedDeck.type.join(", ") }}</p>
      <h4>카드 목록</h4>
      <div class="cards-list">
        <div v-for="(card, index) in sortedCards" :key="index" class="card-item">
          <div class="card-img-container">
            <img
                :src="getCardImage(card.cardId)"
                :alt="card.cardId"
                class="card-img"
                :class="{
                  'grayscale': card.isMissing, // 흑백 처리
                  'normal': !card.isMissing, // 컬러 카드
                }"
            />
            <p v-if="card.count > 1" class="card-count">x{{ card.count }}</p> <!-- 수량이 2 이상일 때만 표시 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '../utils/apiClient';

export default {
  props: ['main_card_id'], // URL 파라미터로 전달된 main_card_id를 props로 받음

  data() {
    return {
      decks: [], // 덱 리스트
      selectedDeck: null, // 선택된 덱
      sortedCards: [], // 카드들 정렬된 배열
      missingCards: null, // missing_cards 데이터
    };
  },
  methods: {
    // 카드 이미지 가져오는 함수
    getCardImage(cardId) {
      return `https://papaya-pokemon-pocket-tcg-images.s3.us-east-1.amazonaws.com/cards/${cardId}.webp`;
    },

    // 덱의 상세 정보를 가져오기 위한 함수
    async viewDeckDetails(deck) {
      this.selectedDeck = deck;

      // 상세 정보를 가져오는 API 호출
      try {
        const response = await apiClient.get(`/decks/info/${deck.deck_id}`); // 실제 상세 정보 API로 변경
        this.selectedDeck.details = response.data; // 상세 정보를 selectedDeck에 추가
        if(response.data.missing_cards){
          console.log(this.selectedDeck.details.missing_cards);
          this.missingCards = this.selectedDeck.details.missing_cards;
        }
        this.sortCardsById(); // 카드들을 card_id 순으로 정렬
        console.log(this.sortedCards);
      } catch (error) {
        console.error('덱 상세 정보 로드 중 오류:', error);
      }
    },

    // 카드들을 cardId 순으로 정렬
    sortCardsById() {
      const cards = this.selectedDeck.details.cards;
      let sorted = [];

      if (this.missingCards != null) {
        sorted = Object.entries(cards)
            .sort(([cardIdA], [cardIdB]) => cardIdA.localeCompare(cardIdB)) // card_id 기준으로 정렬
            .flatMap(([cardId, count]) => {
              const cardDetails = [];
              const missingCount = this.missingCards[cardId] || 0;

              if(Number(missingCount) === 0 || Number(missingCount) === undefined) {
                cardDetails.push({ cardId, count, isMissing: false });
              }
              else if (Number(count) === Number(missingCount)) {
                  cardDetails.push({ cardId, count, isMissing: true });
              } else {
                cardDetails.push({ cardId, count: 1, isMissing: false });
                cardDetails.push({ cardId, count: 1, isMissing: true });
              }
              return cardDetails;
            });
      } else {
        sorted = Object.entries(cards)
            .sort(([cardIdA], [cardIdB]) => cardIdA.localeCompare(cardIdB)) // card_id 기준으로 정렬
            .map(([cardId, count]) => ({
              cardId,
              count,
              isMissing: false, // missingCards가 없는 경우
            }));
      }
      this.sortedCards = sorted;
    },

    // 덱 리스트를 가져오는 함수
    async fetchDecks() {
      try {
        const response = await apiClient.get(`/decks/${this.main_card_id}`); // 덱 리스트를 가져오는 API 요청
        this.decks = response.data; // 받은 덱 리스트 데이터를 decks에 저장
      } catch (error) {
        console.error("덱 데이터 로드 중 오류:", error);
      }
    },
  },

  mounted() {
    this.fetchDecks(); // 페이지 로드시 덱 리스트를 가져옵니다
  },
};
</script>

<style scoped>
/* 기본 스타일 */
.deck-list-page {
  display: flex;
  gap: 20px;
}

.deck-list {
  width: 300px; /* 덱 리스트를 고정 너비로 설정 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border-right: 2px solid #ccc;
}

.deck-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  transition: background-color 0.3s ease;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.deck-item:hover {
  background-color: #f0f0f0;
}

.cards-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.deck-img {
  width: 85px;
  height: 120px;
  object-fit: cover;
}

.sub-cards {
  display: flex;
  gap: 5px;
}

.sub-card-img {
  width: 68px;
  height: 96px;
  margin-top: 24px;
  object-fit: cover;
}

.deck-name {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-top: 5px;
}

.deck-details {
  width: 100%;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.deck-details ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 한 줄에 5개의 카드 표시 */
  gap: 10px;
}

.card-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-img-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-img {
  width: 170px;
  height: 240px;
  object-fit: cover;
}

.card-img.grayscale {
  filter: grayscale(100%); /* 흑백 처리 */
}

.card-count {
  position: absolute;
  bottom: 10px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 5px;
  border-radius: 5px;
}

.loading {
  text-align: center;
  font-size: 16px;
}
</style>
