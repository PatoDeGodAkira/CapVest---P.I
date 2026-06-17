import styles from "./DashboardCard.module.css";

export default function DashboardCard({
  title,
  children
}) {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>

      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

<button className="btn btn-primary">
  Teste DaisyUI
</button>