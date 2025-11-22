import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isLoggedIn: false,   // 로그인 상태
        userEmail: '',       // 사용자 이메일
        accessToken: '',     // Access Token
    }),
    actions: {
        setAuthData(token, email) {
            this.isLoggedIn = true;
            this.accessToken = token;
            this.userEmail = email;
            localStorage.setItem('authToken', token); // 로그인 시 토큰 저장
            localStorage.setItem('userEmail', email); // 이메일 저장
        },
        clearAuthData() {
            this.isLoggedIn = false;
            this.accessToken = '';
            this.userEmail = '';
            localStorage.removeItem('authToken');
            localStorage.removeItem('userEmail');
        },
        loadStoredAuth() {
            const token = localStorage.getItem('authToken');
            const email = localStorage.getItem('userEmail');
            if (token && email) {
                this.setAuthData(token, email); // localStorage에서 데이터 로드
            }
        },
    },
});
