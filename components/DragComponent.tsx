import React from "react";
import { useDrag } from "react-dnd";

const DragComponent = ({ children, id }: any) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "item",
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div key={id} ref={drag}>
      {children}
    </div>
  );
};

export default DragComponent;
