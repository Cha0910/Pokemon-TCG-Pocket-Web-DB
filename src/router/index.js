import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import DeckPage from '../views/DeckPage.vue';
import UserPage from '../views/UserPage.vue';
import DeckLists from "@/views/DeckLists.vue";

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/decks', name: 'DeckPage', component: DeckPage },
    { path: '/decks/:main_card_id', component: DeckLists, name: "DeckLists", props: true },
    { path: '/user', name: 'UserPage', component: UserPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
