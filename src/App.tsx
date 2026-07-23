/** @format */
import AppRoutes from "./routes/AppRoutes";
import { SocketProvider } from "./services/socket/SocketProvider";
import LanguageSwitchLoader from "./components/LanguageSwitchLoader";
import PushNotificationsBootstrap from "./services/push/PushNotificationsBootstrap";
import { PdfPreviewProvider } from "./context/PdfPreviewContext";
import { PermissionProvider } from "./contexts/PermissionContext";

function App() {
	return (
		<SocketProvider>
			<PermissionProvider>
				<PdfPreviewProvider>
					<PushNotificationsBootstrap />
					<LanguageSwitchLoader />
					<AppRoutes />
				</PdfPreviewProvider>
			</PermissionProvider>
		</SocketProvider>
	);
}
export default App;
