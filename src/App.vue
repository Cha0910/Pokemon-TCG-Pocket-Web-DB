<template>
  <div>
    <!-- 헤더 -->
    <div class="header">
      <nav class="nav-links">
        <router-link to="/">홈</router-link>
        <router-link to="/decks">덱 페이지</router-link>
        <router-link to="/user">유저 페이지</router-link>
      </nav>
      <div class="auth-buttons">
        <span v-if="authStore.isLoggedIn" class="user-email">{{ authStore.userEmail }}</span>
        <button v-if="!authStore.isLoggedIn" @click="login">로그인</button>
        <button v-if="authStore.isLoggedIn" @click="logout">로그아웃</button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <router-view />
  </div>
</template>

<script>
import { useAuthStore } from "./utils/auth"; // Pinia store 가져오기

export default {
  setup() {
    const authStore = useAuthStore();

    // 로그인
    const login = () => {

      const {domain, clientId, redirectUri, scope} = {
        domain: 'https://us-east-1jsczlhjsc.auth.us-east-1.amazoncognito.com',
        clientId: '1qstg7ulhuvkclo14vslj5vg9l',
        redirectUri: 'http://localhost:5173',
        scope: 'email openid phone',
      };

      localStorage.setItem('last_visited_url', window.location.href);
      const loginUrl = `${domain}/login?client_id=${clientId}&response_type=code&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = loginUrl;
    };

    // 로그아웃
    const logout = () => {
      authStore.clearAuthData(); // Pinia store에서 로그인 정보 초기화
      window.location.href = 'https://us-east-1jsczlhjsc.auth.us-east-1.amazoncognito.com/logout?client_id=1qstg7ulhuvkclo14vslj5vg9l&logout_uri=http://localhost:5173';
    };

    // Authorization Code로 토큰 교환
    const exchangeCodeForToken = async (authCode) => {
      const {domain, clientId, redirectUri} = {
        domain: 'https://us-east-1jsczlhjsc.auth.us-east-1.amazoncognito.com',
        clientId: '1qstg7ulhuvkclo14vslj5vg9l',
        redirectUri: 'http://localhost:5173',
      };

      const tokenUrl = `${domain}/oauth2/token`;

      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            code: authCode,
            redirect_uri: redirectUri,
          }),
        });

        if (response.ok) {
          const tokenData = await response.json();
          const token = tokenData.id_token; // id_token 받기
          const email = tokenData.email; // 이메일 받기

          authStore.setAuthData(token, email); // Pinia store에 로그인 정보 저장

        } else {
          console.error('Failed to exchange code for token:', await response.text());
        }
      } catch (error) {
        console.error('Error exchanging code for token:', error.message);
      }
    };

    // URL에서 Authorization Code 추출
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      exchangeCodeForToken(code); // Authorization Code로 토큰 교환
    }

    return {
      authStore, // Pinia store 반환
      login,
      logout,
    };
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.nav-links {
  display: flex;
  gap: 10px;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-email {
  font-size: 14px;
  color: #555;
}

button {
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #1f73b7;
  color: white;
}

button:hover {
  background-color: #155a96;
}
</style>
