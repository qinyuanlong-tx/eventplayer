import React, { useState } from 'react';
import { Playlist } from '../App';
import './PlaylistManager.css';

interface PlaylistManagerProps {
  playlists: Playlist[];
  selectedPlaylistId: number | null;
  onSelect: (id: number) => void;
  onRefresh: () => void;
}

const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  selectedPlaylistId,
  onSelect,
  onRefresh,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) {
      alert('请输入播放列表名称');
      return;
    }

    try {
      // 检查是否在Electron环境中
      if (typeof window === 'undefined' || !window.electronAPI) {
        alert('错误：请在Electron应用中运行，而不是在浏览器中。\n请使用 npm run dev 启动应用。');
        return;
      }

      console.log('Creating playlist:', newPlaylistName.trim());
      const result = await window.electronAPI.playlist.create(newPlaylistName.trim());
      console.log('Create result:', result);
      
      if (result && result.success) {
        setNewPlaylistName('');
        setShowCreateDialog(false);
        onRefresh();
      } else {
        alert('创建失败: ' + (result?.error || '未知错误'));
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('创建失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个播放列表吗？这将删除所有关联的视频文件。')) {
      const result = await window.electronAPI.playlist.delete(id);
      if (result.success) {
        onRefresh();
        if (selectedPlaylistId === id) {
          // 清除选择 - 通过设置一个不存在的ID
          onSelect(-1);
        }
      } else {
        alert('删除失败: ' + result.error);
      }
    }
  };

  const handleStartEdit = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(playlist.id);
    setEditingName(playlist.name);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) return;

    const result = await window.electronAPI.playlist.update(id, editingName.trim());
    if (result.success) {
      setEditingId(null);
      setEditingName('');
      onRefresh();
    } else {
      alert('更新失败: ' + result.error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="playlist-manager">
      <div className="playlist-manager-header">
        <h2>播放列表</h2>
        <button
          className="btn-create"
          onClick={() => setShowCreateDialog(true)}
        >
          + 新建
        </button>
      </div>

      {showCreateDialog && (
        <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>新建播放列表</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="播放列表名称"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setShowCreateDialog(false);
              }}
            />
            <div className="dialog-actions">
              <button onClick={handleCreate}>创建</button>
              <button onClick={() => setShowCreateDialog(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      <div className="playlist-list">
        {playlists.length === 0 ? (
          <div className="empty-state">暂无播放列表</div>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist.id}
              className={`playlist-item ${selectedPlaylistId === playlist.id ? 'selected' : ''}`}
              onClick={(e) => {
                // 如果点击的是按钮，不触发选择
                if ((e.target as HTMLElement).closest('.playlist-item-actions')) {
                  return;
                }
                console.log('Playlist item clicked:', playlist.id);
                onSelect(playlist.id);
              }}
            >
              {editingId === playlist.id ? (
                <div className="playlist-item-edit" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(playlist.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <div className="playlist-item-actions">
                    <button onClick={() => handleSaveEdit(playlist.id)}>✓</button>
                    <button onClick={handleCancelEdit}>✕</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="playlist-item-name">{playlist.name}</div>
                  <div className="playlist-item-actions">
                    <button onClick={(e) => handleStartEdit(playlist, e)}>重命名</button>
                    <button onClick={(e) => handleDelete(playlist.id, e)}>删除</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;

