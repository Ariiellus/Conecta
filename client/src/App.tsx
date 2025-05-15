import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import History from "./pages/History";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";
import { useTransactions } from "./hooks/useTransactions";

function Router() {
  const [location] = useLocation();
  const showSidebar = location !== "/" && location !== "/login";
  const { data: transactions = [] } = useTransactions();
  
  return (
    <>
      {showSidebar ? (
        <div className="flex h-screen bg-gray-50">
          <Sidebar transactions={transactions} />
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/dashboard" component={Home} />
              <Route path="/portfolio" component={Portfolio} />
              <Route path="/history" component={History} />
              <Route path="/contacts" component={Contacts} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      ) : (
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      )}
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
