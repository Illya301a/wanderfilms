class MovieSearchApp {
    constructor() {
        this.omdbApiKey = '3a8d3d6a';
        this.kinopoiskApiKey = 'VAFW9F1-DGR450B-GXTBC8X-S0E12ZS';
        this.omdbBaseUrl = 'https://www.omdbapi.com/';
        this.kinopoiskBaseUrl = 'https://api.kinopoisk.dev/v1.4/';
        this.currentApi = 'omdb'; // 'omdb' or 'kinopoisk'
        this.searchTimeout = null;
        this.currentPage = 1;
        this.totalResults = 0;
        this.currentQuery = '';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.showWelcomeMessage();
    }

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const omdbBtn = document.getElementById('omdbBtn');
        const kinopoiskBtn = document.getElementById('kinopoiskBtn');

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value);
            }
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.searchMovies(this.currentQuery, this.currentPage - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalResults / 10);
                if (this.currentPage < totalPages) {
                    this.searchMovies(this.currentQuery, this.currentPage + 1);
                }
            });
        }

        omdbBtn.addEventListener('click', () => {
            this.switchApi('omdb');
        });

        kinopoiskBtn.addEventListener('click', () => {
            this.switchApi('kinopoisk');
        });
    }

    switchApi(api) {
        console.log('Switching to API:', api);
        this.currentApi = api;
        this.currentPage = 1;
        this.totalResults = 0;
        
        // Update button states
        const omdbBtn = document.getElementById('omdbBtn');
        const kinopoiskBtn = document.getElementById('kinopoiskBtn');
        
        if (omdbBtn) omdbBtn.classList.toggle('active', api === 'omdb');
        if (kinopoiskBtn) kinopoiskBtn.classList.toggle('active', api === 'kinopoisk');
        
        // Update placeholder text and subtitle
        const searchInput = document.getElementById('searchInput');
        const subtitle = document.getElementById('subtitle');
        
        if (api === 'kinopoisk') {
            searchInput.placeholder = 'Введите название фильма...';
            subtitle.textContent = 'Найдите свои любимые фильмы в реальном времени';
        } else {
            searchInput.placeholder = 'Enter movie title...';
            subtitle.textContent = 'Find your favorite movies in real-time';
        }
        
        // Clear current search
        searchInput.value = '';
        this.showWelcomeMessage();
    }

    handleSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        if (query.length < 2) {
            this.showWelcomeMessage();
            return;
        }

        this.searchTimeout = setTimeout(() => {
            this.searchMovies(query);
        }, 500);
    }

    async searchMovies(query, page = 1) {
        try {
            console.log('Searching with API:', this.currentApi, 'Query:', query);
            this.showLoading();
            this.currentQuery = query;
            this.currentPage = page;
            
            let response, data;

            if (this.currentApi === 'omdb') {
                response = await fetch(
                    `${this.omdbBaseUrl}?apikey=${this.omdbApiKey}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                data = await response.json();

                if (data.Response === 'False') {
                    throw new Error(data.Error || 'Movie not found');
                }

                this.totalResults = parseInt(data.totalResults) || 0;
                this.displayResults(data.Search || []);
            } else {
                // Kinopoisk API
                response = await fetch(
                    `${this.kinopoiskBaseUrl}movie/search?page=${page}&limit=10&query=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            'X-API-KEY': this.kinopoiskApiKey
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                data = await response.json();
                this.totalResults = data.total || 0;
                this.displayResults(data.docs || []);
            }

            this.updatePagination();

        } catch (error) {
            console.error('Search error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.hideLoading();
        }
    }

    displayResults(movies) {
        const resultsSection = document.getElementById('resultsSection');
        const isRussian = this.currentApi === 'kinopoisk';
        
        if (movies.length === 0) {
            let noResultsText, tryAgainText;
            if (isRussian) {
                noResultsText = 'Фильмы не найдены';
                tryAgainText = 'Попробуйте изменить поисковый запрос';
            } else {
                noResultsText = 'No movies found';
                tryAgainText = 'Try changing your search query';
            }
            
            resultsSection.innerHTML = `
                <div class="no-results">
                    <h3>${noResultsText}</h3>
                    <p>${tryAgainText}</p>
                </div>
            `;
            return;
        }

        const moviesHTML = movies.map(movie => this.createMovieCard(movie)).join('');
        resultsSection.innerHTML = `
            <div class="movies-grid">
                ${moviesHTML}
            </div>
        `;
    }

    createMovieCard(movie) {
        let poster, year, type, title, id;

        if (this.currentApi === 'omdb') {
            poster = movie.Poster !== 'N/A' ? movie.Poster : '';
            year = movie.Year || 'Unknown';
            type = movie.Type || 'Unknown';
            title = movie.Title || 'No title';
            id = movie.imdbID;
        } else {
            // Kinopoisk API format
            poster = movie.poster?.url || '';
            year = movie.year || 'Unknown';
            type = movie.type || 'Unknown';
            title = movie.name || movie.alternativeName || 'No title';
            id = movie.id;
        }

        return `
            <div class="movie-card" onclick="app.searchMovieDetails('${id}')">
                <div class="movie-poster">
                    ${poster ? 
                        `<img src="${poster}" alt="${title}" loading="lazy">` : 
                        `<div class="no-poster">Poster not available</div>`
                    }
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${title}</h3>
                    <p class="movie-year">${year}</p>
                    <p class="movie-type">${type}</p>
                </div>
            </div>
        `;
    }

    async searchMovieDetails(movieId) {
        try {
            this.showLoading();
            let response, movie;

            if (this.currentApi === 'omdb') {
                response = await fetch(
                    `${this.omdbBaseUrl}?apikey=${this.omdbApiKey}&i=${movieId}&plot=full`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                movie = await response.json();

                if (movie.Response === 'False') {
                    throw new Error(movie.Error || 'Movie not found');
                }
            } else {
                // Kinopoisk API
                response = await fetch(
                    `${this.kinopoiskBaseUrl}movie/${movieId}`,
                    {
                        headers: {
                            'X-API-KEY': this.kinopoiskApiKey
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                movie = await response.json();
            }

            console.log('Movie data received:', movie);
            if (movie && (movie.Title || movie.name || movie.id)) {
                this.showMovieDetails(movie);
            } else {
                console.error('Invalid movie data structure:', movie);
                throw new Error('Invalid movie data received');
            }

        } catch (error) {
            console.error('Movie details error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                movieId: movieId,
                currentApi: this.currentApi
            });
            const isRussian = this.currentApi === 'kinopoisk';
            let errorMessage;
            if (isRussian) {
                errorMessage = 'Ошибка загрузки деталей фильма';
            } else {
                errorMessage = 'Error loading movie details';
            }
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
        }
    }

    showMovieDetails(movie) {
        const resultsSection = document.getElementById('resultsSection');
        const isRussian = this.currentApi === 'kinopoisk';
        
        try {
            let poster, title, year, rated, runtime, genre, plot, director, actors, rating, country;

            if (this.currentApi === 'omdb') {
                poster = movie.Poster !== 'N/A' ? movie.Poster : '';
                title = movie.Title || 'No title';
                year = movie.Year || 'N/A';
                rated = movie.Rated || 'N/A';
                runtime = movie.Runtime || 'N/A';
                genre = movie.Genre || 'N/A';
                plot = movie.Plot || 'No description available';
                director = movie.Director || 'N/A';
                actors = movie.Actors || 'N/A';
                rating = movie.imdbRating !== 'N/A' ? `IMDB: ${movie.imdbRating}/10` : 'N/A';
                country = movie.Country || 'N/A';
            } else {
                // Kinopoisk API format
                poster = movie.poster?.url || '';
                title = movie.name || movie.alternativeName || movie.enName || 'No title';
                
                let yearText = movie.year || 'N/A';
                try {
                    if (movie.premiere && movie.premiere.world) {
                        const premiereDate = new Date(movie.premiere.world);
                        yearText = `${movie.year} (${premiereDate.toLocaleDateString('ru-RU')})`;
                    }
                } catch (e) {
                    console.warn('Error formatting premiere date:', e);
                }
                year = yearText;
                
                rated = movie.ageRating ? `${movie.ageRating}+` : 'N/A';
                runtime = movie.movieLength ? `${movie.movieLength} мин` : 'N/A';
                
                let genreText = 'N/A';
                if (movie.genres && movie.genres.length > 0) {
                    genreText = movie.genres.map(g => g.name).join(', ');
                }
                if (movie.type && movie.type !== 'movie') {
                    const typeText = movie.type === 'tv-series' ? 'Сериал' : 
                                    movie.type === 'cartoon' ? 'Мультфильм' : 
                                    movie.type;
                    genreText += ` (${typeText})`;
                }
                genre = genreText;
                
                plot = movie.description || movie.shortDescription || 'Описание недоступно';
                director = 'N/A';
                actors = 'N/A';
                
                try {
                    if (movie.persons && Array.isArray(movie.persons)) {
                        const directors = movie.persons.filter(p => p.profession === 'режиссеры');
                        if (directors.length > 0) {
                            director = directors.map(p => p.name).join(', ');
                        }
                        const actorsList = movie.persons.filter(p => p.profession === 'актеры');
                        if (actorsList.length > 0) {
                            actors = actorsList.slice(0, 5).map(p => p.name).join(', ');
                        }
                    }
                } catch (e) {
                    console.warn('Error processing persons data:', e);
                }
                
                let ratingText = 'N/A';
                if (movie.rating?.kp) {
                    ratingText = `Кинопоиск: ${movie.rating.kp}/10`;
                    if (movie.rating.imdb) {
                        ratingText += ` | IMDB: ${movie.rating.imdb}/10`;
                    }
                } else if (movie.rating?.imdb) {
                    ratingText = `IMDB: ${movie.rating.imdb}/10`;
                }
                rating = ratingText;
                country = movie.countries?.map(c => c.name).join(', ') || 'N/A';
                
                // Дополнительная информация для Kinopoisk API
                try {
                    if (movie.budget && movie.budget.value) {
                        const budget = movie.budget.value.toLocaleString('ru-RU');
                        const currency = movie.budget.currency === 'USD' ? '$' : movie.budget.currency;
                        plot += `<br><br><strong>Бюджет:</strong> ${budget} ${currency}`;
                    }
                    
                    if (movie.fees && movie.fees.world && movie.fees.world.value) {
                        const fees = movie.fees.world.value.toLocaleString('ru-RU');
                        const currency = movie.fees.world.currency === 'USD' ? '$' : movie.fees.world.currency;
                        plot += `<br><strong>Сборы в мире:</strong> ${fees} ${currency}`;
                    }
                    
                    // Добавляем информацию о трейлере, если доступен
                    if (movie.videos && movie.videos.trailers && movie.videos.trailers.length > 0) {
                        const trailer = movie.videos.trailers[0];
                        if (trailer.url) {
                            plot += `<br><br><strong>Трейлер:</strong> <a href="${trailer.url}" target="_blank" style="color: #87CEEB;">Смотреть трейлер</a>`;
                        }
                    }
                } catch (e) {
                    console.warn('Error processing additional movie info:', e);
                }
            }
            
            resultsSection.innerHTML = `
                <div class="movie-details">
                    <button onclick="app.backToSearch()" class="back-btn">← ${isRussian ? 'Назад к поиску' : 'Back to search'}</button>
                    <div class="movie-detail-card">
                        <div class="movie-detail-poster">
                            ${poster ? 
                                `<img src="${poster}" alt="${title}">` : 
                                `<div class="no-poster">${isRussian ? 'Постер недоступен' : 'Poster not available'}</div>`
                            }
                        </div>
                        <div class="movie-detail-info">
                            <h1>${title}</h1>
                            <div class="movie-meta">
                                <span class="year">${year}</span>
                                <span class="rated">${rated}</span>
                                <span class="runtime">${runtime}</span>
                            </div>
                            <div class="movie-genre">${genre}</div>
                            <div class="movie-plot">${plot}</div>
                            <div class="movie-details-grid">
                                <div class="detail-item">
                                    <strong>${isRussian ? 'Режиссер:' : 'Director:'}</strong> ${director}
                                </div>
                                <div class="detail-item">
                                    <strong>${isRussian ? 'Актеры:' : 'Actors:'}</strong> ${actors}
                                </div>
                                <div class="detail-item">
                                    <strong>${isRussian ? 'Рейтинг:' : 'Rating:'}</strong> ${rating}
                                </div>
                                <div class="detail-item">
                                    <strong>${isRussian ? 'Страна:' : 'Country:'}</strong> ${country}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error in showMovieDetails:', error);
            const isRussian = this.currentApi === 'kinopoisk';
            this.showError(isRussian ? 'Ошибка отображения деталей фильма' : 'Error displaying movie details');
        }
    }

    backToSearch() {
        this.searchMovies(this.currentQuery, this.currentPage);
    }

    updatePagination() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            const totalPages = Math.ceil(this.totalResults / 10);
            nextBtn.disabled = this.currentPage >= totalPages;
        }

        if (pageInfo) {
            const totalPages = Math.ceil(this.totalResults / 10);
            pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'block';
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showWelcomeMessage() {
        const resultsSection = document.getElementById('resultsSection');
        const isRussian = this.currentApi === 'kinopoisk';
        
        let welcomeText, descriptionText, feature1Text, feature2Text, feature3Text;
        
        if (isRussian) {
            welcomeText = 'Добро пожаловать!';
            descriptionText = 'Начните вводить название фильма для поиска';
            feature1Text = 'Поиск в реальном времени';
            feature2Text = 'Адаптивный дизайн';
            feature3Text = 'Точные результаты';
        } else {
            welcomeText = 'Welcome!';
            descriptionText = 'Start typing a movie title to see search results';
            feature1Text = 'Real-time search';
            feature2Text = 'Responsive design';
            feature3Text = 'Accurate results';
        }
        
        resultsSection.innerHTML = `
            <div class="welcome-message" id="welcomeMessage">
                <h2>${welcomeText}</h2>
                <p>${descriptionText}</p>
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">⚡</div>
                        <h3>${feature1Text}</h3>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">📱</div>
                        <h3>${feature2Text}</h3>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">🎯</div>
                        <h3>${feature3Text}</h3>
                    </div>
                </div>
            </div>
        `;
    }

    getErrorMessage(error) {
        const isRussian = this.currentApi === 'kinopoisk';
        
        if (error.message.includes('API key')) {
            if (isRussian) return 'Пожалуйста, настройте API ключ';
            return 'Please configure API key';
        }
        if (error.message.includes('Too many results')) {
            if (isRussian) return 'Слишком много результатов. Уточните поисковый запрос';
            return 'Too many results. Please refine your search query';
        }
        if (error.message.includes('Movie not found')) {
            if (isRussian) return 'Фильм не найден. Попробуйте другой запрос';
            return 'Movie not found. Try a different search query';
        }
        if (error.message.includes('Network')) {
            if (isRussian) return 'Ошибка сети. Проверьте подключение к интернету';
            return 'Network error. Check your internet connection';
        }
        if (isRussian) return 'Произошла ошибка. Попробуйте еще раз';
        return 'An error occurred. Please try again';
    }
}

const app = new MovieSearchApp();

window.searchMovieDetails = function(imdbID) {
    app.searchMovieDetails(imdbID);
};