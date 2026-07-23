/** @format */

import { ReactNode } from "react";
import MainSidebar from "./MainSidebar";
import MembersContent from "./members/MembersContent";

type MainProps = {
   children?: ReactNode;
};

function Main({ children }: MainProps) {
   return (
      <div className="flex w-full h-full bg-background ">
         <div className="p-2">
            <MainSidebar />
         </div>
         {children ?? <MembersContent />}
      </div>
   );
}

export default Main;
