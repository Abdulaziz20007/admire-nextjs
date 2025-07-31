import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./Contact.module.scss";

interface FormData {
  name: string;
  phone: string;
  message: string;
}

type SubmitStatus = null | "sending" | "success";

export default function Contact() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const webData = useWebDataStore((state) => state.webData);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [showAddress, setShowAddress] = useState(false);

  // Localized text data
  const contactData = {
    title: language === "uz" ? "Bizning Manzil" : "Our Location",
    contactTitle: language === "uz" ? "Biz bilan bog'lanish" : "Contact Us",
    addressTitle: language === "uz" ? "Manzilimiz" : "Our Address",
    nameLabel: language === "uz" ? "Ismingiz" : "Your Name",
    namePlaceholder:
      language === "uz" ? "Ismingizni kiriting" : "Enter your name",
    phoneLabel: language === "uz" ? "Telefon raqamingiz" : "Your Phone Number",
    phonePlaceholder: "+998 XX XXX XX XX",
    messageLabel: language === "uz" ? "Xabaringiz" : "Your Message",
    messagePlaceholder:
      language === "uz" ? "Xabaringizni kiriting" : "Enter your message",
    submit: language === "uz" ? "Xabar yuborish" : "Send Message",
    sending: language === "uz" ? "Yuborilmoqda..." : "Sending...",
    formSuccess:
      language === "uz"
        ? "Rahmat! Tez orada siz bilan bog'lanamiz."
        : "Thank you! We'll contact you soon.",
    address: language === "uz" ? "Manzil" : "Address",
    phone: language === "uz" ? "Telefon" : "Phone",
    landmark: language === "uz" ? "Mo'ljal" : "Landmark",
    workHours: language === "uz" ? "Ish vaqti" : "Working Hours",
  };

  // Get address and other contact details from webData
  const address = webData
    ? getLocalizedText(webData.address_uz, webData.address_en, language)
    : "";

  const landmark = webData
    ? getLocalizedText(webData.orientation_uz, webData.orientation_en, language)
    : "";

  const workTime = webData?.work_time ?? "";
  const workTimeSunday = webData?.work_time_sunday ?? "";

  const mainPhone = webData?.main_phone?.phone ?? "";
  const additionalPhones =
    webData?.web_phones
      ?.map((item) => item.phone.phone)
      .filter((phone) => phone !== mainPhone) || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitStatus("sending");

    setTimeout(() => {
      setSubmitStatus("success");
      // Reset form after successful submission
      setFormData({
        name: "",
        phone: "",
        message: "",
      });

      // Reset status after showing success message
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1000);
  };

  const toggleView = (isAddress: boolean) => {
    setShowAddress(isAddress);
  };

  return (
    <section
      id="contact"
      className={`${styles.locationSection} ${styles[theme]}`}
    >
      <div className={`${styles.container} ${styles.wideContainer}`}>
        <div className={styles.locationHeader}>
          <h2 className={styles.sectionTitle}>{contactData.title}</h2>
        </div>

        <div className={styles.locationContentWrapper}>
          <div className={styles.locationMapContainer}>
            <div className={styles.locationMap}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d375.9307112252456!2d71.13759799267737!3d40.5619294659258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bae3c348b0a535%3A0x9c9f88a453624e7!2sAdmire!5e0!3m2!1sen!2sus!4v1713960887983!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Admire Location"
              />
            </div>
          </div>

          <div className={styles.locationContact}>
            <div className={styles.cardToggleButtons}>
              <button
                className={`${styles.toggleBtn} ${
                  !showAddress ? styles.active : ""
                }`}
                onClick={() => toggleView(false)}
              >
                {contactData.contactTitle}
              </button>
              <button
                className={`${styles.toggleBtn} ${
                  showAddress ? styles.active : ""
                }`}
                onClick={() => toggleView(true)}
              >
                {contactData.addressTitle}
              </button>
            </div>

            <div
              className={`${styles.flipCardContainer} ${
                showAddress ? styles.showAddress : ""
              }`}
            >
              <div className={styles.flipCard}>
                <div className={styles.flipCardFront}>
                  <div className={styles.contactFormContainer}>
                    <h3 className={styles.contactTitle}>
                      {contactData.contactTitle}
                    </h3>

                    {submitStatus === "success" ? (
                      <div className={styles.formSuccessMessage}>
                        {contactData.formSuccess}
                      </div>
                    ) : (
                      <form
                        onSubmit={handleSubmit}
                        className={styles.contactForm}
                      >
                        <div className={styles.formGroup}>
                          <label htmlFor="name">{contactData.nameLabel}</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder={contactData.namePlaceholder}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="phone">
                            {contactData.phoneLabel}
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder={contactData.phonePlaceholder}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label htmlFor="message">
                            {contactData.messageLabel}
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder={contactData.messagePlaceholder}
                            rows={4}
                          />
                        </div>

                        <button
                          type="submit"
                          className={styles.contactSubmitBtn}
                          disabled={submitStatus === "sending"}
                        >
                          {submitStatus === "sending"
                            ? contactData.sending
                            : contactData.submit}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className={styles.flipCardBack}>
                  <div className={styles.addressContainer}>
                    <div className={styles.addressImage}>
                      <img
                        src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"
                        alt="Admire Learning Center"
                      />
                    </div>

                    <div className={styles.addressDetails}>
                      <div className={styles.addressItem}>
                        <h4>{contactData.address}</h4>
                        <p>{address}</p>
                      </div>

                      <div className={styles.addressItem}>
                        <h4>{contactData.landmark}</h4>
                        <p>{landmark}</p>
                      </div>

                      <div className={styles.addressItem}>
                        <h4>{contactData.workHours}</h4>
                        <p>{workTime}</p>
                        <p>{workTimeSunday}</p>
                      </div>

                      <div className={styles.addressItem}>
                        <h4>{contactData.phone}</h4>
                        <p>{mainPhone}</p>
                        {additionalPhones.map((phone, index) => (
                          <p key={index}>{phone}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
