/**
 * PlayerJS Controller for IMDb Video Player
 * 
 * Handles video player initialization, IMDb content fetching,
 * and season/episode selection for TV series
 */

class IMDbPlayer {
    constructor() {
        this.player = null;
        this.currentType = null;
        this.currentImdbId = null;
        this.currentSeason = 1;
        this.currentEpisode = 1;
        this.apiUrl = 'api.php';
        
        this.initializeElements();
        this.attachEventListeners();
    }
    
    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.searchInput = document.getElementById('imdb-search');
        this.searchBtn = document.getElementById('search-btn');
        this.playerContainer = document.getElementById('player-container');
        this.loadingIndicator = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.contentInfo = document.getElementById('content-info');
        this.seasonSelector = document.getElementById('season-selector');
        this.episodeSelector = document.getElementById('episode-selector');
        this.videoTitle = document.getElementById('video-title');
        this.videoDescription = document.getElementById('video-description');
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchContent());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchContent();
            }
        });
        
        this.seasonSelector.addEventListener('change', (e) => {
            this.currentSeason = parseInt(e.target.value);
            this.loadEpisodes();
        });
        
        this.episodeSelector.addEventListener('change', (e) => {
            this.currentEpisode = parseInt(e.target.value);
            this.loadEpisode();
        });
    }
    
    /**
     * Search for content by IMDb ID
     */
    async searchContent() {
        const imdbId = this.searchInput.value.trim();
        
        if (!imdbId) {
            this.showError('Please enter an IMDb ID');
            return;
        }
        
        // Validate IMDb ID format (tt followed by numbers)
        if (!/^tt\d+$/.test(imdbId)) {
            this.showError('Invalid IMDb ID format. Should be like: tt0111161');
            return;
        }
        
        this.currentImdbId = imdbId;
        this.showLoading(true);
        this.hideError();
        
        // First try as a movie
        try {
            const movieData = await this.fetchMovie(imdbId);
            if (movieData) {
                this.loadMovie(movieData);
                return;
            }
        } catch (error) {
            // If movie fails, try as series
        }
        
        // Try as series
        try {
            const seriesData = await this.fetchSeries(imdbId);
            if (seriesData) {
                await this.loadSeries(seriesData);
                return;
            }
        } catch (error) {
            // Both failed
        }
        
        this.showLoading(false);
        this.showError('Content not found. Please check the IMDb ID.');
    }
    
    /**
     * Fetch movie data from API
     */
    async fetchMovie(imdbId) {
        try {
            const response = await fetch(`${this.apiUrl}?action=getMovie&imdb_id=${imdbId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching movie:', error);
            return null;
        }
    }
    
    /**
     * Fetch series data from API
     */
    async fetchSeries(imdbId) {
        try {
            const response = await fetch(`${this.apiUrl}?action=getSeries&imdb_id=${imdbId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching series:', error);
            return null;
        }
    }
    
    /**
     * Fetch episode data from API
     */
    async fetchEpisode(imdbId, season, episode) {
        try {
            const response = await fetch(
                `${this.apiUrl}?action=getEpisode&imdb_id=${imdbId}&season=${season}&episode=${episode}`
            );
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data.data;
            }
            throw new Error('Episode not found');
        } catch (error) {
            console.error('Error fetching episode:', error);
            throw error;
        }
    }
    
    /**
     * Fetch seasons data from API
     */
    async fetchSeasons(imdbId) {
        try {
            const response = await fetch(`${this.apiUrl}?action=getSeasons&imdb_id=${imdbId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                return result.data;
            }
            throw new Error('Seasons not found');
        } catch (error) {
            console.error('Error fetching seasons:', error);
            throw error;
        }
    }
    
    /**
     * Load and play movie
     */
    loadMovie(movieData) {
        this.currentType = 'movie';
        this.showLoading(false);
        
        // Hide season/episode selectors
        this.seasonSelector.style.display = 'none';
        this.episodeSelector.style.display = 'none';
        
        // Update info
        this.videoTitle.textContent = movieData.title + (movieData.year ? ` (${movieData.year})` : '');
        this.videoDescription.textContent = movieData.description || 'No description available';
        
        // Initialize player
        this.initializePlayer(movieData.video_url, movieData.poster_url);
        
        this.contentInfo.style.display = 'block';
    }
    
    /**
     * Load and prepare series
     */
    async loadSeries(seriesData) {
        this.currentType = 'series';
        
        // Update info
        this.videoTitle.textContent = seriesData.title + (seriesData.year ? ` (${seriesData.year})` : '');
        this.videoDescription.textContent = seriesData.description || 'No description available';
        
        // Fetch seasons
        const seasonsData = await this.fetchSeasons(this.currentImdbId);
        
        // Populate season selector
        this.populateSeasonSelector(seasonsData.seasons);
        
        // Show selectors
        this.seasonSelector.style.display = 'inline-block';
        this.episodeSelector.style.display = 'inline-block';
        
        // Load first episode
        this.currentSeason = 1;
        this.currentEpisode = 1;
        await this.loadEpisode();
        
        this.contentInfo.style.display = 'block';
        this.showLoading(false);
    }
    
    /**
     * Populate season selector
     */
    populateSeasonSelector(seasons) {
        this.seasonSelector.innerHTML = '';
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = `Season ${season.season_number}`;
            this.seasonSelector.appendChild(option);
        });
        
        // Store seasons data for later use
        this.seasonsData = seasons;
    }
    
    /**
     * Load episodes for current season
     */
    loadEpisodes() {
        const season = this.seasonsData.find(s => s.season_number === this.currentSeason);
        
        if (season) {
            this.episodeSelector.innerHTML = '';
            season.episodes.forEach(episode => {
                const option = document.createElement('option');
                option.value = episode.episode_number;
                option.textContent = `Episode ${episode.episode_number}${episode.title ? ': ' + episode.title : ''}`;
                this.episodeSelector.appendChild(option);
            });
            
            // Reset to first episode
            this.currentEpisode = 1;
            this.loadEpisode();
        }
    }
    
    /**
     * Load specific episode
     */
    async loadEpisode() {
        this.showLoading(true);
        this.hideError();
        
        try {
            const episodeData = await this.fetchEpisode(
                this.currentImdbId,
                this.currentSeason,
                this.currentEpisode
            );
            
            // Update title with episode info
            const episodeTitle = `${episodeData.series_title} - S${this.currentSeason}E${this.currentEpisode}`;
            this.videoTitle.textContent = episodeTitle + (episodeData.title ? `: ${episodeData.title}` : '');
            
            if (episodeData.description) {
                this.videoDescription.textContent = episodeData.description;
            }
            
            // Initialize or update player
            this.initializePlayer(episodeData.video_url, episodeData.series_poster);
            
            this.showLoading(false);
        } catch (error) {
            this.showLoading(false);
            this.showError('Failed to load episode. Please try again.');
        }
    }
    
    /**
     * Initialize PlayerJS player
     */
    initializePlayer(videoUrl, posterUrl) {
        // Clear existing player
        this.playerContainer.innerHTML = '<div id="player"></div>';
        
        // Initialize PlayerJS
        this.player = new Playerjs({
            id: "player",
            file: videoUrl,
            poster: posterUrl || '',
            default_quality: "720p"
        });
        
        this.playerContainer.style.display = 'block';
    }
    
    /**
     * Show loading indicator
     */
    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
    }
    
    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new IMDbPlayer();
});
