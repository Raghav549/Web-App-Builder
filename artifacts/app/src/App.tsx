import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import NotFound from "@/pages/not-found";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import HomePage from "@/pages/HomePage";
import AiProfilePage from "@/pages/AiProfilePage";
import AiSupportPage from "@/pages/AiSupportPage";
import PostPage from "@/pages/PostPage";
import UserProfilePage from "@/pages/UserProfilePage";
import ChatPage from "@/pages/ChatPage";
import EditProfilePage from "@/pages/EditProfilePage";
import CreatorDashboard from "@/pages/CreatorDashboard";
import CreatorAnalyticsPage from "@/pages/CreatorAnalyticsPage";
import SearchPage from "@/pages/SearchPage";
import StudioPage from "@/pages/StudioPage";
import NotificationsPage from "@/pages/NotificationsPage";
import MessagesListPage from "@/pages/MessagesListPage";
import ProfilePage from "@/pages/ProfilePage";
import CreateGroupPage from "@/pages/CreateGroupPage";

// Settings
import SettingsAccountPage from "@/pages/SettingsAccountPage";
import SettingsPrivacyPage from "@/pages/SettingsPrivacyPage";
import SettingsNotificationsPage from "@/pages/SettingsNotificationsPage";
import SettingsChatPage from "@/pages/SettingsChatPage";
import SettingsChatBackupPage from "@/pages/SettingsChatBackupPage";
import SettingsBlockedPage from "@/pages/SettingsBlockedPage";
import SettingsRestrictedPage from "@/pages/SettingsRestrictedPage";
import SettingsActivityPage from "@/pages/SettingsActivityPage";
import SettingsPostsReachPage from "@/pages/SettingsPostsReachPage";
import SettingsSecurityPage from "@/pages/SettingsSecurityPage";
import SettingsDataPage from "@/pages/SettingsDataPage";
import SettingsHelpPage from "@/pages/SettingsHelpPage";
import SettingsAccountDeletePage from "@/pages/SettingsAccountDeletePage";

// Creator
import CreatorProfilePage from "@/pages/CreatorProfilePage";
import CreatorPostsPage from "@/pages/CreatorPostsPage";
import CreatorStudioPage from "@/pages/CreatorStudioPage";
import CreatorVotesPage from "@/pages/CreatorVotesPage";
import CreatorSupportersPage from "@/pages/CreatorSupportersPage";
import CreatorCommentsPage from "@/pages/CreatorCommentsPage";
import CreatorSettingsPage from "@/pages/CreatorSettingsPage";


const queryClient = new QueryClient();

function PageLoading() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || !isAuthenticated) {
    return <PageLoading />;
  }

  return <Component />;
}

function CreatorRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/login");
      } else if (user?.role !== "creator") {
        setLocation("/home");
      }
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  if (isLoading || !isAuthenticated || user?.role !== "creator") {
    return <PageLoading />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      
      {/* Public Routes */}
      <Route path="/ai" component={AiProfilePage} />
      <Route path="/ai/support" component={AiSupportPage} />
      <Route path="/post/:id" component={PostPage} />
      <Route path="/u/:username" component={UserProfilePage} />
      
      {/* Protected Routes */}
      <Route path="/home">
        {() => <ProtectedRoute component={HomePage} />}
      </Route>
      <Route path="/search">
        {() => <ProtectedRoute component={SearchPage} />}
      </Route>
      <Route path="/studio">
        {() => <ProtectedRoute component={StudioPage} />}
      </Route>
      <Route path="/notifications">
        {() => <ProtectedRoute component={NotificationsPage} />}
      </Route>
      <Route path="/messages">
        {() => <ProtectedRoute component={MessagesListPage} />}
      </Route>
      <Route path="/messages/:id">
        {() => <ProtectedRoute component={ChatPage} />}
      </Route>
      <Route path="/groups/create">
        {() => <ProtectedRoute component={CreateGroupPage} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>
      <Route path="/profile/edit">
        {() => <ProtectedRoute component={EditProfilePage} />}
      </Route>
      <Route path="/settings/account">
        {() => <ProtectedRoute component={SettingsAccountPage} />}
      </Route>
      <Route path="/settings/privacy">
        {() => <ProtectedRoute component={SettingsPrivacyPage} />}
      </Route>
      <Route path="/settings/notifications">
        {() => <ProtectedRoute component={SettingsNotificationsPage} />}
      </Route>
      <Route path="/settings/chat">
        {() => <ProtectedRoute component={SettingsChatPage} />}
      </Route>
      <Route path="/settings/chat-backup">
        {() => <ProtectedRoute component={SettingsChatBackupPage} />}
      </Route>
      <Route path="/settings/blocked">
        {() => <ProtectedRoute component={SettingsBlockedPage} />}
      </Route>
      <Route path="/settings/restricted">
        {() => <ProtectedRoute component={SettingsRestrictedPage} />}
      </Route>
      <Route path="/settings/activity">
        {() => <ProtectedRoute component={SettingsActivityPage} />}
      </Route>
      <Route path="/settings/posts-reach">
        {() => <ProtectedRoute component={SettingsPostsReachPage} />}
      </Route>
      <Route path="/settings/security">
        {() => <ProtectedRoute component={SettingsSecurityPage} />}
      </Route>
      <Route path="/settings/data">
        {() => <ProtectedRoute component={SettingsDataPage} />}
      </Route>
      <Route path="/settings/help">
        {() => <ProtectedRoute component={SettingsHelpPage} />}
      </Route>
      <Route path="/settings/account/delete">
        {() => <ProtectedRoute component={SettingsAccountDeletePage} />}
      </Route>
      
      {/* Creator Routes */}
      <Route path="/creator">
        {() => <CreatorRoute component={CreatorDashboard} />}
      </Route>
      <Route path="/creator/profile">
        {() => <CreatorRoute component={CreatorProfilePage} />}
      </Route>
      <Route path="/creator/posts">
        {() => <CreatorRoute component={CreatorPostsPage} />}
      </Route>
      <Route path="/creator/studio">
        {() => <CreatorRoute component={CreatorStudioPage} />}
      </Route>
      <Route path="/creator/votes">
        {() => <CreatorRoute component={CreatorVotesPage} />}
      </Route>
      <Route path="/creator/analytics">
        {() => <CreatorRoute component={CreatorAnalyticsPage} />}
      </Route>
      <Route path="/creator/supporters">
        {() => <CreatorRoute component={CreatorSupportersPage} />}
      </Route>
      <Route path="/creator/comments">
        {() => <CreatorRoute component={CreatorCommentsPage} />}
      </Route>
      <Route path="/creator/settings">
        {() => <CreatorRoute component={CreatorSettingsPage} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
