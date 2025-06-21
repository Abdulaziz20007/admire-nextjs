import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { IWeb } from "@/types/database";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ContactSection from "./ContactSection";
import MediaSection from "./MediaSection";
import GallerySection from "./GallerySection";
import PhoneSection from "./PhoneSection";
import SocialSection from "./SocialSection";
import TeachersSection from "./TeachersSection";
import StudentsSection from "./StudentsSection";
import styles from "./ContentEditor.module.scss";

interface ContentEditorProps {
  content: IWeb;
  onChange: (updatedContent: Partial<IWeb>) => void;
  saving: boolean;
  error: string | null;
}

export default function ContentEditor({
  content,
  onChange,
  saving,
  error,
}: ContentEditorProps) {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>("hero");

  const sections = [
    { id: "hero", label: "Hero Section", icon: "🏠" },
    { id: "about", label: "About Section", icon: "📖" },
    { id: "media", label: "Media", icon: "🎬" },
    { id: "gallery", label: "Gallery", icon: "🖼️" },
    { id: "teachers", label: "Teachers", icon: "👨‍🏫" },
    { id: "students", label: "Students", icon: "👨‍🎓" },
    { id: "phones", label: "Phone Numbers", icon: "📱" },
    { id: "socials", label: "Social Media", icon: "🌐" },
    { id: "contact", label: "Contact Section", icon: "📞" },
  ];

  const handleSectionChange = (sectionData: Partial<IWeb>) => {
    onChange(sectionData);
  };

  return (
    <div className={`${styles.contentEditor} ${styles[theme]}`}>
      {/* Section Navigation */}
      <div className={styles.sectionNav}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`${styles.sectionButton} ${
              activeSection === section.id ? styles.active : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className={styles.sectionIcon}>{section.icon}</span>
            <span className={styles.sectionLabel}>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>Error saving content: {error}</span>
        </div>
      )}

      {/* Section Content */}
      <div className={styles.sectionContent}>
        {activeSection === "hero" && (
          <HeroSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
        {activeSection === "about" && (
          <AboutSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
        {activeSection === "media" && <MediaSection disabled={saving} />}
        {activeSection === "gallery" && <GallerySection disabled={saving} />}
        {activeSection === "teachers" && (
          <TeachersSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
        {activeSection === "students" && (
          <StudentsSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
        {activeSection === "phones" && (
          <PhoneSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
        {activeSection === "socials" && (
          <SocialSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
        {activeSection === "contact" && (
          <ContactSection
            content={content}
            onChange={handleSectionChange}
            disabled={saving}
          />
        )}
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className={styles.savingIndicator}>
          <div className={styles.spinner}></div>
          <span>Saving changes...</span>
        </div>
      )}
    </div>
  );
}
