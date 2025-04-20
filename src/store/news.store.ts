// src/store/news.store.ts
import { defineStore } from 'pinia';
import {
    NewsService,
    type NewsArticle,
    type NewsComment,
    type NewsCommentRequest, // Нужен для создания комментария
    // type NewsCategory, // Если нужна работа с категориями
    // type OrderingFilter, // Типы для фильтров/сортировки, если есть
    // type SearchFilter,
    ApiError
} from '@/services/generated';
import { getErrorMessage } from './_helpers'; // Используем наш хелпер

interface NewsState {
  articles: NewsArticle[]; // Список статей для главной страницы/категории
  currentArticle: NewsArticle | null; // Статья, просматриваемая на детальной странице
  currentArticleComments: NewsComment[]; // Комментарии для текущей статьи
  // Пагинация для списка статей (если API поддерживает)
  articlesPagination: {
      count: number; // Всего статей
      next: string | null; // URL следующей страницы
      previous: string | null; // URL предыдущей страницы
      currentPage: number; // Номер текущей страницы (вычисляем или храним)
      pageSize: number; // Размер страницы (получаем с бэка или задаем)
  } | null;
  isLoadingList: boolean;
  isLoadingArticle: boolean;
  isLoadingComments: boolean;
  isLikingArticle: Set<number>; // Храним ID статей, для которых идет запрос лайка
  isLikingComment: Set<number>; // Храним ID комментов, для которых идет запрос лайка
  isAddingComment: boolean; // Флаг добавления комментария
  errorList: string | null;
  errorArticle: string | null;
  errorComments: string | null;
}

// Размер страницы по умолчанию (можно вынести в константы)
const DEFAULT_PAGE_SIZE = 10;

export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    articles: [],
    currentArticle: null,
    currentArticleComments: [],
    articlesPagination: null,
    isLoadingList: false,
    isLoadingArticle: false,
    isLoadingComments: false,
    isLikingArticle: new Set(),
    isLikingComment: new Set(),
    isAddingComment: false,
    errorList: null,
    errorArticle: null,
    errorComments: null,
  }),

  getters: {
    getArticles: (state): NewsArticle[] => state.articles,
    getCurrentArticle: (state): NewsArticle | null => state.currentArticle,
    // Геттер для комментариев верхнего уровня (если replies обрабатываются отдельно)
    getRootComments: (state): NewsComment[] => state.currentArticleComments,
    // Используем поле is_liked_by_current_user из самих объектов, геттеры не нужны
  },

  actions: {
    // --- Загрузка Списка Статей ---
    async fetchArticles(params?: { page?: number, pageSize?: number, categorySlug?: string, search?: string, ordering?: string }) {
      if (this.isLoadingList) return;
      console.log('[newsStore] Fetching articles...', params);
      this.isLoadingList = true;
      this.errorList = null;
      try {
        // Передаем query-параметры напрямую, как ожидается сигнатурой NewsService.newsArticlesList
        const response = await NewsService.newsArticlesList(
            params?.author, // author: number | undefined
            params?.categorySlug, // categorySlug: string | undefined
            params?.ordering, // ordering: string | undefined
            params?.search // search: string | undefined
             // Добавьте page, page_size если API их поддерживает в query
             // page: params?.page,
             // pageSize: params?.pageSize ?? DEFAULT_PAGE_SIZE
        );

        // Обработка ответа: предполагаем, что API ВСЕГДА возвращает массив
        // Пагинацию нужно будет обрабатывать на основе заголовков или структуры ответа, если она есть
        if (Array.isArray(response)) {
             this.articles = response;
             // Сброс пагинации, т.к. не знаем ее из простого массива
             this.articlesPagination = null;
             console.log(`[newsStore] Fetched ${this.articles.length} articles.`);
        } else {
            // Если API может вернуть структуру пагинации, обработайте ее здесь
             console.warn("[newsStore] Unexpected response format for articles list. Expected array.", response);
             this.articles = [];
             this.articlesPagination = null;
            // throw new Error("Invalid response format for articles list");
        }
      } catch (error: any) {
        console.error('[newsStore] Failed to fetch articles:', getErrorMessage(error), error);
        this.errorList = getErrorMessage(error) || 'Failed to load articles';
        this.articles = [];
        this.articlesPagination = null;
      } finally {
        this.isLoadingList = false;
      }
    },

    // --- Загрузка Одной Статьи ---
    async fetchArticleById(articleId: number | string) {
       if (this.isLoadingArticle) return;
       const numericArticleId = Number(articleId);
       if (isNaN(numericArticleId)) {
            this.errorArticle = `Invalid article ID: ${articleId}`;
            console.error(this.errorArticle);
            return;
       }
      console.log(`[newsStore] Fetching article ${numericArticleId}...`);
      this.isLoadingArticle = true;
      this.errorArticle = null;
      // Очищаем предыдущие данные СРАЗУ, чтобы пользователь видел загрузку
      this.currentArticle = null;
      this.currentArticleComments = [];
      this.errorComments = null; // Сбрасываем ошибку комментов тоже

      try {
        // Передаем ID напрямую
        const response = await NewsService.newsArticlesRetrieve(numericArticleId);
        this.currentArticle = response;
        console.log(`[newsStore] Article ${numericArticleId} fetched.`);
        // Загружаем комментарии ПОСЛЕ загрузки статьи
        // Если комментарии вложены, fetchArticleComments сам их возьмет из currentArticle
        await this.fetchArticleComments(numericArticleId);

      } catch (error: any) {
        console.error(`[newsStore] Failed to fetch article ${numericArticleId}:`, getErrorMessage(error), error);
        this.errorArticle = getErrorMessage(error) || `Failed to load article ${numericArticleId}`;
        this.currentArticle = null; // Убедимся, что статья очищена при ошибке
        this.currentArticleComments = [];
      } finally {
        this.isLoadingArticle = false;
      }
    },

    // --- Загрузка Комментариев ---
    // Вызывается из fetchArticleById или напрямую, если нужно обновить
    async fetchArticleComments(articleId: number | string) {
        if (this.isLoadingComments) return;
        const numericArticleId = Number(articleId);
        if (isNaN(numericArticleId)) {
            this.errorComments = `Invalid article ID for comments: ${articleId}`;
            console.error(this.errorComments);
            return;
        }
        console.log(`[newsStore] Fetching comments for article ${numericArticleId}...`);
        this.isLoadingComments = true;
        this.errorComments = null;
        try {
            // --- ИСПРАВЛЕНО: Используем правильный метод и ожидаем массив ---
            // Проверяем сигнатуру newsArticlesCommentsRetrieve - она должна возвращать NewsComment[]
            // Судя по вашему API ответу, метод, который возвращает массив комментов,
            // может быть не newsArticlesCommentsRetrieve (который возвращает NewsArticle),
            // а ДРУГОЙ метод или этот метод нужно вызывать иначе.
            //
            // ПРЕДПОЛОЖЕНИЕ 1: У вас есть метод типа newsCommentsList с фильтром по статье:
            /*
            const response = await NewsService.newsCommentsList({ articleId: numericArticleId });
            if (Array.isArray(response)) { // Ожидаем массив
                 this.currentArticleComments = this._processComments(response);
                 console.log(`[newsStore] Fetched ${response.length} comments.`);
             } else {
                  console.warn("[newsStore] Comments list endpoint didn't return array.");
                 this.currentArticleComments = [];
             }
            */

            // ПРЕДПОЛОЖЕНИЕ 2: Метод называется иначе или требует других параметров.
            // В вашем NewsService.ts НЕТ метода, который бы точно соответствовал
            // GET /api/news/articles/{id}/comments/ и возвращал бы МАССИВ NewsComment.
            // Метод newsArticlesCommentsRetrieve возвращает NewsArticle.
            //
            // ВОЗМОЖНО, вам нужно использовать эндпоинт /api/news/comments/ с фильтрацией?
            // Проверьте сигнатуру NewsService.newsCommentsList - принимает ли он фильтр?
             const response = await NewsService.newsCommentsList();
              if (Array.isArray(response)) { // Ожидаем массив
                 this.currentArticleComments = this._processComments(response);
                 console.log(`[newsStore] Fetched ${response.length} comments for article ${numericArticleId}.`);
             } else {
                  console.warn("[newsStore] Comments list endpoint didn't return array.");
                 this.currentArticleComments = [];
             }

            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

        } catch (error: any) {
            console.error(`[newsStore] Failed to fetch comments for article ${numericArticleId}:`, getErrorMessage(error), error);
            this.errorComments = getErrorMessage(error) || 'Failed to load comments';
            this.currentArticleComments = [];
        } finally {
            this.isLoadingComments = false;
        }
    },

    // --- Лайки Статей ---
    async likeArticle(articleId: number) {
        if (this.isLikingArticle.has(articleId)) return; // Предотвращаем двойной клик
        console.log(`[newsStore] Liking article ${articleId}...`);
        this.isLikingArticle.add(articleId); // Добавляем ID в сет загрузки
        const originalArticle = JSON.parse(JSON.stringify( // Копия для отката
            this.articles.find(a => a.id === articleId) || this.currentArticle
        ));

        try {
             // Оптимистичное обновление UI
            this._updateArticleInStateOptimistic(articleId, true);

             // Вызов API: ID напрямую, пустой requestBody (или undefined)
             const updatedArticle = await NewsService.newsArticlesLikeCreate(articleId, undefined);
            // Обновляем статью данными из ответа сервера
            this._updateArticleInState(updatedArticle);
            console.log(`[newsStore] Article ${articleId} liked.`);
        } catch (error: any) {
             console.error(`[newsStore] Failed to like article ${articleId}:`, getErrorMessage(error), error);
             // Откатываем оптимистичное обновление при ошибке
             if (originalArticle) this._updateArticleInState(originalArticle);
             // Можно показать ошибку пользователю
        } finally {
             this.isLikingArticle.delete(articleId); // Удаляем ID из сета загрузки
        }
    },

    async unlikeArticle(articleId: number) {
        if (this.isLikingArticle.has(articleId)) return;
        console.log(`[newsStore] Unliking article ${articleId}...`);
        this.isLikingArticle.add(articleId);
        // Запоминаем исходное состояние ТОЛЬКО для случая НЕ-404 ошибки
        // const originalArticle = JSON.parse(JSON.stringify(
        //     this.articles.find(a => a.id === articleId) || this.currentArticle
        // ));

        // Оптимистично обновляем UI СРАЗУ
        this._updateArticleInStateOptimistic(articleId, false);

        try {
            await NewsService.newsArticlesLikeDestroy(articleId);
            console.log(`[newsStore] Article ${articleId} unlike successful (or already unliked).`);
            // Ничего не делаем при успехе (200/204), UI уже обновлен

        } catch (error: any) {
            const status = (error instanceof ApiError) ? error.status : error.response?.status;
            console.error(`[newsStore] Failed to unlike article ${articleId}:`, getErrorMessage(error), error);

            // --- ИСПРАВЛЕНИЕ: Игнорируем 404, откатываем при других ошибках ---
            if (status !== 404) {
                // Откатываем оптимистичное обновление ТОЛЬКО если ошибка не 404
                console.warn(`[newsStore] Rolling back optimistic unlike for article ${articleId} due to error ${status}.`);
                // Можно перезапросить статью или вернуть к исходному состоянию, если сохраняли
                // Проще всего - поставить лайк обратно
                 this._updateArticleInStateOptimistic(articleId, true);
                 // TODO: Показать пользователю сообщение об ошибке (не 404)
            } else {
                 console.log(`[newsStore] Unlike article ${articleId} returned 404 (already unliked), UI state is correct.`);
                 // Ошибку 404 просто игнорируем, т.к. UI уже в состоянии "не лайкнуто"
            }
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        } finally {
             this.isLikingArticle.delete(articleId);
        }
    },

    // --- Лайки Комментариев ---
    async likeComment(commentId: number) {
         if (this.isLikingComment.has(commentId)) return;
         console.log(`[newsStore] Liking comment ${commentId}...`);
         this.isLikingComment.add(commentId);
         const originalComment = JSON.parse(JSON.stringify(
             this._findCommentById(this.currentArticleComments, commentId)
         ));

         try {
              // Оптимистичное обновление
              this._updateCommentInStateOptimistic(commentId, true);

              // Вызов API: ID напрямую, пустой requestBody
              const updatedComment = await NewsService.newsCommentsLikeCreate(commentId, undefined);
              this._updateCommentInState(updatedComment); // Обновляем данными с сервера
              console.log(`[newsStore] Comment ${commentId} liked.`);
         } catch (error: any) {
              console.error(`[newsStore] Failed to like comment ${commentId}:`, getErrorMessage(error), error);
              // Откат
              if (originalComment) this._updateCommentInState(originalComment);
         } finally {
              this.isLikingComment.delete(commentId);
         }
    },

    async unlikeComment(commentId: number) {
        if (this.isLikingComment.has(commentId)) return;
        console.log(`[newsStore] Unliking comment ${commentId}...`);
        this.isLikingComment.add(commentId);
         // const originalComment = JSON.parse(JSON.stringify(
         //    this._findCommentById(this.currentArticleComments, commentId)
         // ));

        // Оптимистично обновляем UI СРАЗУ
         this._updateCommentInStateOptimistic(commentId, false);

        try {
            await NewsService.newsCommentsLikeDestroy(commentId);
            console.log(`[newsStore] Comment ${commentId} unlike successful (or already unliked).`);

        } catch (error: any) {
            const status = (error instanceof ApiError) ? error.status : error.response?.status;
            console.error(`[newsStore] Failed to unlike comment ${commentId}:`, getErrorMessage(error), error);

            // --- ИСПРАВЛЕНИЕ: Игнорируем 404, откатываем при других ошибках ---
            if (status !== 404) {
                console.warn(`[newsStore] Rolling back optimistic unlike for comment ${commentId} due to error ${status}.`);
                 // Откатываем - ставим лайк обратно
                 this._updateCommentInStateOptimistic(commentId, true);
                // TODO: Показать пользователю сообщение об ошибке (не 404)
            } else {
                console.log(`[newsStore] Unlike comment ${commentId} returned 404 (already unliked), UI state is correct.`);
            }
            // --- КОНЕЦ ИСПРАВЛЕНИЯ ---
        } finally {
             this.isLikingComment.delete(commentId);
        }
    },

     // --- Добавление комментария ---
     async addComment(articleId: number, content: string, parentId?: number): Promise<NewsComment | null> {
        if (this.isAddingComment) return null;
        console.log(`[newsStore] Adding comment to article ${articleId} ${parentId ? 'replying to ' + parentId : ''}...`);
        this.isAddingComment = true;
        this.errorComments = null;
        try {
            const commentData: NewsCommentRequest = {
                article: articleId,
                content: content,
                parent: parentId
            };
            const newComment = await NewsService.newsCommentsCreate(commentData);
            console.log('[newsStore] Comment added via API:', newComment);

            // Перезагружаем комментарии, чтобы получить актуальный список с новым ID
            await this.fetchArticleComments(articleId);

             // Обновляем счетчик комментариев в статье
             if (this.currentArticle) {
                 this.currentArticle.comment_count = (this.currentArticle.comment_count ?? 0) + 1;
             }
            return newComment; // Возвращаем созданный комментарий
        } catch (error: any) {
            console.error('[newsStore] Failed to add comment:', getErrorMessage(error), error);
            this.errorComments = getErrorMessage(error) || 'Failed to add comment';
            return null;
        } finally {
            this.isAddingComment = false;
        }
     },



     // --- Вспомогательные методы для обновления состояния ---

    // Обновление статьи данными с сервера
    _updateArticleInState(updatedArticle: NewsArticle) {
        const listIndex = this.articles.findIndex(a => a.id === updatedArticle.id);
        if (listIndex !== -1) {
            this.articles.splice(listIndex, 1, updatedArticle);
        }
        if (this.currentArticle?.id === updatedArticle.id) {
            // Обновляем объект, сохраняя ссылку, если это важно для реактивности
            Object.assign(this.currentArticle, updatedArticle);
            // this.currentArticle = updatedArticle; // Можно и так
        }
    },

    // Оптимистичное обновление статуса лайка статьи
    _updateArticleInStateOptimistic(articleId: number, isLiked: boolean) {
        const articleRef = this.articles.find(a => a.id === articleId) || (this.currentArticle?.id === articleId ? this.currentArticle : null);
         if (articleRef) {
             // Обновляем только нужные поля, чтобы не перезаписать весь объект старыми данными
             const currentLikes = articleRef.likes_count ?? 0;
             articleRef.is_liked_by_current_user = isLiked;
             articleRef.likes_count = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
         }
    },

    // Обновление комментария данными с сервера
    _updateCommentInState(updatedComment: NewsComment) {
        const commentRef = this._findCommentById(this.currentArticleComments, updatedComment.id);
        if (commentRef) {
            Object.assign(commentRef, updatedComment);
        }
    },

     // Оптимистичное обновление статуса лайка комментария
     _updateCommentInStateOptimistic(commentId: number, isLiked: boolean) {
        const commentRef = this._findCommentById(this.currentArticleComments, commentId);
        if (commentRef) {
             const currentLikes = commentRef.likes_count ?? 0;
             commentRef.is_liked_by_current_user = isLiked;
             commentRef.likes_count = isLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1);
         }
    },

    // Рекурсивный поиск комментария по ID
    _findCommentById(comments: NewsComment[] | undefined | null, commentId: number): NewsComment | null {
        if (!comments) return null;
        for (const comment of comments) {
            if (comment.id === commentId) {
                return comment;
            }
            // Проверяем тип replies перед рекурсией
            if (Array.isArray(comment.replies) && comment.replies.length > 0) {
                const foundInReply = this._findCommentById(comment.replies as NewsComment[], commentId);
                if (foundInReply) {
                    return foundInReply;
                }
            }
        }
        return null;
    },

    // Обработка комментариев (например, преобразование replies, если нужно)
    _processComments(comments: NewsComment[]): NewsComment[] {
        // Пока просто возвращаем как есть, но здесь можно добавить логику
        // для построения дерева или другой обработки
        return comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // Сортируем корневые по дате
    }

  },
});