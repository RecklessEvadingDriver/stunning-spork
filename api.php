<?php
/**
 * API for PlayerJS Video Player with IMDb Integration
 * 
 * Endpoints:
 * - GET /api.php?action=getMovie&imdb_id=tt0111161
 * - GET /api.php?action=getSeries&imdb_id=tt0903747
 * - GET /api.php?action=getEpisode&imdb_id=tt0903747&season=1&episode=1
 * - GET /api.php?action=getSeasons&imdb_id=tt0903747
 */

require_once 'config.php';

setCORSHeaders();

// Get action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    $pdo = getDBConnection();
    
    switch ($action) {
        case 'getMovie':
            getMovie($pdo);
            break;
            
        case 'getSeries':
            getSeries($pdo);
            break;
            
        case 'getEpisode':
            getEpisode($pdo);
            break;
            
        case 'getSeasons':
            getSeasons($pdo);
            break;
            
        default:
            sendError('Invalid action', 400);
            break;
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Server error occurred', 500);
}

/**
 * Get movie by IMDb ID
 */
function getMovie($pdo) {
    $imdb_id = isset($_GET['imdb_id']) ? $_GET['imdb_id'] : '';
    
    if (empty($imdb_id)) {
        sendError('IMDb ID is required', 400);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM movies WHERE imdb_id = ?");
    $stmt->execute([$imdb_id]);
    $movie = $stmt->fetch();
    
    if (!$movie) {
        sendError('Movie not found', 404);
        return;
    }
    
    sendSuccess([
        'type' => 'movie',
        'data' => $movie
    ]);
}

/**
 * Get series information by IMDb ID
 */
function getSeries($pdo) {
    $imdb_id = isset($_GET['imdb_id']) ? $_GET['imdb_id'] : '';
    
    if (empty($imdb_id)) {
        sendError('IMDb ID is required', 400);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM series WHERE imdb_id = ?");
    $stmt->execute([$imdb_id]);
    $series = $stmt->fetch();
    
    if (!$series) {
        sendError('Series not found', 404);
        return;
    }
    
    sendSuccess([
        'type' => 'series',
        'data' => $series
    ]);
}

/**
 * Get specific episode
 */
function getEpisode($pdo) {
    $imdb_id = isset($_GET['imdb_id']) ? $_GET['imdb_id'] : '';
    $season = isset($_GET['season']) ? intval($_GET['season']) : 0;
    $episode = isset($_GET['episode']) ? intval($_GET['episode']) : 0;
    
    if (empty($imdb_id) || $season <= 0 || $episode <= 0) {
        sendError('IMDb ID, season, and episode are required', 400);
        return;
    }
    
    // First get series ID
    $stmt = $pdo->prepare("SELECT id FROM series WHERE imdb_id = ?");
    $stmt->execute([$imdb_id]);
    $series = $stmt->fetch();
    
    if (!$series) {
        sendError('Series not found', 404);
        return;
    }
    
    // Get episode
    $stmt = $pdo->prepare("
        SELECT e.*, s.title as series_title, s.poster_url as series_poster
        FROM episodes e
        JOIN series s ON e.series_id = s.id
        WHERE e.series_id = ? AND e.season_number = ? AND e.episode_number = ?
    ");
    $stmt->execute([$series['id'], $season, $episode]);
    $episodeData = $stmt->fetch();
    
    if (!$episodeData) {
        sendError('Episode not found', 404);
        return;
    }
    
    sendSuccess([
        'type' => 'episode',
        'data' => $episodeData
    ]);
}

/**
 * Get all seasons and episodes for a series
 */
function getSeasons($pdo) {
    $imdb_id = isset($_GET['imdb_id']) ? $_GET['imdb_id'] : '';
    
    if (empty($imdb_id)) {
        sendError('IMDb ID is required', 400);
        return;
    }
    
    // First get series ID
    $stmt = $pdo->prepare("SELECT id, title FROM series WHERE imdb_id = ?");
    $stmt->execute([$imdb_id]);
    $series = $stmt->fetch();
    
    if (!$series) {
        sendError('Series not found', 404);
        return;
    }
    
    // Get all episodes grouped by season
    $stmt = $pdo->prepare("
        SELECT season_number, episode_number, title, duration
        FROM episodes
        WHERE series_id = ?
        ORDER BY season_number, episode_number
    ");
    $stmt->execute([$series['id']]);
    $episodes = $stmt->fetchAll();
    
    // Group episodes by season
    $seasons = [];
    foreach ($episodes as $episode) {
        $season = $episode['season_number'];
        if (!isset($seasons[$season])) {
            $seasons[$season] = [
                'season_number' => $season,
                'episodes' => []
            ];
        }
        $seasons[$season]['episodes'][] = [
            'episode_number' => $episode['episode_number'],
            'title' => $episode['title'],
            'duration' => $episode['duration']
        ];
    }
    
    sendSuccess([
        'series_title' => $series['title'],
        'seasons' => array_values($seasons)
    ]);
}

/**
 * Send success response
 */
function sendSuccess($data) {
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit();
}

/**
 * Send error response
 */
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ]);
    exit();
}
?>
