
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/header";
import { MobileProvider } from "@/hooks/use-mobile";

export default function MainLayout() {
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate("/login");
  };
  
  const handleGetStartedClick = () => {
    navigate("/register");
  };
  
  return (
    <MobileProvider>
      <div className="min-h-screen flex flex-col">
        <Header 
          onLoginClick={handleLoginClick}
          onGetStartedClick={handleGetStartedClick}
        />
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </MobileProvider>
  );
}
