<template>
  <div class="search-page">
    <div class="filters">
      <input
          v-model="filters.name"
          type="text"
          placeholder="카드 이름 검색"
      />
      <div class="hp-filter">
        <input
            v-model.number="filters.min_hp"
            type="number"
            placeholder="최소 HP"
        />
        <button @click="decreaseHp('min')">-</button>
        <button @click="increaseHp('min')">+</button>
      </div>
      <div class="hp-filter">
        <input
            v-model.number="filters.max_hp"
            type="number"
            placeholder="최대 HP"
        />
        <button @click="decreaseHp('max')">-</button>
        <button @click="increaseHp('max')">+</button>
      </div>
      <input
          v-model.number="filters.retreat_energy"
          type="number"
          placeholder="후퇴 에너지"
      />
      <select v-model="filters.type">
        <option value="">모든 타입</option>
        <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
      </select>
      <button @click="onSearch" class="search-button">검색</button>
      <button @click="resetFilters" class="reset-button">초기화</button>
      <label for="file-upload" class="input-file-label">CSV 파일 업로드</label>
      <input type="file" id="file-upload" class="input-file" @change="handleFileUpload" />
    </div>

    <div class="card-list">
      <div v-for="card in cards" :key="card.card_id" class="card">
        <img :src="card.url" :alt="card.card_id" />
        <div class="card-details">
          <p class="card-id">{{ card.card_id }}</p>
          <div class="counter">
            <button @click="decreaseCount(card.card_id)">-</button>
            <span>{{ card.count }}</span>
            <button @click="increaseCount(card.card_id)">+</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading">로딩 중...</div>
  </div>
</template>

<script>
import apiClient from '../utils/apiClient'; // apiClient 가져오기

export default {
  data() {
    return {
      filters: {
        name: "",
        min_hp: null,
        max_hp: null,
        retreat_energy: null,
        type: "",
      },
      types: ["풀", "불꽃", "물", "번개", "초", "격투", "악", "강철", "드래곤", "무색", "서포트", "아이템"],
      cards: [], // 필터링된 카드 데이터
      isLoading: false,
    };
  },
  methods: {
    async onSearch() {
      this.isLoading = true;
      try {
        const params = {...this.filters};
        const response = await apiClient.get("users/get-cards", {params});
        this.cards = response.data; // 서버에서 반환된 필터링된 카드 목록
      } catch (error) {
        console.error("검색 중 오류:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async resetFilters() {
      this.filters = {
        name: "",
        min_hp: null,
        max_hp: null,
        retreat_energy: null,
        type: "",
      };
      await this.onSearch();
    },
    async fetchAllCards() {
      this.isLoading = true;
      try {
        const params = {...this.filters};
        const response = await apiClient.get("users/get-cards", {params});
        this.cards = response.data;
      } catch (error) {
        console.error("전체 카드 데이터를 가져오는 중 오류:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async increaseCount(cardId) {
      const card = this.cards.find((c) => c.card_id === cardId);
      if (card) {
        card.count++;
        await this.updateCardCount(card);
      }
    },
    async decreaseCount(cardId) {
      const card = this.cards.find((c) => c.card_id === cardId);
      if (card && card.count > 0) {
        card.count--;
        await this.updateCardCount(card);
      }
    },
    async updateCardCount(card) {
      try {
        const data = {
          cards: {
            [card.card_id]: card.count
          }
        };  // 요청 데이터 포맷

        // POST 요청을 통해 서버로 데이터 전송
        const response = await apiClient.post("users/update-cards", data);
        if (response.status === 200) {
          console.log('카드 수가 성공적으로 업데이트되었습니다.');
        } else {
          console.error('카드 수 업데이트 실패:', response);
        }
      } catch (error) {
        console.error('카드 수 업데이트 중 오류:', error);
      }
    },

    // CSV 파일 업로드 처리
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = this.processCSV;
      reader.readAsText(file);
    },

    // CSV 파일 처리 후 카드 업데이트
    processCSV(event) {
      const csvData = event.target.result;
      const lines = csvData.split("\n");

      // 첫 번째 줄은 'card_id, name, count'이므로 건너뜀
      const dataLines = lines.slice(1);

      const cardUpdates = {};

      // 각 카드 데이터를 처리
      dataLines.forEach(line => {
        const [card_id, card_name, count] = line.split(",").map(str => str.trim());

        // 유효한 데이터만 처리
        if (card_id && count > 0) {
          cardUpdates[card_id] = Number(count);  // 카드 수는 숫자로 변환
        }
      });

      // 카드 데이터 업데이트
      this.updateCardData(cardUpdates).then(() => {
        // 카드 데이터 업데이트 후 최신 카드 리스트를 불러옵니다.
        this.fetchAllCards();
      });
    },

    async updateCardData(cardUpdates) {
      try {
        // 카드 업데이트 데이터 준비
        const data = {
          cards: cardUpdates  // 여러 카드 정보를 한 번에 보냄
        };

        console.log("Sending data to server:", data);  // 전송할 데이터 확인

        // 한 번의 POST 요청으로 모든 카드 데이터를 서버로 전송
        const response = await apiClient.post("users/update-cards", data);

        if (response.status === 200) {
          console.log('카드 수가 성공적으로 업데이트되었습니다.');
        } else {
          console.error('카드 수 업데이트 실패:', response);
        }
      } catch (error) {
        console.error('카드 수 업데이트 중 오류:', error);
      }
    },
  },

  mounted() {
    this.fetchAllCards(); // 초기 로드 시 전체 데이터 표시
  },
};
</script>

<style>
/* 기존 스타일 유지 */
.search-page {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.filters {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.filters input,
.filters select,
.filters button {
  padding: 8px;
  font-size: 14px;
}

.hp-filter {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-button {
  border: none;
  cursor: pointer;
  width: 60px;
  display: inline-block;
}

.reset-button {
  background-color: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  width: 70px;
  display: inline-block;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.card img {
  width: 100%;
  height: auto;
}

.card-details {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.card-id {
  margin-right: 25px;
  font-size: 16px;
  font-weight: bold;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  gap: 10px;
}

.counter button {
  padding: 4px 8px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: #1f73b7;
  color: white;
  cursor: pointer;
}

.counter button:hover {
  background-color: #155a96;
}

.counter span {
  font-size: 14px;
  font-weight: bold;
}

.loading {
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
}
/* CSV 파일 업로드 버튼 */
.input-file {
  display: none; /* 기본 파일 선택 버튼 숨기기 */
}

.input-file-label {
  padding: 10px 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  margin-left: 10px;
  width: 150px;
  box-sizing: border-box; /* padding 포함하여 너비 맞춤 */
  text-align: center; /* 버튼 텍스트 중앙 정렬 */
}

.input-file-label:hover {
  background-color: #388e3c;
}
</style>
