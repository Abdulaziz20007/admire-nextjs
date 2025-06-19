import React, { useEffect, useRef, useState, memo } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./GlobalBackground.module.scss";

interface Dot {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

const GlobalBackground: React.FC = memo(() => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const dotsCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const dotsRef = useRef<Dot[]>([]);
  const starsRef = useRef<Star[]>([]);

  // Get current theme for particle colors
  const getCurrentTheme = () => {
    return document.documentElement.getAttribute("data-theme") || "light";
  };

  // Get theme-aware particle colors
  const getParticleColors = () => {
    const theme = getCurrentTheme();
    if (theme === "dark") {
      return {
        primary: "255, 255, 255", // White particles for dark background
        glow: "255, 255, 255",
      };
    } else {
      return {
        primary: "0, 0, 0", // Black particles for light background
        glow: "0, 0, 0",
      };
    }
  };

  // Initialize dots with performance considerations
  const initializeDots = (width: number, height: number) => {
    const dots: Dot[] = [];
    // Adaptive dot count based on screen size and device capabilities
    const isMobile = width <= 768;
    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const baseCount = isMobile ? 20000 : isLowEnd ? 18000 : 15000;
    const dotCount = Math.min(
      Math.floor((width * height) / baseCount),
      isMobile ? 50 : 100
    );

    for (let i = 0; i < dotCount; i++) {
      dots.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }

    dotsRef.current = dots;
  };

  // Initialize stars with performance considerations
  const initializeStars = (width: number, height: number) => {
    const stars: Star[] = [];
    // Adaptive star count based on screen size and device capabilities
    const isMobile = width <= 768;
    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const baseCount = isMobile ? 25000 : isLowEnd ? 22000 : 20000;
    const starCount = Math.min(
      Math.floor((width * height) / baseCount),
      isMobile ? 30 : 60
    );

    for (let i = 0; i < starCount; i++) {
      stars.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    starsRef.current = stars;
  };

  // Animate dots
  const animateDots = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = getParticleColors();

    dotsRef.current.forEach((dot) => {
      // Update position
      dot.x += dot.speedX;
      dot.y += dot.speedY;

      // Wrap around edges
      if (dot.x < 0) dot.x = canvas.width;
      if (dot.x > canvas.width) dot.x = 0;
      if (dot.y < 0) dot.y = canvas.height;
      if (dot.y > canvas.height) dot.y = 0;

      // Draw dot with theme-aware color
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors.primary}, ${dot.opacity})`;
      ctx.fill();
    });
  };

  // Animate stars
  const animateStars = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = getParticleColors();

    starsRef.current.forEach((star) => {
      // Update twinkle effect
      star.twinklePhase += star.twinkleSpeed;
      const twinkleOpacity =
        star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase));

      // Draw star with theme-aware color
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colors.primary}, ${twinkleOpacity})`;
      ctx.fill();

      // Add star glow effect with theme-aware color
      if (twinkleOpacity > 0.6) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.glow}, ${(twinkleOpacity - 0.6) * 0.2})`;
        ctx.fill();
      }
    });
  };

  // Animation loop with performance optimizations
  const animate = () => {
    if (
      !isVisible ||
      !dotsCanvasRef.current ||
      !starsCanvasRef.current ||
      prefersReducedMotion
    )
      return;

    const dotsCanvas = dotsCanvasRef.current;
    const starsCanvas = starsCanvasRef.current;
    const dotsCtx = dotsCanvas.getContext("2d");
    const starsCtx = starsCanvas.getContext("2d");

    if (dotsCtx && starsCtx) {
      // Performance optimization: reduce frame rate on mobile devices
      const isMobile = window.innerWidth <= 768;
      const frameSkip = isMobile ? 2 : 1;

      if (!isMobile || Date.now() % frameSkip === 0) {
        animateDots(dotsCanvas, dotsCtx);
        animateStars(starsCanvas, starsCtx);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle resize
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setDimensions({ width, height });

    if (dotsCanvasRef.current && starsCanvasRef.current) {
      // Update canvas dimensions
      [dotsCanvasRef.current, starsCanvasRef.current].forEach((canvas) => {
        canvas.width = width;
        canvas.height = height;
      });

      // Reinitialize particles
      initializeDots(width, height);
      initializeStars(width, height);
    }
  };

  // Intersection Observer for performance optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Initialize animations ready state
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle theme transitions
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [theme]);

  // Initialize and handle resize
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Start/stop animation based on visibility
  useEffect(() => {
    if (isVisible) {
      animate();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, dimensions]);

  const animationClass = isVisible || animationsReady ? styles.animated : "";
  const transitionClass = isTransitioning ? styles.transitioning : "";

  return (
    <div
      ref={containerRef}
      className={`${styles.globalBackground} ${styles[theme]} ${animationClass} ${transitionClass}`}
    >
      {/* Dot pattern background */}
      <div
        className={`${styles.dotContainer} ${styles[theme]} ${animationClass} ${transitionClass}`}
      />

      {/* Animated canvas particles */}
      <canvas
        ref={dotsCanvasRef}
        className={styles.dotsCanvas}
        width={dimensions.width}
        height={dimensions.height}
      />
      <canvas
        ref={starsCanvasRef}
        className={styles.starsCanvas}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
});

GlobalBackground.displayName = "GlobalBackground";

export default GlobalBackground;
