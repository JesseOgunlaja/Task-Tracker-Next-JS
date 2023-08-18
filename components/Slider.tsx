import styles from "@/styles/projects.module.css";

const Slider = ({ completedTasks, totalTasks }: any) => {
  const noTasks = completedTasks === 0;
  const completionPercentage = noTasks
    ? 0
    : (completedTasks / totalTasks) * 100;
  const isComplete = completionPercentage === 100 && !noTasks;
  const style = {
    background: isComplete
      ? "green"
      : completionPercentage >= 50
      ? "yellow"
      : "red",
    width: `${isComplete || noTasks ? 100 : completionPercentage}%`,
  };

  const containerStyle = {
    background:
      completionPercentage === 100 && totalTasks !== 0
        ? "rgba(0,128,0,0.25)"
        : completionPercentage >= 50
        ? "rgba(255,255,0,0.5)"
        : "rgba(255,0,0,0.25)",
  };

  return (
    <div style={containerStyle} className={styles.slidercontainer}>
      <div className={styles.sliderfill} style={style}></div>
    </div>
  );
};

export default Slider;
