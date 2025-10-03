# PlayerJS IMDb Video Player

A modern, responsive video player that integrates PlayerJS with IMDb to stream movies and TV series. This application allows users to search for content using IMDb IDs and play videos directly in the browser with support for season/episode selection for TV series.

## Features

- 🎬 **IMDb Integration**: Search and play content using IMDb IDs
- 📺 **TV Series Support**: Full support for TV series with season and episode selection
- 🎥 **Movie Playback**: Direct movie playback with poster and metadata
- ⚡ **PlayerJS**: Modern video player with adaptive streaming
- 💾 **Database Storage**: Store and manage video links with IMDb IDs
- 🎨 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚠️ **Error Handling**: Comprehensive error handling and loading states
- 🔍 **Smart Search**: Automatically detects whether content is a movie or TV series

## Project Structure

```
stunning-spork/
├── player.html      # Video player interface
├── player.js        # Player controller and IMDb integration logic
├── api.php          # Backend API for data retrieval
├── config.php       # Database configuration
├── database.sql     # Database schema and sample data
├── README.md        # This file
├── index.html       # Original TeraBox downloader (existing)
└── app.js           # TeraBox backend API (existing)
```

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher (or MariaDB 10.2+)
- Web server (Apache, Nginx, or PHP built-in server)
- Modern web browser with JavaScript enabled

## Installation

### 1. Database Setup

First, create the database and import the schema:

```bash
# Log into MySQL
mysql -u root -p

# Create database and import schema
mysql -u root -p < database.sql
```

Or manually:

```sql
-- In MySQL console
CREATE DATABASE player_db;
USE player_db;
SOURCE database.sql;
```

### 2. Configure Database Connection

Edit `config.php` and update the database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'player_db');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. Web Server Setup

#### Option A: PHP Built-in Server (Development)

```bash
# Navigate to project directory
cd /path/to/stunning-spork

# Start PHP server
php -S localhost:8000
```

Then open your browser and navigate to:
- Player: `http://localhost:8000/player.html`
- Original TeraBox Downloader: `http://localhost:8000/index.html`

#### Option B: Apache/Nginx (Production)

1. Copy the project files to your web server document root (e.g., `/var/www/html/`)
2. Ensure PHP is properly configured with PDO MySQL extension enabled
3. Set appropriate file permissions:

```bash
chmod 644 *.php *.html *.js
chmod 600 config.php  # Protect database credentials
```

4. Access the application:
   - Player: `http://your-domain.com/player.html`
   - API: `http://your-domain.com/api.php`

## Usage

### For End Users

1. **Open the Player**: Navigate to `player.html` in your browser

2. **Search for Content**:
   - Enter an IMDb ID in the search box (e.g., `tt0111161` for "The Shawshank Redemption")
   - Click "Search" or press Enter

3. **Watch Movies**:
   - Movies will start playing automatically once loaded

4. **Watch TV Series**:
   - For TV series, select the season from the first dropdown
   - Select the episode from the second dropdown
   - The episode will load and play automatically

### Finding IMDb IDs

IMDb IDs can be found in the URL of any IMDb page:
- Example: `https://www.imdb.com/title/tt0111161/` → ID is `tt0111161`
- Movies and TV series both use the format: `tt` followed by numbers

### Sample IMDb IDs (included in database)

**Movies:**
- `tt0111161` - The Shawshank Redemption
- `tt0068646` - The Godfather

**TV Series:**
- `tt0903747` - Breaking Bad
- `tt0944947` - Game of Thrones

## API Documentation

The API provides several endpoints for retrieving content:

### Get Movie

```
GET api.php?action=getMovie&imdb_id=tt0111161
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "movie",
    "data": {
      "id": 1,
      "imdb_id": "tt0111161",
      "title": "The Shawshank Redemption",
      "video_url": "https://example.com/video.mp4",
      "poster_url": "https://example.com/poster.jpg",
      "description": "Two imprisoned men bond...",
      "year": 1994,
      "duration": 142
    }
  }
}
```

### Get Series

```
GET api.php?action=getSeries&imdb_id=tt0903747
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "series",
    "data": {
      "id": 1,
      "imdb_id": "tt0903747",
      "title": "Breaking Bad",
      "poster_url": "https://example.com/poster.jpg",
      "description": "A high school chemistry teacher...",
      "year": 2008
    }
  }
}
```

### Get Episode

```
GET api.php?action=getEpisode&imdb_id=tt0903747&season=1&episode=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "episode",
    "data": {
      "id": 1,
      "season_number": 1,
      "episode_number": 1,
      "title": "Pilot",
      "video_url": "https://example.com/episode.mp4",
      "description": "Walter White starts his journey...",
      "duration": 58,
      "series_title": "Breaking Bad",
      "series_poster": "https://example.com/poster.jpg"
    }
  }
}
```

### Get Seasons

```
GET api.php?action=getSeasons&imdb_id=tt0903747
```

**Response:**
```json
{
  "success": true,
  "data": {
    "series_title": "Breaking Bad",
    "seasons": [
      {
        "season_number": 1,
        "episodes": [
          {
            "episode_number": 1,
            "title": "Pilot",
            "duration": 58
          }
        ]
      }
    ]
  }
}
```

## Adding New Content

To add new movies or TV series to the database:

### Add a Movie

```sql
INSERT INTO movies (imdb_id, title, video_url, poster_url, description, year, duration)
VALUES ('tt1234567', 'Movie Title', 'https://video-url.mp4', 'https://poster-url.jpg', 'Description', 2023, 120);
```

### Add a TV Series

```sql
-- First, add the series
INSERT INTO series (imdb_id, title, poster_url, description, year)
VALUES ('tt1234567', 'Series Title', 'https://poster-url.jpg', 'Description', 2023);

-- Then, add episodes
INSERT INTO episodes (series_id, season_number, episode_number, title, video_url, description, duration)
VALUES (1, 1, 1, 'Episode Title', 'https://video-url.mp4', 'Episode description', 45);
```

## Security Considerations

1. **Database Credentials**: Keep `config.php` secure and never commit it to version control with real credentials
2. **Input Validation**: The API validates all IMDb IDs to prevent SQL injection
3. **CORS**: The API has CORS enabled for cross-origin requests. Adjust in `config.php` if needed
4. **File Permissions**: Ensure proper file permissions (644 for most files, 600 for config.php)

## Troubleshooting

### Player Not Loading

- Check browser console for JavaScript errors
- Verify PlayerJS CDN is accessible
- Ensure `player.js` is loaded correctly

### API Errors

- Verify database connection in `config.php`
- Check PHP error logs: `tail -f /var/log/php/error.log`
- Ensure PDO MySQL extension is enabled: `php -m | grep pdo_mysql`

### Content Not Found

- Verify the IMDb ID exists in the database
- Check database connection and table structure
- Review API response in browser developer tools

### Video Not Playing

- Ensure video URLs are accessible and valid
- Check that video format is supported by the browser
- Verify PlayerJS is properly initialized

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This project addresses Issue #1. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is part of the stunning-spork repository. Please refer to the repository license.

## Support

For issues, questions, or suggestions, please open an issue in the GitHub repository.

---

**Note**: This player is designed to work with legally obtained video content. Ensure you have the proper rights to stream any content through this application.
