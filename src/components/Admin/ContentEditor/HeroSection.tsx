import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IWeb } from "@/types/database";
import FormField from "../FormField";
import styles from "./SectionEditor.module.scss";

interface HeroSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function HeroSection({
  content,
  onChange,
  disabled,
}: HeroSectionProps) {
  const { theme } = useTheme();

  const handleFieldChange = (field: keyof IWeb, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Hero Section</h3>
        <p className={styles.sectionDescription}>
          Configure the main header section that visitors see first
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Header Image */}
        <FormField
          label="Header Image URL"
          type="url"
          value={content.headerImg || ""}
          onChange={(value) => handleFieldChange("headerImg", value)}
          disabled={disabled}
          placeholder="https://example.com/image.jpg"
          description="URL of the main header image"
        />

        {/* Main Headings */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Main Heading</h4>
          <FormField
            label="Heading (Uzbek)"
            type="text"
            value={content.headerH1Uz || ""}
            onChange={(value) => handleFieldChange("headerH1Uz", value)}
            disabled={disabled}
            placeholder="Bosh sarlavha"
            required
          />
          <FormField
            label="Heading (English)"
            type="text"
            value={content.headerH1En || ""}
            onChange={(value) => handleFieldChange("headerH1En", value)}
            disabled={disabled}
            placeholder="Main Heading"
            required
          />
        </div>
      </div>
    </div>
  );
}
