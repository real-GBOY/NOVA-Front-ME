/** @format */

import { AddLine } from "@/Icons";
import { useState } from "react";

type AddButtonProps = {
   onClick?: () => void;
   text?: string;
   backgroundColor?: string;
};

function AddButton({
   onClick,
   text = "Add Role",
   backgroundColor,
}: AddButtonProps) {
   return (
      <button
         onClick={onClick}
         className={`p-2 gap-1 flex justify-center items-center rounded-lg text-text-main bg-text-strong transition-colors whitespace-nowrap cursor-pointer ${
            backgroundColor ? "" : "bg-primary hover:bg-primary/90"
         }`}>
         <AddLine className="fill-background" />
         <p className="text-text-main">{text}</p>
      </button>
   );
}

export default AddButton;
