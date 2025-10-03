-- Database schema for PlayerJS Video Player with IMDb Integration

CREATE DATABASE IF NOT EXISTS player_db;
USE player_db;

-- Table for storing movies
CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imdb_id VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    video_url TEXT NOT NULL,
    poster_url TEXT,
    description TEXT,
    year INT,
    duration INT COMMENT 'Duration in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_imdb_id (imdb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for storing TV series
CREATE TABLE IF NOT EXISTS series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imdb_id VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    poster_url TEXT,
    description TEXT,
    year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_imdb_id (imdb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table for storing series episodes
CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    series_id INT NOT NULL,
    imdb_id VARCHAR(20),
    season_number INT NOT NULL,
    episode_number INT NOT NULL,
    title VARCHAR(255),
    video_url TEXT NOT NULL,
    description TEXT,
    duration INT COMMENT 'Duration in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    INDEX idx_series_season (series_id, season_number),
    INDEX idx_imdb_id (imdb_id),
    UNIQUE KEY unique_episode (series_id, season_number, episode_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample data for testing
INSERT INTO movies (imdb_id, title, video_url, poster_url, description, year, duration) VALUES
('tt0111161', 'The Shawshank Redemption', 'https://example.com/video/shawshank.mp4', 'https://example.com/posters/shawshank.jpg', 'Two imprisoned men bond over a number of years.', 1994, 142),
('tt0068646', 'The Godfather', 'https://example.com/video/godfather.mp4', 'https://example.com/posters/godfather.jpg', 'The aging patriarch of an organized crime dynasty transfers control to his son.', 1972, 175);

INSERT INTO series (imdb_id, title, poster_url, description, year) VALUES
('tt0903747', 'Breaking Bad', 'https://example.com/posters/breaking-bad.jpg', 'A high school chemistry teacher turned methamphetamine producer.', 2008),
('tt0944947', 'Game of Thrones', 'https://example.com/posters/got.jpg', 'Nine noble families fight for control over the lands of Westeros.', 2011);

INSERT INTO episodes (series_id, season_number, episode_number, title, video_url, description, duration) VALUES
(1, 1, 1, 'Pilot', 'https://example.com/video/bb-s01e01.mp4', 'Walter White starts his journey.', 58),
(1, 1, 2, 'Cats in the Bag...', 'https://example.com/video/bb-s01e02.mp4', 'Walt and Jesse face their first challenge.', 48),
(2, 1, 1, 'Winter Is Coming', 'https://example.com/video/got-s01e01.mp4', 'The series premiere.', 62),
(2, 1, 2, 'The Kingsroad', 'https://example.com/video/got-s01e02.mp4', 'The journey begins.', 56);
