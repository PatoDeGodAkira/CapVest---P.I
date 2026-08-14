import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import CapyAssistant from "./components/CapyAssistant/CapyAssistant";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <CapyAssistant />
    </BrowserRouter>
  );
}

export default App;