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
    </div>

    <div class="card-list">
      <div v-for="card in cards" :key="card.id" class="card">
        <img :src="card.url" :alt="card.id" />
        <p>{{ card.id }}</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading">로딩 중...</div>
  </div>
</template>

<script>
import axios from "axios";

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
      types: ["풀", "불꽃", "물", "번개", "초", "격투", "악", "강철",   "드래곤", "무색", "서포트", "아이템"],
      cards: [], // 검색 결과 카드
      isLoading: false,
    };
  },
  methods: {
    async onSearch() {
      this.isLoading = true;
      try {
        const params = { ...this.filters };
        const response = await axios.get("https://met1ylogcb.execute-api.us-east-1.amazonaws.com/papaya-pokemon-pocket-tcg/cards/search", { params });
        this.cards = response.data.body;
      } catch (error) {
        console.error("검색 중 오류:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async resetFilters() {
      // 필터 초기화 및 전체 데이터 가져오기
      this.filters = {
        name: "",
        min_hp: null,
        max_hp: null,
        retreat_energy: null,
        type: "",
      };
      await this.onSearch(); // 전체 데이터를 다시 로드
    },
    async fetchAllCards() {
      // 사이트 로드 시 전체 데이터 로드
      this.isLoading = true;
      try {
        const response = await axios.get("https://met1ylogcb.execute-api.us-east-1.amazonaws.com/papaya-pokemon-pocket-tcg/cards/search");
        this.cards = response.data.body;
      } catch (error) {
        console.error("전체 카드 데이터를 가져오는 중 오류:", error);
      } finally {
        this.isLoading = false;
      }
    },
    increaseHp(type) {
      if (type === "min") {
        this.filters.min_hp += 10;
      } else if (type === "max") {
        this.filters.max_hp += 10;
      }
    },
    decreaseHp(type) {
      if (type === "min" && this.filters.min_hp > 0) {
        this.filters.min_hp -= 10;
      } else if (type === "max" && this.filters.max_hp > 0) {
        this.filters.max_hp -= 10;
      }
    },
  },
  mounted() {
    this.fetchAllCards(); // 초기 로드 시 전체 데이터 표시
  },
};
</script>

<style>
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
  background-color: #f44336; /* 초기화 버튼 색상 */
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

.loading {
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
}
</style>
