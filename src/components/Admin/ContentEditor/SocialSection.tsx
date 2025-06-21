import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ISocial, IIcon, IWeb } from "@/types/database";
import FormField from "../FormField";
import { useApi } from "@/hooks/useApi";
import styles from "./SectionEditor.module.scss";

interface SocialSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function SocialSection({ content, onChange, disabled }: SocialSectionProps) {
  const { theme } = useTheme();
  const [socialList, setSocialList] = useState<ISocial[]>([]);
  const [iconList, setIconList] = useState<IIcon[]>([]);
  const [newSocial, setNewSocial] = useState({
    name: "",
    url: "",
    iconId: "",
  });
  const [editingSocial, setEditingSocial] = useState<ISocial | null>(null);

  // API hooks
  const {
    data: socialData,
    loading: loadingSocials,
    error: loadSocialError,
    execute: fetchSocials,
  } = useApi<{ socials: ISocial[] }>();

  const {
    data: iconData,
    loading: loadingIcons,
    error: loadIconError,
    execute: fetchIcons,
  } = useApi<{ icons: IIcon[] }>();

  const {
    loading: saving,
    error: saveError,
    execute: saveSocial,
  } = useApi<ISocial>();

  const {
    loading: deleting,
    error: deleteError,
    execute: deleteSocial,
  } = useApi<{ success: boolean }>();

  // Fetch data on component mount
  useEffect(() => {
    fetchSocials("/admin/socials");
    fetchIcons("/admin/icons");
  }, []);

  // Update lists when data changes
  useEffect(() => {
    if (socialData?.socials) {
      setSocialList(socialData.socials);
    }
  }, [socialData]);

  useEffect(() => {
    if (iconData?.icons) {
      setIconList(iconData.icons);
    }
  }, [iconData]);

  const handleCreateSocial = async () => {
    if (!newSocial.name.trim() || !newSocial.url.trim() || !newSocial.iconId) {
      return;
    }

    const result = await saveSocial("/admin/socials", {
      method: "POST",
      body: JSON.stringify({
        name: newSocial.name.trim(),
        url: newSocial.url.trim(),
        icon: newSocial.iconId,
      }),
    });

    if (result) {
      setSocialList([...socialList, result]);
      setNewSocial({ name: "", url: "", iconId: "" });
    }
  };

  const handleUpdateSocial = async () => {
    if (!editingSocial || !editingSocial.name.trim() || !editingSocial.url.trim()) return;

    const result = await saveSocial(`/admin/socials/${editingSocial._id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: editingSocial.name.trim(),
        url: editingSocial.url.trim(),
        icon: typeof editingSocial.icon === 'object' ? editingSocial.icon._id : editingSocial.icon,
      }),
    });

    if (result) {
      setSocialList(
        socialList.map((social) =>
          social._id === editingSocial._id ? result : social
        )
      );
      setEditingSocial(null);
    }
  };

  const handleDeleteSocial = async (socialId: string) => {
    if (!confirm("Are you sure you want to delete this social media link?")) {
      return;
    }

    const result = await deleteSocial(`/admin/socials/${socialId}`, {
      method: "DELETE",
    });

    if (result?.success) {
      setSocialList(socialList.filter((social) => social._id.toString() !== socialId));
      
      // Update the content socials array
      const updatedSocials = Array.isArray(content.socials) 
        ? content.socials.filter(social => {
            const id = typeof social === 'object' ? social._id : social;
            return id.toString() !== socialId;
          })
        : [];
      
      onChange({ socials: updatedSocials });
    }
  };

  const handleAddToWebSocials = async (socialId: string) => {
    // Add social to web socials array if not already included
    const currentSocials = Array.isArray(content.socials) ? content.socials : [];
    const socialExists = currentSocials.some(social => {
      const id = typeof social === 'object' ? social._id : social;
      return id.toString() === socialId;
    });

    if (!socialExists) {
      const updatedSocials = [...currentSocials, socialId as any];
      onChange({ socials: updatedSocials });
    }
  };

  const handleRemoveFromWebSocials = async (socialId: string) => {
    const updatedSocials = Array.isArray(content.socials) 
      ? content.socials.filter(social => {
          const id = typeof social === 'object' ? social._id : social;
          return id.toString() !== socialId;
        })
      : [];
    
    onChange({ socials: updatedSocials });
  };

  const startEditing = (social: ISocial) => {
    setEditingSocial({ ...social });
  };

  const cancelEditing = () => {
    setEditingSocial(null);
  };

  const isSocialInWeb = (socialId: string) => {
    if (!Array.isArray(content.socials)) return false;
    return content.socials.some(social => {
      const id = typeof social === 'object' ? social._id : social;
      return id.toString() === socialId;
    });
  };

  const getIconById = (iconId: string) => {
    return iconList.find((icon) => icon._id.toString() === iconId);
  };

  const getSocialIcon = (social: ISocial) => {
    if (typeof social.icon === 'object') {
      return social.icon;
    }
    return getIconById(social.icon.toString());
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Social Media Links</h3>
        <p className={styles.sectionDescription}>
          Manage social media links displayed on the website
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Add New Social Link */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Add New Social Media Link</h4>
          
          <FormField
            label="Platform Name"
            type="text"
            value={newSocial.name}
            onChange={(value) => setNewSocial({ ...newSocial, name: value })}
            disabled={disabled || saving}
            placeholder="e.g., Facebook, Instagram, Telegram"
            required
          />

          <FormField
            label="URL"
            type="url"
            value={newSocial.url}
            onChange={(value) => setNewSocial({ ...newSocial, url: value })}
            disabled={disabled || saving}
            placeholder="https://facebook.com/yourpage"
            required
          />

          <div className={styles.selectField}>
            <label className={styles.label}>
              Icon <span className={styles.required}>*</span>
            </label>
            <select
              value={newSocial.iconId}
              onChange={(e) => setNewSocial({ ...newSocial, iconId: e.target.value })}
              disabled={disabled || saving || loadingIcons}
              className={styles.select}
            >
              <option value="">Choose icon...</option>
              {iconList.map((icon) => (
                <option key={icon._id.toString()} value={icon._id.toString()}>
                  {icon.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleCreateSocial}
            disabled={
              disabled || 
              saving || 
              !newSocial.name.trim() || 
              !newSocial.url.trim() || 
              !newSocial.iconId
            }
            className={styles.actionButton}
          >
            {saving ? "Adding..." : "Add Social Link"}
          </button>
          {saveError && (
            <div className={styles.errorMessage}>
              Error: {saveError}
            </div>
          )}
        </div>

        {/* Social Links List */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Social Media Links</h4>
          {loadingSocials ? (
            <div className={styles.loadingMessage}>Loading social links...</div>
          ) : loadSocialError ? (
            <div className={styles.errorMessage}>
              Error loading socials: {loadSocialError}
            </div>
          ) : socialList.length === 0 ? (
            <div className={styles.emptyMessage}>No social media links found</div>
          ) : (
            <div className={styles.socialList}>
              {socialList.map((social) => {
                const icon = getSocialIcon(social);
                return (
                  <div key={social._id.toString()} className={styles.socialItem}>
                    {editingSocial?._id === social._id ? (
                      // Edit mode
                      <div className={styles.editForm}>
                        <FormField
                          label="Platform Name"
                          type="text"
                          value={editingSocial.name}
                          onChange={(value) =>
                            setEditingSocial({ ...editingSocial, name: value })
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="URL"
                          type="url"
                          value={editingSocial.url}
                          onChange={(value) =>
                            setEditingSocial({ ...editingSocial, url: value })
                          }
                          disabled={disabled || saving}
                        />
                        <div className={styles.buttonGroup}>
                          <button
                            type="button"
                            onClick={handleUpdateSocial}
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
                      <div className={styles.socialInfo}>
                        <div className={styles.socialDetails}>
                          <div className={styles.socialHeader}>
                            {icon && (
                              <img
                                src={icon.url}
                                alt={icon.name}
                                className={styles.socialIcon}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <div className={styles.socialName}>{social.name}</div>
                          </div>
                          <div className={styles.socialUrl}>{social.url}</div>
                          <div className={styles.socialStatus}>
                            {isSocialInWeb(social._id.toString()) && (
                              <span className={styles.webSocialBadge}>On Website</span>
                            )}
                          </div>
                        </div>
                        <div className={styles.buttonGroup}>
                          <button
                            type="button"
                            onClick={() => startEditing(social)}
                            disabled={disabled}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          {isSocialInWeb(social._id.toString()) ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveFromWebSocials(social._id.toString())}
                              disabled={disabled}
                              className={styles.cancelButton}
                            >
                              Remove from Web
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddToWebSocials(social._id.toString())}
                              disabled={disabled}
                              className={styles.actionButton}
                            >
                              Add to Web
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteSocial(social._id.toString())}
                            disabled={disabled || deleting}
                            className={styles.deleteButton}
                          >
                            {deleting ? "Deleting..." : "Delete"}
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
              Error deleting social link: {deleteError}
            </div>
          )}
          {loadIconError && (
            <div className={styles.errorMessage}>
              Error loading icons: {loadIconError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
