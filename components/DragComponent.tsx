import React from "react";
import { useDrag } from "react-dnd";

const DragComponent = ({ children, id, userParam }: any) => {
  const [, drag] = useDrag(() => ({
    type: "item",
    item: { id, userParam },
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
