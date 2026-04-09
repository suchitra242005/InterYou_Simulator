
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { Toaster } from "./app/components/ui/sonner.tsx";

  window.onerror = function(msg, url, line, col, error) {
    const msgStr = msg.toString();
    if (msgStr.includes("clipboard") || 
        msgStr.includes("image input") ||
        msgStr.includes("model does not support") ||
        (error && error.message && (error.message.includes("clipboard") || error.message.includes("image input") || error.message.includes("model does not support")))) {
      console.warn("External extension error suppressed:", msgStr);
      return true;
    }
    return false;
  };

  window.onunhandledrejection = function(event) {
    const reason = event.reason;
    if (reason && (
        reason.message?.includes("clipboard") || 
        reason.message?.includes("image input") ||
        reason.message?.includes("model does not support") ||
        reason.toString().includes("clipboard") ||
        reason.toString().includes("image input")
    )) {
      console.warn("External extension promise rejected, suppressed:", reason);
      event.preventDefault();
    }
  };

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster position="top-center" />
    </>
  );
  