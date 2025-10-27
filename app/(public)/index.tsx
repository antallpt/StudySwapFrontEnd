import { Redirect } from "expo-router";
import LoadingScreen from "../../components/LoadingScreen";
import SignInPage from "../../components/SignInPage";
import { useAuth } from "../../contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <SignInPage />;
}
