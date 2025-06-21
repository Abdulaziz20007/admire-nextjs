import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IWeb } from "@/types/database";
import FormField from "../FormField";
import styles from "./SectionEditor.module.scss";

interface ContactSectionProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  disabled: boolean;
}

export default function ContactSection({
  content,
  onChange,
  disabled,
}: ContactSectionProps) {
  const { theme } = useTheme();

  const handleFieldChange = (field: keyof IWeb, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className={`${styles.sectionEditor} ${styles[theme]}`}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Contact Section</h3>
        <p className={styles.sectionDescription}>
          Configure contact information and location details
        </p>
      </div>

      <div className={styles.formGrid}>
        {/* Contact Information */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Contact Information</h4>
          <FormField
            label="Email Address"
            type="email"
            value={content.email || ""}
            onChange={(value) => handleFieldChange("email", value)}
            disabled={disabled}
            placeholder="contact@example.com"
            required
          />
        </div>

        {/* Address Information */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Address</h4>
          <FormField
            label="Address (Uzbek)"
            type="textarea"
            value={content.addressUz || ""}
            onChange={(value) => handleFieldChange("addressUz", value)}
            disabled={disabled}
            placeholder="Manzil"
            rows={3}
          />
          <FormField
            label="Address (English)"
            type="textarea"
            value={content.addressEn || ""}
            onChange={(value) => handleFieldChange("addressEn", value)}
            disabled={disabled}
            placeholder="Address"
            rows={3}
          />
        </div>

        {/* Location Coordinates */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Map Location</h4>
          <div className={styles.coordinatesGrid}>
            <FormField
              label="Latitude"
              type="number"
              value={content.latitude || ""}
              onChange={(value) => handleFieldChange("latitude", parseFloat(value) || 0)}
              disabled={disabled}
              placeholder="41.2995"
              step="0.000001"
              description="Latitude coordinate for map"
            />
            <FormField
              label="Longitude"
              type="number"
              value={content.longitude || ""}
              onChange={(value) => handleFieldChange("longitude", parseFloat(value) || 0)}
              disabled={disabled}
              placeholder="69.2401"
              step="0.000001"
              description="Longitude coordinate for map"
            />
          </div>
        </div>

        {/* Working Hours */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Working Hours</h4>
          <FormField
            label="Working Hours (Uzbek)"
            type="text"
            value={content.workingHoursUz || ""}
            onChange={(value) => handleFieldChange("workingHoursUz", value)}
            disabled={disabled}
            placeholder="Dushanba - Juma: 9:00 - 18:00"
          />
          <FormField
            label="Working Hours (English)"
            type="text"
            value={content.workingHoursEn || ""}
            onChange={(value) => handleFieldChange("workingHoursEn", value)}
            disabled={disabled}
            placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
          />
        </div>

        {/* Additional Information */}
        <div className={styles.fieldGroup}>
          <h4 className={styles.groupTitle}>Additional Information</h4>
          <FormField
            label="Website URL"
            type="url"
            value={content.website || ""}
            onChange={(value) => handleFieldChange("website", value)}
            disabled={disabled}
            placeholder="https://example.com"
          />
          <FormField
            label="Contact Form Endpoint"
            type="url"
            value={content.contactFormEndpoint || ""}
            onChange={(value) => handleFieldChange("contactFormEndpoint", value)}
            disabled={disabled}
            placeholder="/api/contact"
            description="API endpoint for contact form submissions"
          />
        </div>
      </div>
    </div>
  );
}
