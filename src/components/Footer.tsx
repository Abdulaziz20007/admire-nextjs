import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./Footer.module.scss";

// Icon components
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17l10-10"></path>
    <path d="M7 7h10v10"></path>
  </svg>
);

// Social media icons
const YouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TelegramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-8.609 3.33c-2.068.8-4.133 1.598-5.724 2.21a405.15 405.15 0 0 1-2.849 1.09c-.42.147-.99.332-1.473.901-.728.968.193 1.798.919 2.286 1.61.516 3.275 1.009 4.654 1.472.846 1.467 1.683 2.986 2.586 4.579.281.589.6 1.171.999 1.812.195.323.553.733 1.117.733.35 0 .729-.134 1.116-.51.325-.31.501-.678.656-.981 1.701-2.64 3.418-5.303 5.006-7.953 1.484-2.482 2.987-5.006 4.35-7.443.142-.275.333-.619.343-1.103.035-.653-.211-1.208-.65-1.638a2.334 2.334 0 0 0-1.419-.616z"></path>
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

// Helper function to get contact icon
const getContactIcon = (type: string) => {
  switch (type) {
    case "phone":
      return <PhoneIcon />;
    case "email":
      return <EmailIcon />;
    case "address":
      return <LocationIcon />;
    default:
      return null;
  }
};

// Helper function to get social icon
const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "youtube":
      return <YouTubeIcon />;
    case "instagram":
      return <InstagramIcon />;
    case "telegram":
      return <TelegramIcon />;
    case "facebook":
      return <FacebookIcon />;
    case "linkedin":
      return <LinkedInIcon />;
    default:
      return null;
  }
};

export default function Footer() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const webData = useWebDataStore((state) => state.webData);
  const currentYear = new Date().getFullYear();

  // Get localized footer tagline
  const footerTagline = webData
    ? getLocalizedText(webData.footer_p_uz, webData.footer_p_en, language)
    : "";

  // Localized footer data
  const footerData = {
    brand: {
      tagline: footerTagline,
    },
    navigation: {
      title: language === "uz" ? "Tezkor havolalar" : "Quick Links",
      links: [
        {
          text: language === "uz" ? "Biz haqimizda" : "About Us",
          sectionId: "about",
        },
        {
          text: language === "uz" ? "Xodimlarimiz" : "Our Teachers",
          sectionId: "teachers",
        },
        {
          text: language === "uz" ? "Talabalar" : "Students",
          sectionId: "students",
        },
        {
          text: language === "uz" ? "Bog'lanish" : "Contact",
          sectionId: "contact",
        },
      ],
    },
    contact: {
      title: language === "uz" ? "Biz bilan bog'lanish" : "Contact Us",
      items: webData
        ? [
            {
              type: "phone",
              text: webData.main_phone?.phone ?? "",
            },
            { type: "email", text: webData.email ?? "" },
            {
              type: "address",
              text: getLocalizedText(
                webData.address_uz,
                webData.address_en,
                language
              ),
            },
          ]
        : [],
    },
    social: {
      title: language === "uz" ? "Ijtimoiy tarmoqlar" : "Social Media",
      links:
        webData?.web_socials?.map((item) => ({
          url: item.social.url,
          title: item.social.name,
          iconUrl: item.social.icon.url,
        })) || [],
    },
    copyright: {
      text:
        language === "uz"
          ? "Admire Learning Center. Barcha huquqlar himoyalangan."
          : "Admire Learning Center. All rights reserved.",
      legal: [
        {
          text: language === "uz" ? "Foydalanish shartlari" : "Terms of Use",
          url: "#",
        },
        {
          text: language === "uz" ? "Maxfiylik siyosati" : "Privacy Policy",
          url: "#",
        },
      ],
    },
  };

  // Smooth scroll function
  const scrollToSection = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className={`${styles.footer} ${styles[theme]}`}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          {/* Brand Section */}
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <img
                src="/logo.svg"
                alt="Admire Logo"
                className={styles.footerLogoImg}
              />
              <div className={styles.footerLogoText}>
                <div className={styles.footerLogoMain}>admire</div>
                <div className={styles.footerLogoSecondary}>
                  learning center
                </div>
              </div>
            </div>
            <p className={styles.brandTagline}>{footerData.brand.tagline}</p>
          </div>

          {/* Navigation Section */}
          <div className={styles.footerNav}>
            <h3 className={styles.footerHeading}>
              {footerData.navigation.title}
            </h3>
            <div className={styles.footerLinks}>
              {footerData.navigation.links.map((link, index) => (
                <button
                  key={index}
                  className={styles.footerLink}
                  onClick={(e) => scrollToSection(link.sectionId, e)}
                >
                  <span>{link.text}</span>
                  <ArrowIcon />
                </button>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className={styles.footerContact}>
            <h3 className={styles.footerHeading}>{footerData.contact.title}</h3>
            <div className={styles.contactItems}>
              {footerData.contact.items.map((item, index) => (
                <div key={index} className={styles.contactItem}>
                  {getContactIcon(item.type)}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Section */}
          <div className={styles.footerSupport}>
            <h3 className={styles.footerHeading}>{footerData.social.title}</h3>
            <div className={styles.footerSocial}>
              {footerData.social.links.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={styles.socialIcon}
                  title={social.title}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={social.iconUrl}
                    alt={social.title}
                    width={18}
                    height={18}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright & Legal */}
        <div className={styles.copyright}>
          <div className={styles.copyrightText}>
            © {currentYear} {footerData.copyright.text}
          </div>
          <div className={styles.legalLinks}>
            {footerData.copyright.legal.map((legal, index) => (
              <a key={index} href={legal.url}>
                {legal.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
