import styles from "./Calendar.module.css";

export default function Calendar() {
  return (
    <div>
      <div className={styles.grid}>
        {Array.from(
          { length: 30 },
          (_, i) => (
            <div
              key={i}
              className={
                i === 7 ||
                i === 14 ||
                i === 21 ||
                i === 28
                  ? styles.event
                  : styles.day
              }
            >
              {i + 1}
            </div>
          )
        )}
      </div>
    </div>
  );
}