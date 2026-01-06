import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export class DatabaseManager {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // 获取应用数据目录
    const userDataPath = app.getPath('userData');
    const dbDir = path.join(userDataPath, 'data');
    
    // 确保目录存在
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.dbPath = path.join(dbDir, 'eventplayer.db');
    this.db = new Database(this.dbPath);
    this.initTables();
  }

  private initTables() {
    // 创建播放列表表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建视频表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        display_name TEXT,
        file_size INTEGER,
        duration REAL,
        label TEXT NOT NULL DEFAULT 'action',
        sort_order INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
      )
    `);
    
    // 如果表已存在但没有 display_name 字段，则添加该字段
    try {
      this.db.exec(`ALTER TABLE videos ADD COLUMN display_name TEXT`);
    } catch (e) {
      // 字段已存在，忽略错误
    }

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_videos_playlist_id ON videos(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_videos_sort_order ON videos(playlist_id, sort_order);
    `);
  }

  // 播放列表操作
  createPlaylist(name: string): number {
    const stmt = this.db.prepare('INSERT INTO playlists (name) VALUES (?)');
    const result = stmt.run(name);
    return result.lastInsertRowid as number;
  }

  getAllPlaylists() {
    return this.db.prepare('SELECT * FROM playlists ORDER BY created_at DESC').all();
  }

  getPlaylistById(id: number) {
    return this.db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
  }

  updatePlaylist(id: number, name: string) {
    const stmt = this.db.prepare('UPDATE playlists SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(name, id);
  }

  deletePlaylist(id: number) {
    // 先获取所有视频文件路径
    const videos = this.db.prepare('SELECT file_path FROM videos WHERE playlist_id = ?').all(id) as Array<{file_path: string}>;
    
    // 删除数据库记录（级联删除视频记录）
    const stmt = this.db.prepare('DELETE FROM playlists WHERE id = ?');
    const result = stmt.run(id);
    
    // 返回视频文件路径列表，供主进程删除文件
    return {
      success: result.changes > 0,
      videoPaths: videos.map(v => v.file_path)
    };
  }

  // 视频操作
  addVideo(playlistId: number, filePath: string, fileName: string, displayName: string, fileSize: number, label: string, duration?: number): number {
    // 获取当前最大sort_order
    const maxOrder = this.db.prepare('SELECT MAX(sort_order) as max_order FROM videos WHERE playlist_id = ?').get(playlistId) as {max_order: number | null};
    const nextOrder = (maxOrder?.max_order ?? -1) + 1;

    console.log('Adding video with displayName:', displayName);
    const stmt = this.db.prepare(`
      INSERT INTO videos (playlist_id, file_path, file_name, display_name, file_size, duration, label, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(playlistId, filePath, fileName, displayName, fileSize, duration || null, label, nextOrder);
    console.log('Video inserted with ID:', result.lastInsertRowid);
    return result.lastInsertRowid as number;
  }

  getVideosByPlaylistId(playlistId: number) {
    return this.db.prepare('SELECT * FROM videos WHERE playlist_id = ? ORDER BY sort_order ASC').all(playlistId);
  }

  updateVideo(id: number, updates: { label?: string; sort_order?: number; display_name?: string }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.label !== undefined) {
      fields.push('label = ?');
      values.push(updates.label);
    }
    if (updates.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(updates.sort_order);
    }
    if (updates.display_name !== undefined) {
      fields.push('display_name = ?');
      values.push(updates.display_name);
    }

    if (fields.length === 0) return { changes: 0 };

    values.push(id);
    const sql = `UPDATE videos SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    return stmt.run(...values);
  }

  deleteVideo(id: number) {
    const video = this.db.prepare('SELECT file_path FROM videos WHERE id = ?').get(id) as {file_path: string} | undefined;
    
    const stmt = this.db.prepare('DELETE FROM videos WHERE id = ?');
    const result = stmt.run(id);
    
    return {
      success: result.changes > 0,
      videoPath: video?.file_path
    };
  }

  updateVideoOrder(playlistId: number, videoOrders: Array<{ id: number; sort_order: number }>) {
    const stmt = this.db.prepare('UPDATE videos SET sort_order = ? WHERE id = ? AND playlist_id = ?');
    const updateMany = this.db.transaction((orders: Array<{ id: number; sort_order: number }>) => {
      for (const order of orders) {
        stmt.run(order.sort_order, order.id, playlistId);
      }
    });
    updateMany(videoOrders);
  }

  close() {
    this.db.close();
  }
}

