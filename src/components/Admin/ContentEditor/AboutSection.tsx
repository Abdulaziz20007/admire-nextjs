import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IWeb } from "@/types/database";
import FormField from "../FormField";
import styles from "./SectionEditor.module.scss";

interface AboutSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function AboutSection({
  content,
  onChange,
  disabled,
}: AboutSectionProps) {
  const { theme } = useTheme();

  const handleFieldChange = (field: keyof IWeb, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>About Section</h3>
        <p className={styles.sectionDescription}>
          Configure the about section content and statistics
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* About Content */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>About Content</h4>
          <FormField
            label="First Paragraph (Uzbek)"
            type="textarea"
            value={content.aboutP1Uz || ""}
            onChange={(value) => handleFieldChange("aboutP1Uz", value)}
            disabled={disabled}
            placeholder="Birinchi paragraf"
            rows={4}
            required
          />
          <FormField
            label="First Paragraph (English)"
            type="textarea"
            value={content.aboutP1En || ""}
            onChange={(value) => handleFieldChange("aboutP1En", value)}
            disabled={disabled}
            placeholder="First paragraph"
            rows={4}
            required
          />
          <FormField
            label="Second Paragraph (Uzbek)"
            type="textarea"
            value={content.aboutP2Uz || ""}
            onChange={(value) => handleFieldChange("aboutP2Uz", value)}
            disabled={disabled}
            placeholder="Ikkinchi paragraf"
            rows={4}
          />
          <FormField
            label="Second Paragraph (English)"
            type="textarea"
            value={content.aboutP2En || ""}
            onChange={(value) => handleFieldChange("aboutP2En", value)}
            disabled={disabled}
            placeholder="Second paragraph"
            rows={4}
          />
        </div>

        {/* Statistics */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Statistics</h4>
          <div className={styles.statsGrid}>
            <FormField
              label="Total Students"
              type="number"
              value={content.totalStudents || 0}
              onChange={(value) => handleFieldChange("totalStudents", parseInt(value) || 0)}
              disabled={disabled}
              placeholder="0"
              min="0"
            />
            <FormField
              label="Best Students"
              type="number"
              value={content.bestStudents || 0}
              onChange={(value) => handleFieldChange("bestStudents", parseInt(value) || 0)}
              disabled={disabled}
              placeholder="0"
              min="0"
            />
            <FormField
              label="Total Teachers"
              type="number"
              value={content.totalTeachers || 0}
              onChange={(value) => handleFieldChange("totalTeachers", parseInt(value) || 0)}
              disabled={disabled}
              placeholder="0"
              min="0"
            />
            <FormField
              label="Years of Experience"
              type="number"
              value={content.yearsOfExperience || 0}
              onChange={(value) => handleFieldChange("yearsOfExperience", parseInt(value) || 0)}
              disabled={disabled}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {/* About Image */}
        <FormField
          label="About Section Image URL"
          type="url"
          value={content.aboutImg || ""}
          onChange={(value) => handleFieldChange("aboutImg", value)}
          disabled={disabled}
          placeholder="https://example.com/about-image.jpg"
          description="Image displayed in the about section"
        />
      </div>
    </div>
  );
}
