import React, { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import useWebDataStore from "@/store/useWebDataStore";
import { getLocalizedText } from "@/utils/localization";
import styles from "./Gallery.module.scss";
// Import Swiper and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";

// Simplified card renderer component
const GalleryCard = ({
  item,
  isPlaying,
  onTogglePlay,
  registerVideoRef,
}: {
  item: any;
  isPlaying: boolean;
  onTogglePlay: () => void;
  registerVideoRef: (
    id: string,
    ref: React.RefObject<HTMLVideoElement>
  ) => void;
}) => {
  const cardSizeClass = item.size === "1x2" ? styles.large : styles.small;
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (item.media.is_video) {
      registerVideoRef(item.id, videoRef as React.RefObject<HTMLVideoElement>);
    }
  }, [item.id, item.media.is_video, registerVideoRef]);

  const handleVideoEnd = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
  };

  return (
    <div className={`${styles.galleryCard} ${cardSizeClass}`}>
      {item.media.is_video ? (
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            src={item.media.url}
            className={styles.media}
            controls={isPlaying}
            loop
            onEnded={handleVideoEnd}
            onClick={onTogglePlay}
          />
          {!isPlaying && (
            <button
              className={styles.playButton}
              onClick={onTogglePlay}
              aria-label="Play video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <img src={item.media.url} alt="" className={styles.media} />
      )}
    </div>
  );
};

export default function Gallery() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const webData = useWebDataStore((state) => state.webData);
  const swiperRef = useRef<{ swiper: SwiperCore }>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const videoRefs = useRef(
    new Map<string, React.RefObject<HTMLVideoElement>>()
  );

  const registerVideoRef = (
    id: string,
    ref: React.RefObject<HTMLVideoElement>
  ) => {
    videoRefs.current.set(id, ref);
  };

  const handleTogglePlay = (id: string) => {
    const isCurrentlyPlaying = playingVideoId === id;
    const swiperInstance = swiperRef.current?.swiper;

    videoRefs.current.forEach((ref, videoId) => {
      if (id !== videoId) {
        ref.current?.pause();
      }
    });

    if (isCurrentlyPlaying) {
      setPlayingVideoId(null);
      swiperInstance?.autoplay.start();
      videoRefs.current.get(id)?.current?.pause();
    } else {
      setPlayingVideoId(id);
      swiperInstance?.autoplay.stop();
      const videoToPlay = videoRefs.current.get(id);
      videoToPlay?.current?.play();
    }
  };

  const galleryTitle = language === "uz" ? "Galereya" : "Gallery";
  const sectionDescription = webData
    ? getLocalizedText(webData.gallery_p_uz, webData.gallery_p_en, language)
    : "";

  // Gallery media items from webData
  const galleryItems = webData?.web_media || [];

  // Process gallery items to group 1x1s
  const processedGalleryItems: any[] = [];
  if (galleryItems.length > 0) {
    for (let i = 0; i < galleryItems.length; i++) {
      const currentItem = galleryItems[i];
      if (
        currentItem.size === "1x1" &&
        i + 1 < galleryItems.length &&
        galleryItems[i + 1].size === "1x1"
      ) {
        processedGalleryItems.push([currentItem, galleryItems[i + 1]]);
        i++; // skip next item
      } else {
        processedGalleryItems.push(currentItem);
      }
    }
  }

  return (
    <section id="gallery" className={`${styles.gallery} ${styles[theme]}`}>
      <div className={styles.container}>
        <div className={styles.galleryHeader}>
          <h2 className={styles.sectionTitle}>{galleryTitle}</h2>
          <p className={styles.sectionDescription}>{sectionDescription}</p>
        </div>
      </div>

      <div className={styles.gallerySwiper}>
        <div className={styles.swiperWrapper}>
          <Swiper
            ref={swiperRef}
            modules={[A11y, Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            loop={true}
            centeredSlides={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={1000}
            watchSlidesProgress={true}
            allowTouchMove={true}
            autoHeight={true}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className={styles.swiper}
          >
            {processedGalleryItems.map((item: any) => {
              const key = Array.isArray(item)
                ? `${item[0].id}-${item[1].id}`
                : item.id;
              return (
                <SwiperSlide key={key}>
                  {Array.isArray(item) ? (
                    <div className={styles.galleryColumn}>
                      <GalleryCard
                        item={item[0]}
                        isPlaying={playingVideoId === item[0].id}
                        onTogglePlay={() => handleTogglePlay(item[0].id)}
                        registerVideoRef={registerVideoRef}
                      />
                      <GalleryCard
                        item={item[1]}
                        isPlaying={playingVideoId === item[1].id}
                        onTogglePlay={() => handleTogglePlay(item[1].id)}
                        registerVideoRef={registerVideoRef}
                      />
                    </div>
                  ) : (
                    <GalleryCard
                      item={item}
                      isPlaying={playingVideoId === item.id}
                      onTogglePlay={() => handleTogglePlay(item.id)}
                      registerVideoRef={registerVideoRef}
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
