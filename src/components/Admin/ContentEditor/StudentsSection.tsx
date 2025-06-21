import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IStudent, IWeb, CEFRLevel } from "@/types/database";
import FormField from "../FormField";
import { useApi } from "@/hooks/useApi";
import styles from "./SectionEditor.module.scss";

interface StudentsSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function StudentsSection({
  content,
  onChange,
  disabled,
}: StudentsSectionProps) {
  const { theme } = useTheme();
  const [studentList, setStudentList] = useState<IStudent[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    surname: "",
    image: "",
    certificate: "",
    overall: 0,
    listening: 0,
    reading: 0,
    writing: 0,
    speaking: 0,
    cefr: CEFRLevel.A1,
    comment: "",
  });
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);

  // API hooks
  const {
    data: studentData,
    loading: loadingStudents,
    error: loadError,
    execute: fetchStudents,
  } = useApi<{ students: IStudent[] }>();

  const {
    loading: saving,
    error: saveError,
    execute: saveStudent,
  } = useApi<IStudent>();

  const {
    loading: deleting,
    error: deleteError,
    execute: deleteStudent,
  } = useApi<{ success: boolean }>();

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents("/admin/students");
  }, []);

  // Update student list when data changes
  useEffect(() => {
    if (studentData?.students) {
      setStudentList(studentData.students);
    }
  }, [studentData]);

  const handleCreateStudent = async () => {
    if (
      !newStudent.name.trim() ||
      !newStudent.surname.trim() ||
      !newStudent.comment.trim()
    ) {
      return;
    }

    const result = await saveStudent("/admin/students", {
      method: "POST",
      body: JSON.stringify(newStudent),
    });

    if (result) {
      setStudentList([...studentList, result]);
      setNewStudent({
        name: "",
        surname: "",
        image: "",
        certificate: "",
        overall: 0,
        listening: 0,
        reading: 0,
        writing: 0,
        speaking: 0,
        cefr: CEFRLevel.A1,
        comment: "",
      });
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    const result = await saveStudent(`/admin/students/${editingStudent._id}`, {
      method: "PUT",
      body: JSON.stringify(editingStudent),
    });

    if (result) {
      setStudentList(
        studentList.map((student) =>
          student._id === editingStudent._id ? result : student
        )
      );
      setEditingStudent(null);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) {
      return;
    }

    const result = await deleteStudent(`/admin/students/${studentId}`, {
      method: "DELETE",
    });

    if (result?.success) {
      setStudentList(
        studentList.filter((student) => student._id.toString() !== studentId)
      );

      // Update the content students array
      const updatedStudents = Array.isArray(content.students)
        ? content.students.filter((student) => {
            const id = typeof student === "object" ? student._id : student;
            return id.toString() !== studentId;
          })
        : [];

      onChange({ students: updatedStudents });
    }
  };

  const handleAddToWebStudents = async (studentId: string) => {
    const currentStudents = Array.isArray(content.students)
      ? content.students
      : [];
    const studentExists = currentStudents.some((student) => {
      const id = typeof student === "object" ? student._id : student;
      return id.toString() === studentId;
    });

    if (!studentExists) {
      const updatedStudents = [...currentStudents, studentId as any];
      onChange({ students: updatedStudents });
    }
  };

  const handleRemoveFromWebStudents = async (studentId: string) => {
    const updatedStudents = Array.isArray(content.students)
      ? content.students.filter((student) => {
          const id = typeof student === "object" ? student._id : student;
          return id.toString() !== studentId;
        })
      : [];

    onChange({ students: updatedStudents });
  };

  const startEditing = (student: IStudent) => {
    setEditingStudent({ ...student });
  };

  const cancelEditing = () => {
    setEditingStudent(null);
  };

  const isStudentInWeb = (studentId: string) => {
    if (!Array.isArray(content.students)) return false;
    return content.students.some((student) => {
      const id = typeof student === "object" ? student._id : student;
      return id.toString() === studentId;
    });
  };

  const updateNewStudentField = (
    field: keyof typeof newStudent,
    value: any
  ) => {
    setNewStudent({ ...newStudent, [field]: value });
  };

  const updateEditingStudentField = (field: keyof IStudent, value: any) => {
    if (editingStudent) {
      setEditingStudent({ ...editingStudent, [field]: value });
    }
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Students Management</h3>
        <p className={styles.sectionDescription}>
          Manage student profiles and their achievements
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Add New Student */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Add New Student</h4>

          <div className={styles.teacherFormGrid}>
            <FormField
              label="First Name"
              type="text"
              value={newStudent.name}
              onChange={(value) => updateNewStudentField("name", value)}
              disabled={disabled || saving}
              placeholder="John"
              required
            />

            <FormField
              label="Last Name"
              type="text"
              value={newStudent.surname}
              onChange={(value) => updateNewStudentField("surname", value)}
              disabled={disabled || saving}
              placeholder="Doe"
              required
            />

            <FormField
              label="Profile Image URL"
              type="url"
              value={newStudent.image}
              onChange={(value) => updateNewStudentField("image", value)}
              disabled={disabled || saving}
              placeholder="https://example.com/student.jpg"
              required
            />

            <FormField
              label="Certificate URL"
              type="url"
              value={newStudent.certificate}
              onChange={(value) => updateNewStudentField("certificate", value)}
              disabled={disabled || saving}
              placeholder="https://example.com/certificate.jpg"
              required
            />

            <div className={styles.selectField}>
              <label className={styles.label}>CEFR Level</label>
              <select
                value={newStudent.cefr}
                onChange={(e) =>
                  updateNewStudentField("cefr", e.target.value as CEFRLevel)
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

            <FormField
              label="Testimonial/Comment"
              type="textarea"
              value={newStudent.comment}
              onChange={(value) => updateNewStudentField("comment", value)}
              disabled={disabled || saving}
              placeholder="Student's testimonial or comment about their experience"
              rows={3}
              required
            />
          </div>

          {/* Skill Scores */}
          <div className={styles.fieldGroup}>
            <h5 className={styles.subGroupTitle}>Test Scores (0-100)</h5>
            <div className={styles.skillGrid}>
              <FormField
                label="Overall"
                type="number"
                value={newStudent.overall}
                onChange={(value) =>
                  updateNewStudentField("overall", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Listening"
                type="number"
                value={newStudent.listening}
                onChange={(value) =>
                  updateNewStudentField("listening", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Reading"
                type="number"
                value={newStudent.reading}
                onChange={(value) =>
                  updateNewStudentField("reading", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Writing"
                type="number"
                value={newStudent.writing}
                onChange={(value) =>
                  updateNewStudentField("writing", parseFloat(value) || 0)
                }
                disabled={disabled || saving}
                min="0"
                max="100"
                step="0.1"
              />
              <FormField
                label="Speaking"
                type="number"
                value={newStudent.speaking}
                onChange={(value) =>
                  updateNewStudentField("speaking", parseFloat(value) || 0)
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
            onClick={handleCreateStudent}
            disabled={
              disabled ||
              saving ||
              !newStudent.name.trim() ||
              !newStudent.surname.trim() ||
              !newStudent.comment.trim()
            }
            className={styles.actionButton}
          >
            {saving ? "Adding..." : "Add Student"}
          </button>
          {saveError && (
            <div className={styles.errorMessage}>Error: {saveError}</div>
          )}
        </div>

        {/* Students List */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Students</h4>
          {loadingStudents ? (
            <div className={styles.loadingMessage}>Loading students...</div>
          ) : loadError ? (
            <div className={styles.errorMessage}>
              Error loading students: {loadError}
            </div>
          ) : studentList.length === 0 ? (
            <div className={styles.emptyMessage}>No students found</div>
          ) : (
            <div className={styles.teacherList}>
              {studentList.map((student) => (
                <div
                  key={student._id.toString()}
                  className={styles.teacherItem}
                >
                  {editingStudent?._id === student._id ? (
                    // Edit mode
                    <div className={styles.editForm}>
                      <div className={styles.teacherFormGrid}>
                        <FormField
                          label="First Name"
                          type="text"
                          value={editingStudent.name}
                          onChange={(value) =>
                            updateEditingStudentField("name", value)
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Last Name"
                          type="text"
                          value={editingStudent.surname}
                          onChange={(value) =>
                            updateEditingStudentField("surname", value)
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Profile Image URL"
                          type="url"
                          value={editingStudent.image}
                          onChange={(value) =>
                            updateEditingStudentField("image", value)
                          }
                          disabled={disabled || saving}
                        />
                        <FormField
                          label="Certificate URL"
                          type="url"
                          value={editingStudent.certificate}
                          onChange={(value) =>
                            updateEditingStudentField("certificate", value)
                          }
                          disabled={disabled || saving}
                        />
                        <div className={styles.selectField}>
                          <label className={styles.label}>CEFR Level</label>
                          <select
                            value={editingStudent.cefr}
                            onChange={(e) =>
                              updateEditingStudentField(
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
                        <FormField
                          label="Testimonial/Comment"
                          type="textarea"
                          value={editingStudent.comment}
                          onChange={(value) =>
                            updateEditingStudentField("comment", value)
                          }
                          disabled={disabled || saving}
                          rows={3}
                        />
                      </div>

                      {/* Edit Test Scores */}
                      <div className={styles.fieldGroup}>
                        <h5 className={styles.subGroupTitle}>
                          Test Scores (0-100)
                        </h5>
                        <div className={styles.skillGrid}>
                          <FormField
                            label="Overall"
                            type="number"
                            value={editingStudent.overall}
                            onChange={(value) =>
                              updateEditingStudentField(
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
                            value={editingStudent.listening}
                            onChange={(value) =>
                              updateEditingStudentField(
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
                            value={editingStudent.reading}
                            onChange={(value) =>
                              updateEditingStudentField(
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
                            value={editingStudent.writing}
                            onChange={(value) =>
                              updateEditingStudentField(
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
                            value={editingStudent.speaking}
                            onChange={(value) =>
                              updateEditingStudentField(
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
                          onClick={handleUpdateStudent}
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
                        {student.image && (
                          <img
                            src={student.image}
                            alt={`${student.name} ${student.surname}`}
                            className={styles.teacherAvatar}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        <div className={styles.teacherDetails}>
                          <div className={styles.teacherName}>
                            {student.name} {student.surname}
                          </div>
                          <div className={styles.teacherMeta}>
                            {student.cefr} • Overall: {student.overall}%
                          </div>
                          <div className={styles.teacherAbout}>
                            {student.comment}
                          </div>
                          <div className={styles.teacherStatus}>
                            {isStudentInWeb(student._id.toString()) && (
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
                          onClick={() => startEditing(student)}
                          disabled={disabled}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        {isStudentInWeb(student._id.toString()) ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveFromWebStudents(
                                student._id.toString()
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
                              handleAddToWebStudents(student._id.toString())
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
                            handleDeleteStudent(student._id.toString())
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
              Error deleting student: {deleteError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
