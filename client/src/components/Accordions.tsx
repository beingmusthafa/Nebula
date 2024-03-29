import React, { useState } from "react";
import { motion, useAnimate } from "framer-motion";

export interface AccordionProps {
  title: JSX.Element | string;
  content: JSX.Element[] | string;
}
const Accordion: React.FC<AccordionProps> = ({ title, content }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 flex flex-col items-center border-slate-400 h-fit w-11/12 md:w-2/3 p-2">
      <div className="flex justify-between w-full items-center font-semibold">
        {title}
        <button onClick={() => setOpen(!open)}>
          {open ? (
            <i className="text-xl bx bx-chevron-up-square"></i>
          ) : (
            <i className="text-xl bx bx-chevron-down-square"></i>
          )}
        </button>
      </div>
      {open && content}
    </div>
  );
};
interface Props {
  data: { title: string | JSX.Element; content: JSX.Element[] | string }[];
}

const Accordions: React.FC<Props> = ({ data }) => {
  return (
    <>
      <div className="flex flex-col px-10 w-full mx-auto items-center text-base mb-24">
        {data.map((item, i) => (
          <Accordion title={item.title} content={item.content} key={i} />
        ))}
      </div>
    </>
  );
};

export default Accordions;
