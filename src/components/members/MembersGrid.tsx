/** @format */

import MemberCard from "@/components/members/MemberCard";
import { Member } from "@/components/members/MembersTable";

interface MembersGridProps {
   data: Member[];
   globalFilter?: string;
   onViewProfile: (member: Member) => void;
   onSendMessage: (member: Member) => void;
   onOverridePermissions: (member: Member) => void;
   onResetPermissions: (member: Member) => void;
   onDeactivate: (member: Member) => void;
   onResendInvite?: (member: Member) => void;
}

function MembersGrid({
   data,
   globalFilter: _globalFilter = "",
   onViewProfile,
   onSendMessage,
   onOverridePermissions,
   onResetPermissions,
   onDeactivate,
   onResendInvite,
}: MembersGridProps) {
   const filteredMembers = data;

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         {filteredMembers.map((member) => {
            const canResendInvite = member.status === "Invited";
            const canDeactivate = member.status === "Active";

            return (
               <MemberCard
                  key={member.id}
                  name={member.name}
                  email={member.email}
                  avatar={member.avatar}
                  avatarBg={member.avatarBg}
                  jobTitle={member.jobTitle}
                  contact={member.contact}
                  joinedAt={member.joinedAt}
                  isPermissionOverride={member.isPermissionOverride}
                  role={member.role}
                  roleIcon={member.roleIcon}
                  status={member.status === "Active" ? "active" : "inactive"}
                  onViewProfile={() => onViewProfile(member)}
                  onSendMessage={() => onSendMessage(member)}
                  onResendInvite={
                     canResendInvite && onResendInvite
                        ? () => onResendInvite(member)
                        : undefined
                  }
                  onOverridePermissions={() => onOverridePermissions(member)}
                  onResetPermissions={() => onResetPermissions(member)}
                  onDeactivate={
                     canDeactivate ? () => onDeactivate(member) : undefined
                  }
               />
            );
         })}
      </div>
   );
}

export default MembersGrid;
