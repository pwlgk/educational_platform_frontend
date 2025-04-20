// src/store/forum.store.ts
import { defineStore } from 'pinia';
import {
    ForumService,
    type ForumCategory,
    type ForumTopic,
    type ForumTopicList, // Упрощенный тип для списка тем
    type ForumPost,
    type ForumPostRequest, // Для создания поста
    type ForumTopicRequest, // Для создания темы
    ApiError
} from '@/services/generated';
import { getErrorMessage } from './_helpers';
import type { User } from '@/services/generated'; // Для информации об авторе

interface ForumState {
  categories: ForumCategory[];
  currentCategory: ForumCategory | null;
  topics: ForumTopicList[]; // Список тем в текущей категории (используем упрощенный тип)
  currentTopic: ForumTopic | null; // Полные данные текущей темы
  currentTopicPosts: ForumPost[]; // Посты текущей темы
  // Пагинация (если нужна для тем/постов)
  topicsPagination: { /* ... */ } | null;
  postsPagination: { /* ... */ } | null;
  // Статусы загрузки
  isLoadingCategories: boolean;
  isLoadingTopics: boolean;
  isLoadingTopic: boolean;
  isLoadingPosts: boolean;
  isCreatingTopic: boolean;
  isCreatingPost: boolean;
  isLikingPost: Set<number>; // ID постов, которые лайкаются
  // Ошибки
  errorCategories: string | null;
  errorTopics: string | null;
  errorTopic: string | null;
  errorPosts: string | null;
  errorTopicCreate: string | null;
  errorPostCreate: string | null;
}

export const useForumStore = defineStore('forum', {
  state: (): ForumState => ({
    categories: [],
    currentCategory: null,
    topics: [],
    currentTopic: null,
    currentTopicPosts: [],
    topicsPagination: null,
    postsPagination: null,
    isLoadingCategories: false,
    isLoadingTopics: false,
    isLoadingTopic: false,
    isLoadingPosts: false,
    isCreatingTopic: false,
    isCreatingPost: false,
    isLikingPost: new Set(),
    errorCategories: null,
    errorTopics: null,
    errorTopic: null,
    errorPosts: null,
    errorTopicCreate: null,
    errorPostCreate: null,
  }),

  getters: {
    getCategories: (state): ForumCategory[] => state.categories,
    getCurrentCategory: (state): ForumCategory | null => state.currentCategory,
    getTopics: (state): ForumTopicList[] => state.topics,
    getCurrentTopic: (state): ForumTopic | null => state.currentTopic,
    getCurrentTopicPosts: (state): ForumPost[] => state.currentTopicPosts,
    // Геттеры статусов
    getIsLoadingCategories: (state): boolean => state.isLoadingCategories,
    getIsLoadingTopics: (state): boolean => state.isLoadingTopics,
    getIsLoadingTopic: (state): boolean => state.isLoadingTopic,
    getIsLoadingPosts: (state): boolean => state.isLoadingPosts,
    // Геттер для проверки лайка поста (используем данные из ForumPost.is_liked_by_current_user)
  },

  actions: {
    // --- Категории ---
    async fetchCategories() {
      if (this.isLoadingCategories) return;
      console.log('[forumStore] Fetching categories...');
      this.isLoadingCategories = true;
      this.errorCategories = null;
      try {
        this.categories = await ForumService.forumCategoriesList();
        console.log(`[forumStore] Fetched ${this.categories.length} categories.`);
      } catch (error: any) {
        console.error('[forumStore] Failed to fetch categories:', getErrorMessage(error), error);
        this.errorCategories = getErrorMessage(error) || 'Failed to load categories';
        this.categories = [];
      } finally {
        this.isLoadingCategories = false;
      }
    },

    // --- Темы ---
    async fetchTopics(categorySlug: string, params?: { author?: number, search?: string, ordering?: string /*, page?: number */ }) {
        if (this.isLoadingTopics) return;
        console.log(`[forumStore] Fetching topics for category ${categorySlug}...`, params);
        this.isLoadingTopics = true;
        this.errorTopics = null;
        this.topics = [];
        // Загружаем детали категории, если их еще нет
        if (this.currentCategory?.slug !== categorySlug) {
            await this.fetchCategoryDetails(categorySlug);
        }
        try {
            // --- ИСПРАВЛЕНИЕ: Передаем параметры query напрямую ---
            // Проверьте точные имена параметров в ForumService.forumTopicsList
            const response = await ForumService.forumTopicsList(
                params?.author,
                categorySlug, // Используем параметр categorySlug
                params?.ordering,
                params?.search,
                params?.tagsName
                // page: params?.page // Добавить, если нужно
            );
          // Обрабатываем ответ (массив или объект пагинации)
          if (Array.isArray(response)) {
               this.topics = response;
               this.topicsPagination = null;
          } else if (response && Array.isArray(response.results)) {
              this.topics = response.results;
              // this.topicsPagination = { ... }; // Обработка пагинации
          } else {
               console.warn("[forumStore] Unexpected response format for topics list.");
               this.topics = [];
               this.topicsPagination = null;
          }
         console.log(`[forumStore] Fetched ${this.topics.length} topics for category ${categorySlug}.`);
      } catch (error: any) {
        console.error(`[forumStore] Failed to fetch topics for ${categorySlug}:`, getErrorMessage(error), error);
        this.errorTopics = getErrorMessage(error) || 'Failed to load topics';
        this.topics = [];
        this.topicsPagination = null;
      } finally {
        this.isLoadingTopics = false;
      }
    },

    // Загрузка деталей текущей категории (опционально)
    async fetchCategoryDetails(categorySlug: string) {
        // Проверка, не пустой ли слаг
        if (!categorySlug) {
            console.warn('[forumStore] fetchCategoryDetails called with empty slug.');
            this.currentCategory = null;
            return;
        }
        // Не грузим, если уже загружена эта категория
        if (this.currentCategory?.slug === categorySlug) {
            console.log(`[forumStore] Category details for ${categorySlug} already loaded.`);
            return;
        }
        console.log(`[forumStore] Fetching details for category ${categorySlug}...`);
        // Можно добавить флаг isLoadingCategory, если нужно
        // this.isLoadingCategory = true;
        try {
            // --- ИСПРАВЛЕНИЕ: Передаем слаг напрямую ---
            this.currentCategory = await ForumService.forumCategoriesRetrieve(categorySlug); // <-- Передаем строку
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
            console.log(`[forumStore] Fetched category details for ${categorySlug}.`);
        } catch (error: any) {
             console.error(`[forumStore] Failed to fetch category details for ${categorySlug}:`, getErrorMessage(error), error);
             this.currentCategory = null; // Сбрасываем при ошибке
             // Можно установить errorCategories
             this.errorCategories = getErrorMessage(error) || 'Failed to load category details';
        } finally {
             // this.isLoadingCategory = false;
        }
    },

    // Создание новой темы
    async createTopic(topicData: ForumTopicRequest): Promise<ForumTopic | null> {
        if (this.isCreatingTopic) return null;
        console.log('[forumStore] Creating new topic...', topicData);
        this.isCreatingTopic = true;
        this.errorTopicCreate = null;
        try {
            // Передаем данные напрямую
            const newTopic = await ForumService.forumTopicsCreate(topicData);
            console.log('[forumStore] Topic created:', newTopic);
            // Можно добавить новую тему в список this.topics или перезапросить
            // this.topics.unshift(newTopic); // Добавить в начало (но тип может не совпасть с ForumTopicList)
            // Лучше перезапросить список для текущей категории, если она есть
            if (this.currentCategory?.slug) {
                 await this.fetchTopics(this.currentCategory.slug);
            }
            return newTopic;
        } catch (error: any) {
             console.error('[forumStore] Failed to create topic:', getErrorMessage(error), error);
             this.errorTopicCreate = getErrorMessage(error) || 'Failed to create topic';
             return null;
        } finally {
             this.isCreatingTopic = false;
        }
    },


    // --- Посты ---
    async fetchTopicAndPosts(topicId: number | string) {
        // Можно не грузить, если уже открыта эта тема
        // if (this.currentTopic?.id === Number(topicId)) return;
         if (this.isLoadingTopic || this.isLoadingPosts) return;
         const numericTopicId = Number(topicId);
         if (isNaN(numericTopicId)) { /* ... обработка ошибки ... */ return; }

        console.log(`[forumStore] Fetching topic ${numericTopicId} details and posts...`);
        this.isLoadingTopic = true;
        this.isLoadingPosts = true; // Грузим и то, и другое
        this.errorTopic = null;
        this.errorPosts = null;
        this.currentTopic = null;
        this.currentTopicPosts = [];

        try {
            // 1. Загружаем детали темы
            this.currentTopic = await ForumService.forumTopicsRetrieve(numericTopicId);
            console.log(`[forumStore] Fetched topic details for ${numericTopicId}.`);
            this.isLoadingTopic = false; // Загрузка темы завершена

            // 2. Загружаем посты для этой темы
            // Используем эндпоинт /api/forum/topics/{id}/posts/ ?
            // Или общий /api/forum/posts/ с фильтром по topic_id ?
            // Проверьте ваш API и NewsService!
            // Предположим, есть метод forumPostsList с фильтром topicId
            const postsResponse = await ForumService.forumPostsList({
                topic: numericTopicId // Передаем ID темы как ОБЯЗАТЕЛЬНЫЙ параметр
           });             if (Array.isArray(postsResponse)) {
                  this.currentTopicPosts = postsResponse.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); // Старые сверху
                  this.postsPagination = null;
             } else if (postsResponse && Array.isArray(postsResponse.results)) {
                  this.currentTopicPosts = postsResponse.results.sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                  // this.postsPagination = { ... };
             } else {
                   console.warn("[forumStore] Unexpected response format for posts list.");
                  this.currentTopicPosts = [];
                  this.postsPagination = null;
             }
            console.log(`[forumStore] Fetched ${this.currentTopicPosts.length} posts for topic ${numericTopicId}.`);

        } catch (error: any) {
             console.error(`[forumStore] Failed to fetch topic/posts for ${numericTopicId}:`, getErrorMessage(error), error);
             // Устанавливаем обе ошибки, если что-то пошло не так
             this.errorTopic = getErrorMessage(error) || `Failed to load topic ${numericTopicId}`;
             this.errorPosts = getErrorMessage(error) || `Failed to load posts for topic ${numericTopicId}`;
             this.currentTopic = null;
             this.currentTopicPosts = [];
        } finally {
             this.isLoadingTopic = false; // Сбрасываем оба флага
             this.isLoadingPosts = false;
        }
    },

    // Создание нового поста (или ответа)
    async createPost(postData: ForumPostRequest): Promise<ForumPost | null> {
        if (this.isCreatingPost || !this.currentTopic) return null; // Нужна активная тема
        console.log(`[forumStore] Creating post for topic ${this.currentTopic.id}...`, postData);
        this.isCreatingPost = true;
        this.errorPostCreate = null;
        try {
            // Убедимся, что topic ID добавлен в postData (если его там нет)
            if (!postData.topic) {
                 postData.topic = this.currentTopic.id;
            }
            // Вызов API
            const newPost = await ForumService.forumPostsCreate(postData);
            console.log('[forumStore] Post created:', newPost);
            // Добавляем новый пост в конец списка (или в ответы, если это ответ)
            if (postData.parent) {
                // TODO: Логика добавления ответа к родителю (как в новостях)
                 const parentPost = this._findPostById(this.currentTopicPosts, postData.parent);
                 if (parentPost) {
                     if (!parentPost.replies) parentPost.replies = [];
                     if(Array.isArray(parentPost.replies)) { // Проверка типа replies
                        parentPost.replies.push(newPost as any); // TODO: Уточнить тип replies
                     } else {
                          this.currentTopicPosts.push(newPost);
                     }
                 } else {
                      this.currentTopicPosts.push(newPost);
                 }
            } else {
                 this.currentTopicPosts.push(newPost);
            }
            // Обновляем счетчик постов в теме
             if(this.currentTopic) {
                 this.currentTopic.post_count = (this.currentTopic.post_count ?? 0) + 1;
             }
            return newPost;
        } catch (error: any) {
             console.error('[forumStore] Failed to create post:', getErrorMessage(error), error);
             this.errorPostCreate = getErrorMessage(error) || 'Failed to create post';
             return null;
        } finally {
             this.isCreatingPost = false;
        }
    },

    // Лайк/дизлайк поста
    async likePost(postId: number) {
         if (this.isLikingPost.has(postId)) return;
         console.log(`[forumStore] Liking post ${postId}...`);
         this.isLikingPost.add(postId);
         const originalPost = JSON.parse(JSON.stringify(
             this._findPostById(this.currentTopicPosts, postId)
         ));
         try {
            this._updatePostInStateOptimistic(postId, true); // Оптимистичное обновление

            // --- ИСПРАВЛЕНИЕ: Передаем ID и requestBody правильно ---
            // Метод ожидает id: number, requestBody: ForumPostRequest
            // Передаем ID напрямую, а для requestBody - пустой объект (или undefined, если тип requestBody необязательный?)
            // ВАЖНО: Проверьте сигнатуру forumPostsLikeCreate - второй аргумент обязательный или нет?
            // Если requestBody: ForumPostRequest (обязательный), передаем {}
            // Если requestBody?: ForumPostRequest (необязательный), передаем undefined
            const updatedPost = await ForumService.forumPostsLikeCreate(
                postId,
                {} // <--- Передаем пустой объект, так как тип requestBody: ForumPostRequest
                // undefined // <--- Используйте это, если тип requestBody?: ForumPostRequest
            );
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

            this._updatePostInState(updatedPost); // Обновляем данными с сервера
            console.log(`[forumStore] Post ${postId} liked.`);
        } catch (error: any) {
              console.error(`[forumStore] Failed to like post ${postId}:`, getErrorMessage(error), error);
              if(originalPost) this._updatePostInState(originalPost);
         } finally {
             this.isLikingPost.delete(postId);
         }
    },

    async unlikePost(postId: number) {
        if (this.isLikingPost.has(postId)) return;
        console.log(`[forumStore] Unliking post ${postId}...`);
        this.isLikingPost.add(postId);
        const originalPost = JSON.parse(JSON.stringify(
             this._findPostById(this.currentTopicPosts, postId)
         ));
         try {
              this._updatePostInStateOptimistic(postId, false);
              // Вызов API: ID напрямую
              await ForumService.forumPostsLikeDestroy({ id: postId });
              console.log(`[forumStore] Post ${postId} unliked.`);
         } catch (error: any) {
              const status = (error instanceof ApiError) ? error.status : error.response?.status;
              console.error(`[forumStore] Failed to unlike post ${postId}:`, getErrorMessage(error), error);
              if (status !== 404) { // Игнорируем 404, откатываем другие ошибки
                   if(originalPost) this._updatePostInState(originalPost);
              } else {
                  console.log(`[forumStore] Unlike post ${postId} returned 404 (already unliked).`);
              }
         } finally {
              this.isLikingPost.delete(postId);
         }
    },

    // --- Вспомогательные методы ---
    _findPostById(posts: ForumPost[] | undefined | null, postId: number): ForumPost | null {
        if (!posts) return null;
        for (const post of posts) {
            if (post.id === postId) {
                return post;
            }
             // Рекурсивный поиск в ответах, если replies есть и это массив ForumPost
            if (Array.isArray(post.replies) && post.replies.length > 0) {
                // Убедитесь, что тип replies это ForumPost[]
                const foundInReply = this._findPostById(post.replies as ForumPost[], postId);
                if (foundInReply) return foundInReply;
            }
        }
        return null;
    },

    _updatePostInState(updatedPost: ForumPost) {
        const postRef = this._findPostById(this.currentTopicPosts, updatedPost.id);
        if (postRef) {
            Object.assign(postRef, updatedPost);
        }
    },

     _updatePostInStateOptimistic(postId: number, isLiked: boolean) {
        const postRef = this._findPostById(this.currentTopicPosts, postId);
        if (postRef) {
             const currentLikes = postRef.likes_count ?? 0;
             postRef.is_liked_by_current_user = isLiked;
             postRef.likes_count = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
         }
    },

    // Очистка состояния при выходе со страницы темы/категории
    clearCurrentTopicAndPosts() {
        this.currentTopic = null;
        this.currentTopicPosts = [];
        this.postsPagination = null;
        this.errorTopic = null;
        this.errorPosts = null;
    },
    clearCurrentCategoryAndTopics() {
        this.currentCategory = null;
        this.topics = [];
        this.topicsPagination = null;
        this.errorTopics = null;
    },
    // Полная очистка при выходе пользователя
    clearForumState() {
        this.clearCurrentTopicAndPosts();
        this.clearCurrentCategoryAndTopics();
        this.categories = [];
        this.errorCategories = null;
        // Сброс флагов загрузки и ошибок создания
        this.isLoadingCategories = false;
        this.isLoadingTopics = false;
        this.isLoadingTopic = false;
        this.isLoadingPosts = false;
        this.isCreatingTopic = false;
        this.isCreatingPost = false;
        this.isLikingPost.clear();
        this.errorTopicCreate = null;
        this.errorPostCreate = null;
    }
  },
});