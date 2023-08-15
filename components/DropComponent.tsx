import { useDrop } from "react-dnd";
import styles from "@/styles/projectPage.module.css";

const DropComponent = ({ children, onDrop, type }: any) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "item",
    drop: (item) => onDrop(item, type),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const outline = isOver ? "5px solid black" : "";

  return (
    <div key={type} className={styles.ongoging} style={{ outline }} ref={drop}>
      {children}
    </div>
  );
};

export default DropComponent;
