import React, { ReactNode } from "react";
import { useDrag } from "react-dnd";

const DragComponent = ({
  children,
  id,
}: {
  children: ReactNode;
  id: string | number;
}) => {
  const [, drag] = useDrag(() => ({
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
