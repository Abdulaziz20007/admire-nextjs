import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import styles from "./Gallery.module.scss";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Gallery item interface - supports both images and videos
interface GalleryItem {
  id: number;
  type: "image" | "video";
  src: string;
  alt: string;
  title: string;
  category: string;
  size: "1x1" | "1x2"; // Grid size: 1x1 (standard) or 1x2 (tall)
  poster?: string; // Poster image for videos
  duration?: string; // Video duration for display
}

// Gallery data with mixed content (images and videos) and proper sizing
const galleryItems: GalleryItem[] = [
  {
    id: 1,
    type: "image",
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&crop=center",
    alt: "Students studying together in modern classroom",
    title: "Collaborative Learning",
    category: "classroom",
    size: "1x1",
  },
  {
    id: 2,
    type: "image",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    alt: "Students working on laptops in computer lab",
    title: "Digital Learning",
    category: "technology",
    size: "1x1",
  },
  {
    id: 3,
    type: "image",
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&crop=center",
    alt: "Library with students reading and studying",
    title: "Study Environment",
    category: "library",
    size: "1x1",
  },
  {
    id: 4,
    type: "image",
    src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop&crop=center",
    alt: "Students presenting project to class",
    title: "Student Presentations",
    category: "presentation",
    size: "1x1",
  },
  {
    id: 5,
    type: "image",
    src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&h=600&fit=crop&crop=center",
    alt: "Teacher explaining concepts on whiteboard",
    title: "Interactive Teaching",
    category: "teaching",
    size: "1x2",
  },
  {
    id: 6,
    type: "image",
    src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop&crop=center",
    alt: "Modern school building exterior",
    title: "Campus Facilities",
    category: "campus",
    size: "1x1",
  },
  {
    id: 7,
    type: "image",
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&crop=center",
    alt: "Students in science laboratory conducting experiments",
    title: "Science Laboratory",
    category: "laboratory",
    size: "1x1",
  },
  {
    id: 8,
    type: "image",
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&crop=center",
    alt: "Students taking notes during lecture",
    title: "Lecture Hall",
    category: "lecture",
    size: "1x1",
  },
  {
    id: 9,
    type: "image",
    src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center",
    alt: "Students working in group discussion",
    title: "Group Study",
    category: "collaboration",
    size: "1x1",
  },
  {
    id: 10,
    type: "image",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    alt: "Students in computer lab",
    title: "Technology Lab",
    category: "technology",
    size: "1x1",
  },
  {
    id: 11,
    type: "image",
    src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=300&fit=crop&crop=center",
    alt: "Students in chemistry lab",
    title: "Chemistry Lab",
    category: "science",
    size: "1x1",
  },
  {
    id: 12,
    type: "image",
    src: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop&crop=center",
    alt: "Students in art class",
    title: "Creative Arts",
    category: "arts",
    size: "1x1",
  },
  {
    id: 13,
    type: "image",
    src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop&crop=center",
    alt: "Students in music class",
    title: "Music Education",
    category: "music",
    size: "1x1",
  },
  {
    id: 14,
    type: "image",
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
    alt: "Students playing sports",
    title: "Physical Education",
    category: "sports",
    size: "1x1",
  },
  {
    id: 15,
    type: "image",
    src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=600&fit=crop&crop=center",
    alt: "Students in debate competition",
    title: "Debate Club",
    category: "debate",
    size: "1x2",
  },
  {
    id: 16,
    type: "image",
    src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop&crop=center",
    alt: "Students in robotics club",
    title: "Robotics Club",
    category: "robotics",
    size: "1x1",
  },
  {
    id: 17,
    type: "image",
    src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
    alt: "Students in cooking class",
    title: "Culinary Arts",
    category: "cooking",
    size: "1x1",
  },
  {
    id: 18,
    type: "image",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center",
    alt: "Students in drama class",
    title: "Drama Club",
    category: "drama",
    size: "1x1",
  },
  {
    id: 19,
    type: "image",
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    alt: "Students in computer programming",
    title: "Programming",
    category: "coding",
    size: "1x1",
  },
  {
    id: 20,
    type: "image",
    src: "https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=400&h=600&fit=crop&crop=center",
    alt: "Students in mathematics competition",
    title: "Math Olympiad",
    category: "mathematics",
    size: "1x2",
  },
  {
    id: 21,
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&crop=center",
    alt: "Educational video about collaborative learning",
    title: "Learning Together",
    category: "education",
    size: "1x1",
    duration: "2:30",
  },
  {
    id: 22,
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster:
      "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=600&fit=crop&crop=center",
    alt: "Science experiment demonstration video",
    title: "Science in Action",
    category: "science",
    size: "1x2",
    duration: "3:45",
  },
  {
    id: 23,
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster:
      "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop&crop=center",
    alt: "Art class creative process video",
    title: "Creative Process",
    category: "arts",
    size: "1x1",
    duration: "1:45",
  },
  {
    id: 24,
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=300&fit=crop&crop=center",
    alt: "Music education and performance video",
    title: "Musical Excellence",
    category: "music",
    size: "1x1",
    duration: "2:15",
  },
  {
    id: 25,
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&crop=center",
    alt: "Physical education and sports activities video",
    title: "Active Learning",
    category: "sports",
    size: "1x2",
    duration: "4:20",
  },
  {
    id: 26,
    type: "video",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster:
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=300&fit=crop&crop=center",
    alt: "Student debate and discussion video",
    title: "Critical Thinking",
    category: "debate",
    size: "1x1",
    duration: "3:10",
  },
];

// Gallery Item Component - supports both images and videos
const GalleryItemCard = ({ item }: { item: GalleryItem }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault();
    const video = e.currentTarget;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }

    // Show play/pause icon briefly
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 1000);
  };

  return (
    <div className={`${styles.galleryItemCard} ${styles[`size-${item.size}`]}`}>
      <div className={styles.itemWrapper}>
        {item.type === "image" ? (
          <img
            src={item.src}
            alt={item.alt}
            title={item.title}
            className={`${styles.galleryImage} ${
              isLoaded ? styles.loaded : ""
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.videoContainer}>
            <video
              src={item.src}
              poster={item.poster}
              className={`${styles.galleryVideo} ${
                isLoaded ? styles.loaded : ""
              }`}
              onLoadedData={() => setIsLoaded(true)}
              onClick={handleVideoClick}
              muted
              loop
              playsInline
              controls={false}
              preload="metadata"
            />
            {/* Play/Pause Icon Overlay */}
            {showPlayIcon && (
              <div className={styles.playIconOverlay}>
                <div className={styles.playIcon}>
                  {isPlaying ? (
                    // Pause icon
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="6"
                        y="4"
                        width="4"
                        height="16"
                        fill="currentColor"
                      />
                      <rect
                        x="14"
                        y="4"
                        width="4"
                        height="16"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    // Play icon
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <polygon points="5,3 19,12 5,21" fill="currentColor" />
                    </svg>
                  )}
                </div>
              </div>
            )}
            {/* Duration badge for videos */}
            {item.duration && (
              <div className={styles.durationBadge}>{item.duration}</div>
            )}
          </div>
        )}
        <div className={styles.itemOverlay}>
          <div className={styles.itemInfo}>
            <h4 className={styles.itemTitle}>{item.title}</h4>
            <span className={styles.itemCategory}>{item.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to organize items into columns for column-by-column navigation
const organizeItemsIntoColumns = (items: GalleryItem[]): GalleryItem[][] => {
  const columns: GalleryItem[][] = [];
  let currentColumnIndex = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Initialize column if it doesn't exist
    if (!columns[currentColumnIndex]) {
      columns[currentColumnIndex] = [];
    }

    // Add item to current column
    columns[currentColumnIndex].push(item);

    // If current column has 2 items (for 2-row structure), move to next column
    // Exception: if item is 1x2 (spans 2 rows), it fills the entire column
    if (item.size === "1x2" || columns[currentColumnIndex].length === 2) {
      currentColumnIndex++;
    }
  }

  return columns;
};

export default function Gallery() {
  const { theme } = useTheme();
  const swiperRef = useRef<any>(null);

  // Organize items into columns for column-by-column navigation
  const itemColumns = organizeItemsIntoColumns(galleryItems);

  // Optimized infinite loop management - minimal intervention approach
  useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) return;

    // Single initialization without aggressive rebuilding
    const timer = setTimeout(() => {
      // Only update if swiper is ready, avoid loop recreation
      if (swiper.initialized) {
        swiper.update();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="gallery" className={`${styles.gallery} ${styles[theme]}`}>
      <div className={styles.galleryHeader}>
        <h2 className={styles.sectionTitle}>Bizning Galereya</h2>
        <p className={styles.sectionDescription}>
          Ta'lim jarayoni, talabalar hayoti va muvaffaqiyatlarimizdan lavhalar.
          Admire o'quv markazidagi faol ta'lim muhiti va yutuqlarimiz bilan
          tanishing.
        </p>
      </div>

      <div className={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={4.5}
          slidesPerGroup={1}
          loop={true}
          loopAdditionalSlides={4}
          watchSlidesProgress={true}
          centeredSlides={false}
          updateOnWindowResize={true}
          navigation={{
            nextEl: `.${styles.swiperButtonNext}`,
            prevEl: `.${styles.swiperButtonPrev}`,
            enabled: true,
          }}
          breakpoints={{
            320: {
              slidesPerView: 2.5,
              slidesPerGroup: 1,
              spaceBetween: 12,
              loopAdditionalSlides: 3,
            },
            768: {
              slidesPerView: 3.5,
              slidesPerGroup: 1,
              spaceBetween: 16,
              loopAdditionalSlides: 4,
            },
            1024: {
              slidesPerView: 4.5,
              slidesPerGroup: 1,
              spaceBetween: 20,
              loopAdditionalSlides: 4,
            },
            1920: {
              slidesPerView: 4.5,
              slidesPerGroup: 1,
              spaceBetween: 24,
              loopAdditionalSlides: 4,
            },
          }}
          allowTouchMove={true}
          speed={300}
          grabCursor={true}
          resistance={true}
          resistanceRatio={0.85}
          className={styles.gallerySwiper}
        >
          {itemColumns.map(
            (columnItems: GalleryItem[], columnIndex: number) => (
              <SwiperSlide key={columnIndex} className={styles.swiperSlide}>
                <div className={styles.galleryColumn}>
                  {columnItems.map((item: GalleryItem) => (
                    <GalleryItemCard key={item.id} item={item} />
                  ))}
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>

        {/* Custom Navigation */}
        <div className={styles.swiperButtonPrev}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className={styles.swiperButtonNext}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
