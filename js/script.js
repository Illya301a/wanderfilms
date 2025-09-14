class MovieSearchApp {
    constructor() {
        this.apiKey = '3a8d3d6a';
        this.baseUrl = 'https://www.omdbapi.com/';
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

        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        prevBtn.addEventListener('click', () => {
            this.goToPage(this.currentPage - 1);
        });

        nextBtn.addEventListener('click', () => {
            this.goToPage(this.currentPage + 1);
        });
    }

    handleSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.hideError();

        if (!query.trim()) {
            this.showWelcomeMessage();
            return;
        }

        this.showLoading();

        this.searchTimeout = setTimeout(() => {
            this.searchMovies(query.trim());
        }, 500);
    }

    async searchMovies(query, page = 1) {
        try {
            this.currentQuery = query;
            this.currentPage = page;

            const response = await fetch(
                `${this.baseUrl}?apikey=${this.apiKey}&s=${encodeURIComponent(query)}&page=${page}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.Response === 'False') {
                throw new Error(data.Error || 'Error searching for movies');
            }

            this.totalResults = parseInt(data.totalResults);
            this.displayResults(data.Search || []);
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
        
        if (movies.length === 0) {
            resultsSection.innerHTML = `
                <div class="no-results">
                    <h3>No movies found</h3>
                    <p>Try changing your search query</p>
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
        const poster = movie.Poster !== 'N/A' ? movie.Poster : '';
        const year = movie.Year || 'Unknown';
        const type = movie.Type || 'Unknown';
        const title = movie.Title || 'No title';

        return `
            <div class="movie-card" onclick="app.searchMovieDetails('${movie.imdbID}')">
                <div class="movie-poster">
                    ${poster ? 
                        `<img src="${poster}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        'Poster not available'
                    }
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${title}</h3>
                    <div class="movie-year">${year}</div>
                    <div class="movie-type">${type}</div>
                </div>
            </div>
        `;
    }

    async searchMovieDetails(imdbID) {
        try {
            this.showLoading();
            const response = await fetch(
                `${this.baseUrl}?apikey=${this.apiKey}&i=${imdbID}&plot=full`
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const movie = await response.json();
            
            if (movie.Response === 'False') {
                console.error('API Error:', movie.Error);
                this.backToSearch();
                return;
            }

            this.showMovieDetails(movie);
        } catch (error) {
            console.error('Movie details error:', error);
            this.backToSearch();
        } finally {
            this.hideLoading();
        }
    }

    showMovieDetails(movie) {
        const resultsSection = document.getElementById('resultsSection');
        
        resultsSection.innerHTML = `
            <div class="movie-details">
                <button onclick="app.backToSearch()" class="back-btn">← Back to search</button>
                <div class="movie-detail-card">
                    <div class="movie-detail-poster">
                        ${movie.Poster !== 'N/A' ? 
                            `<img src="${movie.Poster}" alt="${movie.Title}">` : 
                            '<div class="no-poster">Poster not available</div>'
                        }
                    </div>
                    <div class="movie-detail-info">
                        <h1>${movie.Title}</h1>
                        <div class="movie-meta">
                            <span class="year">${movie.Year}</span>
                            <span class="rated">${movie.Rated}</span>
                            <span class="runtime">${movie.Runtime}</span>
                        </div>
                        <div class="movie-genre">${movie.Genre}</div>
                        <div class="movie-plot">${movie.Plot}</div>
                        <div class="movie-details-grid">
                            <div class="detail-item">
                                <strong>Director:</strong> ${movie.Director}
                            </div>
                            <div class="detail-item">
                                <strong>Actors:</strong> ${movie.Actors}
                            </div>
                            <div class="detail-item">
                                <strong>IMDB Rating:</strong> ${movie.imdbRating}
                            </div>
                            <div class="detail-item">
                                <strong>Country:</strong> ${movie.Country}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addMovieDetailsStyles();
    }

    backToSearch() {
        this.searchMovies(this.currentQuery, this.currentPage);
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');

        if (this.totalResults <= 10) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        
        const totalPages = Math.ceil(this.totalResults / 10);
        const startResult = (this.currentPage - 1) * 10 + 1;
        const endResult = Math.min(this.currentPage * 10, this.totalResults);

        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${startResult}-${endResult} of ${this.totalResults})`;
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
    }

    goToPage(page) {
        if (page < 1) return;
        
        const totalPages = Math.ceil(this.totalResults / 10);
        if (page > totalPages) return;

        this.searchMovies(this.currentQuery, page);
    }

    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'block';
        document.querySelector('.search-icon').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.querySelector('.search-icon').style.display = 'block';
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.querySelector('.error-text');
        
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showWelcomeMessage() {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.innerHTML = `
            <div class="welcome-message" id="welcomeMessage">
                <h2>Welcome!</h2>
                <p>Start typing a movie title to see search results</p>
                <div class="features">
                    <div class="feature">
                        <span class="feature-icon">⚡</span>
                        <span>Real-time search</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">📱</span>
                        <span>Responsive design</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">🎯</span>
                        <span>Accurate results</span>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
    }

    getErrorMessage(error) {
        if (error.message.includes('API key')) {
            return 'Please configure API key for OMDb API';
        }
        if (error.message.includes('Too many results')) {
            return 'Too many results. Please refine your search query';
        }
        if (error.message.includes('Movie not found')) {
            return 'Movie not found. Try a different search query';
        }
        if (error.message.includes('Network')) {
            return 'Network error. Check your internet connection';
        }
        return 'An error occurred. Please try again';
    }
}

const app = new MovieSearchApp();

window.searchMovieDetails = function(imdbID) {
    app.searchMovieDetails(imdbID);
};

window.app = app;
