import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IMedia } from "@/types/database";
import FormField from "../FormField";
import { useApi } from "@/hooks/useApi";
import styles from "./SectionEditor.module.scss";

interface MediaSectionProps {
  disabled: boolean;
}

export default function MediaSection({ disabled }: MediaSectionProps) {
  const { theme } = useTheme();
  const [mediaList, setMediaList] = useState<IMedia[]>([]);
  const [newMedia, setNewMedia] = useState({
    name: "",
    type: false, // false for image, true for video
    url: "",
  });
  const [editingMedia, setEditingMedia] = useState<IMedia | null>(null);

  // API hooks
  const {
    data: mediaData,
    loading: loadingMedia,
    error: loadError,
    execute: fetchMedia,
  } = useApi<{ media: IMedia[] }>();

  const {
    loading: saving,
    error: saveError,
    execute: saveMedia,
  } = useApi<IMedia>();

  const {
    loading: deleting,
    error: deleteError,
    execute: deleteMedia,
  } = useApi<{ success: boolean }>();

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia("/admin/media");
  }, []);

  // Update media list when data changes
  useEffect(() => {
    if (mediaData?.media) {
      setMediaList(mediaData.media);
    }
  }, [mediaData]);

  const handleCreateMedia = async () => {
    if (!newMedia.name || !newMedia.url) {
      return;
    }

    const result = await saveMedia("/admin/media", {
      method: "POST",
      body: JSON.stringify(newMedia),
    });

    if (result) {
      setMediaList([...mediaList, result]);
      setNewMedia({ name: "", type: false, url: "" });
    }
  };

  const handleUpdateMedia = async () => {
    if (!editingMedia) return;

    const result = await saveMedia(`/admin/media/${editingMedia._id}`, {
      method: "PUT",
      body: JSON.stringify(editingMedia),
    });

    if (result) {
      setMediaList(
        mediaList.map((media) =>
          media._id === editingMedia._id ? result : media
        )
      );
      setEditingMedia(null);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) {
      return;
    }

    const result = await deleteMedia(`/admin/media/${mediaId}`, {
      method: "DELETE",
    });

    if (result?.success) {
      setMediaList(mediaList.filter((media) => media._id.toString() !== mediaId));
    }
  };

  const startEditing = (media: IMedia) => {
    setEditingMedia({ ...media });
  };

  const cancelEditing = () => {
    setEditingMedia(null);
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Media Management</h3>
        <p className={styles.sectionDescription}>
          Manage images and videos used throughout the website
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Add New Media */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Add New Media</h4>
          <FormField
            label="Media Name"
            type="text"
            value={newMedia.name}
            onChange={(value) => setNewMedia({ ...newMedia, name: value })}
            disabled={disabled || saving}
            placeholder="Enter media name"
            required
          />
          <FormField
            label="Media URL"
            type="url"
            value={newMedia.url}
            onChange={(value) => setNewMedia({ ...newMedia, url: value })}
            disabled={disabled || saving}
            placeholder="https://example.com/media.jpg"
            required
          />
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Media Type <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mediaType"
                  checked={!newMedia.type}
                  onChange={() => setNewMedia({ ...newMedia, type: false })}
                  disabled={disabled || saving}
                />
                Image
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mediaType"
                  checked={newMedia.type}
                  onChange={() => setNewMedia({ ...newMedia, type: true })}
                  disabled={disabled || saving}
                />
                Video
              </label>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateMedia}
            disabled={disabled || saving || !newMedia.name || !newMedia.url}
            className={styles.actionButton}
          >
            {saving ? "Adding..." : "Add Media"}
          </button>
          {saveError && (
            <div className={styles.errorMessage}>
              Error: {saveError}
            </div>
          )}
        </div>

        {/* Media List */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Existing Media</h4>
          {loadingMedia ? (
            <div className={styles.loadingMessage}>Loading media...</div>
          ) : loadError ? (
            <div className={styles.errorMessage}>
              Error loading media: {loadError}
            </div>
          ) : mediaList.length === 0 ? (
            <div className={styles.emptyMessage}>No media items found</div>
          ) : (
            <div className={styles.mediaGrid}>
              {mediaList.map((media) => (
                <div key={media._id.toString()} className={styles.mediaItem}>
                  {editingMedia?._id === media._id ? (
                    // Edit mode
                    <div className={styles.editForm}>
                      <FormField
                        label="Name"
                        type="text"
                        value={editingMedia.name}
                        onChange={(value) =>
                          setEditingMedia({ ...editingMedia, name: value })
                        }
                        disabled={disabled || saving}
                      />
                      <FormField
                        label="URL"
                        type="url"
                        value={editingMedia.url}
                        onChange={(value) =>
                          setEditingMedia({ ...editingMedia, url: value })
                        }
                        disabled={disabled || saving}
                      />
                      <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            checked={!editingMedia.type}
                            onChange={() =>
                              setEditingMedia({ ...editingMedia, type: false })
                            }
                            disabled={disabled || saving}
                          />
                          Image
                        </label>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            checked={editingMedia.type}
                            onChange={() =>
                              setEditingMedia({ ...editingMedia, type: true })
                            }
                            disabled={disabled || saving}
                          />
                          Video
                        </label>
                      </div>
                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={handleUpdateMedia}
                          disabled={disabled || saving}
                          className={styles.saveButton}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={disabled || saving}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className={styles.mediaInfo}>
                      <div className={styles.mediaPreview}>
                        {media.type ? (
                          <div className={styles.videoIcon}>🎥</div>
                        ) : (
                          <img
                            src={media.url}
                            alt={media.name}
                            className={styles.mediaImage}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className={styles.mediaDetails}>
                        <h5 className={styles.mediaName}>{media.name}</h5>
                        <p className={styles.mediaType}>
                          {media.type ? "Video" : "Image"}
                        </p>
                        <p className={styles.mediaUrl}>{media.url}</p>
                      </div>
                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={() => startEditing(media)}
                          disabled={disabled}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(media._id.toString())}
                          disabled={disabled || deleting}
                          className={styles.deleteButton}
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {deleteError && (
            <div className={styles.errorMessage}>
              Error deleting media: {deleteError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
