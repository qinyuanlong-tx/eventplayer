import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class FileManager {
  private videosDir: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.videosDir = path.join(userDataPath, 'videos');
    
    // 确保目录存在
    if (!fs.existsSync(this.videosDir)) {
      fs.mkdirSync(this.videosDir, { recursive: true });
    }
  }

  /**
   * 复制视频文件到应用目录
   */
  async copyVideoFile(sourcePath: string): Promise<{ filePath: string; fileName: string; displayName: string; fileSize: number }> {
    return new Promise((resolve, reject) => {
      try {
        const ext = path.extname(sourcePath);
        const fileName = `${uuidv4()}${ext}`;
        const destPath = path.join(this.videosDir, fileName);
        const displayName = path.basename(sourcePath);

        // 读取源文件信息
        const stats = fs.statSync(sourcePath);
        const fileSize = stats.size;

        // 复制文件
        fs.copyFile(sourcePath, destPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              filePath: destPath,
              fileName: fileName,
              displayName: displayName,
              fileSize: fileSize
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 删除视频文件
   */
  deleteVideoFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 检查文件是否存在
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * 获取视频目录路径
   */
  getVideosDir(): string {
    return this.videosDir;
  }
}

