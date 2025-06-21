import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IPhone, IWeb } from "@/types/database";
import FormField from "../FormField";
import { useApi } from "@/hooks/useApi";
import styles from "./SectionEditor.module.scss";

interface PhoneSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function PhoneSection({ content, onChange, disabled }: PhoneSectionProps) {
  const { theme } = useTheme();
  const [phoneList, setPhoneList] = useState<IPhone[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [editingPhone, setEditingPhone] = useState<IPhone | null>(null);

  // API hooks
  const {
    data: phoneData,
    loading: loadingPhones,
    error: loadError,
    execute: fetchPhones,
  } = useApi<{ phones: IPhone[] }>();

  const {
    loading: saving,
    error: saveError,
    execute: savePhone,
  } = useApi<IPhone>();

  const {
    loading: deleting,
    error: deleteError,
    execute: deletePhone,
  } = useApi<{ success: boolean }>();

  const {
    loading: updatingWeb,
    error: updateWebError,
    execute: updateWebPhones,
  } = useApi<IWeb>();

  // Fetch phones on component mount
  useEffect(() => {
    fetchPhones("/admin/web-phones");
  }, []);

  // Update phone list when data changes
  useEffect(() => {
    if (phoneData?.phones) {
      setPhoneList(phoneData.phones);
    }
  }, [phoneData]);

  const handleCreatePhone = async () => {
    if (!newPhone.trim()) {
      return;
    }

    const result = await savePhone("/admin/web-phones", {
      method: "POST",
      body: JSON.stringify({ phone: newPhone.trim() }),
    });

    if (result) {
      setPhoneList([...phoneList, result]);
      setNewPhone("");
    }
  };

  const handleUpdatePhone = async () => {
    if (!editingPhone || !editingPhone.phone.trim()) return;

    const result = await savePhone(`/admin/web-phones/${editingPhone._id}`, {
      method: "PUT",
      body: JSON.stringify({ phone: editingPhone.phone.trim() }),
    });

    if (result) {
      setPhoneList(
        phoneList.map((phone) =>
          phone._id === editingPhone._id ? result : phone
        )
      );
      setEditingPhone(null);
    }
  };

  const handleDeletePhone = async (phoneId: string) => {
    // Check if this is the main phone
    const isMainPhone = content.mainPhone && 
      (typeof content.mainPhone === 'object' ? content.mainPhone._id : content.mainPhone).toString() === phoneId;
    
    if (isMainPhone) {
      alert("Cannot delete the main phone number. Please set a different main phone first.");
      return;
    }

    if (!confirm("Are you sure you want to delete this phone number?")) {
      return;
    }

    const result = await deletePhone(`/admin/web-phones/${phoneId}`, {
      method: "DELETE",
    });

    if (result?.success) {
      setPhoneList(phoneList.filter((phone) => phone._id.toString() !== phoneId));
      
      // Update the content phones array
      const updatedPhones = Array.isArray(content.phones) 
        ? content.phones.filter(phone => {
            const id = typeof phone === 'object' ? phone._id : phone;
            return id.toString() !== phoneId;
          })
        : [];
      
      onChange({ phones: updatedPhones });
    }
  };

  const handleSetMainPhone = async (phoneId: string) => {
    if (!confirm("Set this as the main phone number?")) {
      return;
    }

    // Update the web content with new main phone
    onChange({ mainPhone: phoneId as any });
  };

  const handleAddToWebPhones = async (phoneId: string) => {
    // Add phone to web phones array if not already included
    const currentPhones = Array.isArray(content.phones) ? content.phones : [];
    const phoneExists = currentPhones.some(phone => {
      const id = typeof phone === 'object' ? phone._id : phone;
      return id.toString() === phoneId;
    });

    if (!phoneExists) {
      const updatedPhones = [...currentPhones, phoneId as any];
      onChange({ phones: updatedPhones });
    }
  };

  const handleRemoveFromWebPhones = async (phoneId: string) => {
    const updatedPhones = Array.isArray(content.phones) 
      ? content.phones.filter(phone => {
          const id = typeof phone === 'object' ? phone._id : phone;
          return id.toString() !== phoneId;
        })
      : [];
    
    onChange({ phones: updatedPhones });
  };

  const startEditing = (phone: IPhone) => {
    setEditingPhone({ ...phone });
  };

  const cancelEditing = () => {
    setEditingPhone(null);
  };

  const isPhoneInWeb = (phoneId: string) => {
    if (!Array.isArray(content.phones)) return false;
    return content.phones.some(phone => {
      const id = typeof phone === 'object' ? phone._id : phone;
      return id.toString() === phoneId;
    });
  };

  const isMainPhone = (phoneId: string) => {
    if (!content.mainPhone) return false;
    const mainPhoneId = typeof content.mainPhone === 'object' ? content.mainPhone._id : content.mainPhone;
    return mainPhoneId.toString() === phoneId;
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Phone Numbers Management</h3>
        <p className={styles.sectionDescription}>
          Manage phone numbers displayed on the website
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Add New Phone */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Add New Phone Number</h4>
          <FormField
            label="Phone Number"
            type="text"
            value={newPhone}
            onChange={(value) => setNewPhone(value)}
            disabled={disabled || saving}
            placeholder="+998 90 123 45 67"
            required
          />
          <button
            type="button"
            onClick={handleCreatePhone}
            disabled={disabled || saving || !newPhone.trim()}
            className={styles.actionButton}
          >
            {saving ? "Adding..." : "Add Phone Number"}
          </button>
          {saveError && (
            <div className={styles.errorMessage}>
              Error: {saveError}
            </div>
          )}
        </div>

        {/* Phone Numbers List */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Phone Numbers</h4>
          {loadingPhones ? (
            <div className={styles.loadingMessage}>Loading phone numbers...</div>
          ) : loadError ? (
            <div className={styles.errorMessage}>
              Error loading phones: {loadError}
            </div>
          ) : phoneList.length === 0 ? (
            <div className={styles.emptyMessage}>No phone numbers found</div>
          ) : (
            <div className={styles.phoneList}>
              {phoneList.map((phone) => (
                <div key={phone._id.toString()} className={styles.phoneItem}>
                  {editingPhone?._id === phone._id ? (
                    // Edit mode
                    <div className={styles.editForm}>
                      <FormField
                        label="Phone Number"
                        type="text"
                        value={editingPhone.phone}
                        onChange={(value) =>
                          setEditingPhone({ ...editingPhone, phone: value })
                        }
                        disabled={disabled || saving}
                      />
                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={handleUpdatePhone}
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
                    <div className={styles.phoneInfo}>
                      <div className={styles.phoneDetails}>
                        <div className={styles.phoneNumber}>{phone.phone}</div>
                        <div className={styles.phoneStatus}>
                          {isMainPhone(phone._id.toString()) && (
                            <span className={styles.mainPhoneBadge}>Main Phone</span>
                          )}
                          {isPhoneInWeb(phone._id.toString()) && (
                            <span className={styles.webPhoneBadge}>On Website</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={() => startEditing(phone)}
                          disabled={disabled}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        {!isMainPhone(phone._id.toString()) && (
                          <button
                            type="button"
                            onClick={() => handleSetMainPhone(phone._id.toString())}
                            disabled={disabled || updatingWeb}
                            className={styles.actionButton}
                          >
                            Set as Main
                          </button>
                        )}
                        {isPhoneInWeb(phone._id.toString()) ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveFromWebPhones(phone._id.toString())}
                            disabled={disabled}
                            className={styles.cancelButton}
                          >
                            Remove from Web
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToWebPhones(phone._id.toString())}
                            disabled={disabled}
                            className={styles.actionButton}
                          >
                            Add to Web
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePhone(phone._id.toString())}
                          disabled={disabled || deleting || isMainPhone(phone._id.toString())}
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
              Error deleting phone: {deleteError}
            </div>
          )}
          {updateWebError && (
            <div className={styles.errorMessage}>
              Error updating web phones: {updateWebError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
