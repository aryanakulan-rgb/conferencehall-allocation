import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { BackButton } from '@/components/navigation/BackButton';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <BackButton className="mx-auto" />
      </div>
    </div>
  );
};

export default NotFound;
