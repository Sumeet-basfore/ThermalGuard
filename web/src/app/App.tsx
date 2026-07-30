import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { TelemetryProvider } from "./context/TelemetryContext";
import { router } from "./routes";

export default function App() {
  return (
    <TelemetryProvider>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <RouterProvider router={router} />
    </TelemetryProvider>
  );
}
