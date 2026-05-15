from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    STAFF = "staff"
    ADMIN = "admin"

class AnnouncementCategory(str, Enum):
    ACADEMIC = "academic"
    EVENT = "event"
    ADMINISTRATIVE = "administrative"
    URGENT = "urgent"
    GENERAL = "general"

class AnnouncementPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class AnnouncementAudience(str, Enum):
    ALL = "all"
    STUDENTS = "students"
    TEACHERS = "teachers"
    STAFF = "staff"
    ADMIN = "admin"

CREATE_ANNOUNCEMENTS_TABLE = """
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    audience VARCHAR(20) DEFAULT 'all',
    author_id INTEGER NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(50) NOT NULL,
    attachments JSON DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    views INTEGER DEFAULT 0,
    INDEX idx_author_id (author_id),
    INDEX idx_audience (audience),
    INDEX idx_is_active (is_active),
    INDEX idx_published_at (published_at),
    INDEX idx_priority (priority)
)
"""

CREATE_READ_RECEIPTS_TABLE = """
CREATE TABLE IF NOT EXISTS announcement_read_receipts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    announcement_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_announcement_id (announcement_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_read (announcement_id, user_id)
)
"""
