/** @format */

import {
	usePermissionsDictionary,
	useListPermissions,
} from "./permission.queries";

export const usePermission = () => {
	return {
		usePermissionsDictionary,
		useListPermissions,
	};
};

// Export individual hooks for direct imports
export {
	usePermissionsDictionary,
	useListPermissions,
} from "./permission.queries";
