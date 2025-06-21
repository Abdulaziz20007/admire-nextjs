import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { ITeacher, IWeb, CEFRLevel } from "@/types/database";
import FormField from "../FormField";
import { useApi } from "@/hooks/useApi";
import styles from "./SectionEditor.module.scss";

interface TeachersSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function TeachersSection({
  content,
  onChange,
  disabled,
}: TeachersSectionProps) {
  const { theme } = useTheme();
  const [teacherList, setTeacherList] = useState<ITeacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    surname: "",
    about: "",
    quote: "",
    image: "",
    overall: 0,
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
    cefr: CEFRLevel.A1,
    experience: 0,
    students: 0,
  });
  const [editingTeacher, setEditingTeacher] = useState<ITeacher | null>(null);

  // API hooks
  const {
    data: teacherData,
    loading: loadingTeachers,
    error: loadError,
    execute: fetchTeachers,
  } = useApi<{ teachers: ITeacher[] }>();

  const {
    loading: saving,
    error: saveError,
    execute: saveTeacher,
  } = useApi<ITeacher>();

  const {
    loading: deleting,
    error: deleteError,
    execute: deleteTeacher,
  } = useApi<{ success: boolean }>();

  // Fetch teachers on component mount
  useEffect(() => {
    fetchTeachers("/admin/teachers");
  }, []);

  // Update teacher list when data changes
  useEffect(() => {
    if (teacherData?.teachers) {
      setTeacherList(teacherData.teachers);
    }
  }, [teacherData]);

  const handleCreateTeacher = async () => {
    if (
      !newTeacher.name.trim() ||
      !newTeacher.surname.trim() ||
      !newTeacher.about.trim()
    ) {
      return;
    }

    const result = await saveTeacher("/admin/teachers", {
      method: "POST",
      body: JSON.stringify(newTeacher),
    });

    if (result) {
      setTeacherList([...teacherList, result]);
      setNewTeacher({
        name: "",
        surname: "",
        about: "",
        quote: "",
        image: "",
        overall: 0,
        listening: 0,
        reading: 0,
        writing: 0,
        speaking: 0,
        cefr: CEFRLevel.A1,
        experience: 0,
        students: 0,
      });
    }
  };

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return;

    const result = await saveTeacher(`/admin/teachers/${editingTeacher._id}`, {
      method: "PUT",
      body: JSON.stringify(editingTeacher),
    });

    if (result) {
      setTeacherList(
        teacherList.map((teacher) =>
          teacher._id === editingTeacher._id ? result : teacher
        )
      );
      setEditingTeacher(null);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) {
      return;
    }

    const result = await deleteTeacher(`/admin/teachers/${teacherId}`, {
      method: "DELETE",
    });

    if (result?.success) {
      setTeacherList(
        teacherList.filter((teacher) => teacher._id.toString() !== teacherId)
      );

      // Update the content teachers array
      const updatedTeachers = Array.isArray(content.teachers)
        ? content.teachers.filter((teacher) => {
            const id = typeof teacher === "object" ? teacher._id : teacher;
            return id.toString() !== teacherId;
          })
        : [];

      onChange({ teachers: updatedTeachers });
    }
  };

  const handleAddToWebTeachers = async (teacherId: string) => {
    const currentTeachers = Array.isArray(content.teachers)
      ? content.teachers
      : [];
    const teacherExists = currentTeachers.some((teacher) => {
      const id = typeof teacher === "object" ? teacher._id : teacher;
      return id.toString() === teacherId;
    });

    if (!teacherExists) {
      const updatedTeachers = [...currentTeachers, teacherId as any];
      onChange({ teachers: updatedTeachers });
    }
  };

  const handleRemoveFromWebTeachers = async (teacherId: string) => {
    const updatedTeachers = Array.isArray(content.teachers)
      ? content.teachers.filter((teacher) => {
          const id = typeof teacher === "object" ? teacher._id : teacher;
          return id.toString() !== teacherId;
        })
      : [];

    onChange({ teachers: updatedTeachers });
  };

  const startEditing = (teacher: ITeacher) => {
    setEditingTeacher({ ...teacher });
  };

  const cancelEditing = () => {
    setEditingTeacher(null);
  };

  const isTeacherInWeb = (teacherId: string) => {
    if (!Array.isArray(content.teachers)) return false;
    return content.teachers.some((teacher) => {
      const id = typeof teacher === "object" ? teacher._id : teacher;
      return id.toString() === teacherId;
    });
  };

  const updateNewTeacherField = (
    field: keyof typeof newTeacher,
    value: any
  ) => {
    setNewTeacher({ ...newTeacher, [field]: value });
  };

  const updateEditingTeacherField = (field: keyof ITeacher, value: any) => {
    if (editingTeacher) {
      setEditingTeacher({ ...editingTeacher, [field]: value });
    }
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Teachers Management</h3>
        <p className={styles.sectionDescription}>
          Manage teacher profiles and their information
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Add New Teacher */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Add New Teacher</h4>

          <div className={styles.teacherFormGrid}>
            <FormField
              label="First Name"
              type="text"
              value={newTeacher.name}
              onChange={(value) => updateNewTeacherField("name", value)}
              disabled={disabled || saving}
              placeholder="John"
              required
            />

            <FormField
              label="Last Name"
              type="text"
              value={newTeacher.surname}
              onChange={(value) => updateNewTeacherField("surname", value)}
              disabled={disabled || saving}
              placeholder="Doe"
              required
            />

            <FormField
              label="About"
              type="textarea"
              value={newTeacher.about}
              onChange={(value) => updateNewTeacherField("about", value)}
              disabled={disabled || saving}
              placeholder="Brief description about the teacher"
              rows={3}
              required
            />

            <FormField
              label="Quote"
              type="textarea"
              value={newTeacher.quote}
              onChange={(value) => updateNewTeacherField("quote", value)}
              disabled={disabled || saving}
              placeholder="Inspirational quote"
              rows={2}
            />

            <FormField
              label="Profile Image URL"
              type="url"
              value={newTeacher.image}
              onChange={(value) => updateNewTeacherField("image", value)}
              disabled={disabled || saving}
              placeholder="https://example.com/teacher.jpg"
              required
            />

            <FormField
              label="Experience (years)"
              type="number"
              value={newTeacher.experience}
              onChange={(value) =>
                updateNewTeacherField("experience", parseInt(value) || 0)
              }
              disabled={disabled || saving}
              min="0"
              max="50"
            />

            <FormField
              label="Number of Students"
              type="number"
              value={newTeacher.students}
              onChange={(value) =>
                updateNewTeacherField("students", parseInt(value) || 0)
              }
              disabled={disabled || saving}
              min="0"
            />

            <div className={styles.selectField}>
              <label className={styles.label}>CEFR Level</label>
              <select
                value={newTeacher.cefr}
                onChange={(e) =>
                  updateNewTeacherField("cefr", e.target.value as CEFRLevel)
                }
                disabled={disabled || saving}
                className={styles.select}
              >
                {Object.values(CEFRLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skill Scores */}
          <div className={styles.fieldGroup}>
            <h5 className={styles.subGroupTitle}>Skill Scores (0-100)</h5>
            <div className={styles.skillGrid}>
              <FormField
                label="Overall"
                type="number"
                value={newTeacher.overall}
                onChange={(value) =>
                  updateNewTeacherField("overall", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Listening"
                type="number"
                value={newTeacher.listening}
                onChange={(value) =>
                  updateNewTeacherField("listening", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Reading"
                type="number"
                value={newTeacher.reading}
                onChange={(value) =>
                  updateNewTeacherField("reading", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Writing"
                type="number"
                value={newTeacher.writing}
                onChange={(value) =>
                  updateNewTeacherField("writing", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Speaking"
                type="number"
                value={newTeacher.speaking}
                onChange={(value) =>
                  updateNewTeacherField("speaking", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateTeacher}
            disabled={
              disabled ||
              saving ||
              !newTeacher.name.trim() ||
              !newTeacher.surname.trim() ||
              !newTeacher.about.trim()
            }
            className={styles.actionButton}
          >
            {saving ? "Adding..." : "Add Teacher"}
          </button>
          {saveError && (
            <div className={styles.errorMessage}>Error: {saveError}</div>
          )}
        </div>

        {/* Teachers List */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Teachers</h4>
          {loadingTeachers ? (
            <div className={styles.loadingMessage}>Loading teachers...</div>
          ) : loadError ? (
            <div className={styles.errorMessage}>
              Error loading teachers: {loadError}
            </div>
          ) : teacherList.length === 0 ? (
            <div className={styles.emptyMessage}>No teachers found</div>
          ) : (
            <div className={styles.teacherList}>
              {teacherList.map((teacher) => (
                <div
                  key={teacher._id.toString()}
                  className={styles.teacherItem}
                >
                  {editingTeacher?._id === teacher._id ? (
                    // Edit mode
                    <div className={styles.editForm}>
                      <div className={styles.teacherFormGrid}>
                        <FormField
                          label="First Name"
                          type="text"
                          value={editingTeacher.name}
                          onChange={(value) =>
                            updateEditingTeacherField("name", value)
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Last Name"
                          type="text"
                          value={editingTeacher.surname}
                          onChange={(value) =>
                            updateEditingTeacherField("surname", value)
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="About"
                          type="textarea"
                          value={editingTeacher.about}
                          onChange={(value) =>
                            updateEditingTeacherField("about", value)
                          }
                          disabled={disabled || saving}
                          rows={3}
                        />
                        <FormField
                          label="Quote"
                          type="textarea"
                          value={editingTeacher.quote}
                          onChange={(value) =>
                            updateEditingTeacherField("quote", value)
                          }
                          disabled={disabled || saving}
                          rows={2}
                        />
                        <FormField
                          label="Profile Image URL"
                          type="url"
                          value={editingTeacher.image}
                          onChange={(value) =>
                            updateEditingTeacherField("image", value)
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Experience (years)"
                          type="number"
                          value={editingTeacher.experience}
                          onChange={(value) =>
                            updateEditingTeacherField(
                              "experience",
                              parseInt(value) || 0
                            )
                          }
                          disabled={disabled || saving}
                          min="0"
                          max="50"
                        />
                        <FormField
                          label="Number of Students"
                          type="number"
                          value={editingTeacher.students}
                          onChange={(value) =>
                            updateEditingTeacherField(
                              "students",
                              parseInt(value) || 0
                            )
                          }
                          disabled={disabled || saving}
                          min="0"
                        />
                        <div className={styles.selectField}>
                          <label className={styles.label}>CEFR Level</label>
                          <select
                            value={editingTeacher.cefr}
                            onChange={(e) =>
                              updateEditingTeacherField(
                                "cefr",
                                e.target.value as CEFRLevel
                              )
                            }
                            disabled={disabled || saving}
                            className={styles.select}
                          >
                            {Object.values(CEFRLevel).map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Edit Skill Scores */}
                      <div className={styles.fieldGroup}>
                        <h5 className={styles.subGroupTitle}>
                          Skill Scores (0-100)
                        </h5>
                        <div className={styles.skillGrid}>
                          <FormField
                            label="Overall"
                            type="number"
                            value={editingTeacher.overall}
                            onChange={(value) =>
                              updateEditingTeacherField(
                                "overall",
                                parseFloat(value) || 0
                              )
                            }
                            disabled={disabled || saving}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <FormField
                            label="Listening"
                            type="number"
                            value={editingTeacher.listening}
                            onChange={(value) =>
                              updateEditingTeacherField(
                                "listening",
                                parseFloat(value) || 0
                              )
                            }
                            disabled={disabled || saving}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <FormField
                            label="Reading"
                            type="number"
                            value={editingTeacher.reading}
                            onChange={(value) =>
                              updateEditingTeacherField(
                                "reading",
                                parseFloat(value) || 0
                              )
                            }
                            disabled={disabled || saving}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <FormField
                            label="Writing"
                            type="number"
                            value={editingTeacher.writing}
                            onChange={(value) =>
                              updateEditingTeacherField(
                                "writing",
                                parseFloat(value) || 0
                              )
                            }
                            disabled={disabled || saving}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <FormField
                            label="Speaking"
                            type="number"
                            value={editingTeacher.speaking}
                            onChange={(value) =>
                              updateEditingTeacherField(
                                "speaking",
                                parseFloat(value) || 0
                              )
                            }
                            disabled={disabled || saving}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={handleUpdateTeacher}
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
                    <div className={styles.teacherInfo}>
                      <div className={styles.teacherHeader}>
                        {teacher.image && (
                          <img
                            src={teacher.image}
                            alt={`${teacher.name} ${teacher.surname}`}
                            className={styles.teacherAvatar}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        <div className={styles.teacherDetails}>
                          <div className={styles.teacherName}>
                            {teacher.name} {teacher.surname}
                          </div>
                          <div className={styles.teacherMeta}>
                            {teacher.cefr} • {teacher.experience} years •{" "}
                            {teacher.students} students
                          </div>
                          <div className={styles.teacherAbout}>
                            {teacher.about}
                          </div>
                          <div className={styles.teacherStatus}>
                            {isTeacherInWeb(teacher._id.toString()) && (
                              <span className={styles.webTeacherBadge}>
                                On Website
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.buttonGroup}>
                        <button
                          type="button"
                          onClick={() => startEditing(teacher)}
                          disabled={disabled}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        {isTeacherInWeb(teacher._id.toString()) ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFromWebTeachers(
                                teacher._id.toString()
                              )
                            }
                            disabled={disabled}
                            className={styles.cancelButton}
                          >
                            Remove from Web
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToWebTeachers(teacher._id.toString())
                            }
                            disabled={disabled}
                            className={styles.actionButton}
                          >
                            Add to Web
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteTeacher(teacher._id.toString())
                          }
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
              Error deleting teacher: {deleteError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
