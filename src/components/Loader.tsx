import React from "react";
import Image from "next/image";
import styles from "./Loader.module.scss";

const Loader = () => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContainer}>
        <Image
          src="/logo.svg"
          alt="Loading..."
          width={150}
          height={150}
          className={styles.loaderIcon}
        />
      </div>
    </div>
  );
};

export default Loader;
