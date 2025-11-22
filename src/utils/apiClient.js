import axios from 'axios';
import { useAuthStore } from './auth.js'; // Pinia store 가져오기

// Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: 'https://met1ylogcb.execute-api.us-east-1.amazonaws.com/papaya-pokemon-pocket-tcg', // 기본 API URL
    timeout: 10000, // 요청 제한 시간 설정 (예: 10초)
});

// 요청 인터셉터 설정
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore(); // Pinia store에서 인증 정보 가져오기
        const token = authStore.accessToken; // accessToken 가져오기

        if (token) {
            config.headers.Authorization = `${token}`; // Authorization 헤더에 토큰 추가
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
