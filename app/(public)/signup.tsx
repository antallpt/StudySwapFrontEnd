import { Redirect } from "expo-router";
import LoadingScreen from "../../components/LoadingScreen";
import SignUpPage from "../../components/SignUpPage";
import { useAuth } from "../../contexts/AuthContext";

export default function SignUp() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <SignUpPage />;
}
