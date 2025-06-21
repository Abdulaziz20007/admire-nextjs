import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IWebMedia, IMedia, MediaSize } from "@/types/database";
import FormField from "../FormField";
import { useApi } from "@/hooks/useApi";
import styles from "./SectionEditor.module.scss";

interface GallerySectionProps {
  disabled: boolean;
}

export default function GallerySection({ disabled }: GallerySectionProps) {
  const { theme } = useTheme();
  const [galleryItems, setGalleryItems] = useState<IWebMedia[]>([]);
  const [mediaList, setMediaList] = useState<IMedia[]>([]);
  const [newGalleryItem, setNewGalleryItem] = useState({
    alt: "",
    title: "",
    category: "",
    size: MediaSize.STANDARD,
    mediaId: "",
  });
  const [editingItem, setEditingItem] = useState<IWebMedia | null>(null);

  // API hooks
  const {
    data: galleryData,
    loading: loadingGallery,
    error: loadError,
    execute: fetchGallery,
  } = useApi<{ webMedia: IWebMedia[] }>();

  const {
    data: mediaData,
    loading: loadingMedia,
    execute: fetchMedia,
  } = useApi<{ media: IMedia[] }>();

  const {
    loading: saving,
    error: saveError,
    execute: saveGalleryItem,
  } = useApi<IWebMedia>();

  const {
    loading: deleting,
    error: deleteError,
    execute: deleteGalleryItem,
  } = useApi<{ success: boolean }>();

  // Fetch data on component mount
  useEffect(() => {
    fetchGallery("/admin/web-media");
    fetchMedia("/admin/media");
  }, []);

  // Update lists when data changes
  useEffect(() => {
    if (galleryData?.webMedia) {
      setGalleryItems(galleryData.webMedia);
    }
  }, [galleryData]);

  useEffect(() => {
    if (mediaData?.media) {
      setMediaList(mediaData.media);
    }
  }, [mediaData]);

  const handleCreateGalleryItem = async () => {
    if (!newGalleryItem.alt || !newGalleryItem.title || !newGalleryItem.category || !newGalleryItem.mediaId) {
      return;
    }

    const result = await saveGalleryItem("/admin/web-media", {
      method: "POST",
      body: JSON.stringify({
        alt: newGalleryItem.alt,
        title: newGalleryItem.title,
        category: newGalleryItem.category,
        size: newGalleryItem.size,
        media: newGalleryItem.mediaId,
      }),
    });

    if (result) {
      setGalleryItems([...galleryItems, result]);
      setNewGalleryItem({
        alt: "",
        title: "",
        category: "",
        size: MediaSize.STANDARD,
        mediaId: "",
      });
    }
  };

  const handleUpdateGalleryItem = async () => {
    if (!editingItem) return;

    const result = await saveGalleryItem(`/admin/web-media/${editingItem._id}`, {
      method: "PUT",
      body: JSON.stringify({
        alt: editingItem.alt,
        title: editingItem.title,
        category: editingItem.category,
        size: editingItem.size,
      }),
    });

    if (result) {
      setGalleryItems(
        galleryItems.map((item) =>
          item._id === editingItem._id ? result : item
        )
      );
      setEditingItem(null);
    }
  };

  const handleDeleteGalleryItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this item from the gallery?")) {
      return;
    }

    const result = await deleteGalleryItem(`/admin/web-media/${itemId}`, {
      method: "DELETE",
    });

    if (result?.success) {
      setGalleryItems(galleryItems.filter((item) => item._id.toString() !== itemId));
    }
  };

  const startEditing = (item: IWebMedia) => {
    setEditingItem({ ...item });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const getMediaById = (mediaId: string) => {
    return mediaList.find((media) => media._id.toString() === mediaId);
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Gallery Management</h3>
        <p className={styles.sectionDescription}>
          Manage gallery items that appear in the website gallery section
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Add New Gallery Item */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Add New Gallery Item</h4>
          
          <div className={styles.selectField}>
            <label className={styles.label}>
              Select Media <span className={styles.required}>*</span>
            </label>
            <select
              value={newGalleryItem.mediaId}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, mediaId: e.target.value })}
              disabled={disabled || saving || loadingMedia}
              className={styles.select}
            >
              <option value="">Choose media...</option>
              {mediaList.map((media) => (
                <option key={media._id.toString()} value={media._id.toString()}>
                  {media.name} ({media.type ? "Video" : "Image"})
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Title"
            type="text"
            value={newGalleryItem.title}
            onChange={(value) => setNewGalleryItem({ ...newGalleryItem, title: value })}
            disabled={disabled || saving}
            placeholder="Gallery item title"
            required
          />

          <FormField
            label="Alt Text"
            type="text"
            value={newGalleryItem.alt}
            onChange={(value) => setNewGalleryItem({ ...newGalleryItem, alt: value })}
            disabled={disabled || saving}
            placeholder="Alternative text for accessibility"
            required
          />

          <FormField
            label="Category"
            type="text"
            value={newGalleryItem.category}
            onChange={(value) => setNewGalleryItem({ ...newGalleryItem, category: value })}
            disabled={disabled || saving}
            placeholder="e.g., classroom, students, activities"
            required
          />

          <div className={styles.selectField}>
            <label className={styles.label}>
              Size <span className={styles.required}>*</span>
            </label>
            <select
              value={newGalleryItem.size}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, size: e.target.value as MediaSize })}
              disabled={disabled || saving}
              className={styles.select}
            >
              <option value={MediaSize.STANDARD}>Standard (1x1)</option>
              <option value={MediaSize.TALL}>Tall (1x2)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCreateGalleryItem}
            disabled={
              disabled || 
              saving || 
              !newGalleryItem.alt || 
              !newGalleryItem.title || 
              !newGalleryItem.category || 
              !newGalleryItem.mediaId
            }
            className={styles.actionButton}
          >
            {saving ? "Adding..." : "Add to Gallery"}
          </button>
          {saveError && (
            <div className={styles.errorMessage}>
              Error: {saveError}
            </div>
          )}
        </div>

        {/* Gallery Items List */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Gallery Items</h4>
          {loadingGallery ? (
            <div className={styles.loadingMessage}>Loading gallery items...</div>
          ) : loadError ? (
            <div className={styles.errorMessage}>
              Error loading gallery: {loadError}
            </div>
          ) : galleryItems.length === 0 ? (
            <div className={styles.emptyMessage}>No gallery items found</div>
          ) : (
            <div className={styles.mediaGrid}>
              {galleryItems.map((item) => {
                const media = getMediaById(item.media.toString());
                return (
                  <div key={item._id.toString()} className={styles.mediaItem}>
                    {editingItem?._id === item._id ? (
                      // Edit mode
                      <div className={styles.editForm}>
                        <FormField
                          label="Title"
                          type="text"
                          value={editingItem.title}
                          onChange={(value) =>
                            setEditingItem({ ...editingItem, title: value })
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Alt Text"
                          type="text"
                          value={editingItem.alt}
                          onChange={(value) =>
                            setEditingItem({ ...editingItem, alt: value })
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Category"
                          type="text"
                          value={editingItem.category}
                          onChange={(value) =>
                            setEditingItem({ ...editingItem, category: value })
                          }
                          disabled={disabled || saving}
                        />
                        <div className={styles.selectField}>
                          <label className={styles.label}>Size</label>
                          <select
                            value={editingItem.size}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, size: e.target.value as MediaSize })
                            }
                            disabled={disabled || saving}
                            className={styles.select}
                          >
                            <option value={MediaSize.STANDARD}>Standard (1x1)</option>
                            <option value={MediaSize.TALL}>Tall (1x2)</option>
                          </select>
                        </div>
                        <div className={styles.buttonGroup}>
                          <button
                            type="button"
                            onClick={handleUpdateGalleryItem}
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
                          {media ? (
                            media.type ? (
                              <div className={styles.videoIcon}>🎥</div>
                            ) : (
                              <img
                                src={media.url}
                                alt={item.alt}
                                className={styles.mediaImage}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )
                          ) : (
                            <div className={styles.videoIcon}>❓</div>
                          )}
                        </div>
                        <div className={styles.mediaDetails}>
                          <h5 className={styles.mediaName}>{item.title}</h5>
                          <p className={styles.mediaType}>
                            {item.category} • {item.size}
                          </p>
                          <p className={styles.mediaUrl}>{item.alt}</p>
                        </div>
                        <div className={styles.buttonGroup}>
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            disabled={disabled}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryItem(item._id.toString())}
                            disabled={disabled || deleting}
                            className={styles.deleteButton}
                          >
                            {deleting ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {deleteError && (
            <div className={styles.errorMessage}>
              Error removing item: {deleteError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
