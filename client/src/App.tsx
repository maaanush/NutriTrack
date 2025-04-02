import { Switch, Route } from "wouter";
import Home from "./pages/home";
import History from "./pages/history";
import Profile from "./pages/profile";
import MainLayout from "./layouts/main-layout";
import NotFound from "./pages/not-found";
import { useAuth, AuthProvider } from "./hooks/use-auth";

function Router() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Simple login form as the app's entry point
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
        <LoginForm />
      </div>
    );
  }
  
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/history" component={History} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function LoginForm() {
  const { login } = useAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    
    login(username, password);
  };
  
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-primary">Calorie Tracker</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="mb-2 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue="demo"
            className="w-full rounded-lg border border-neutral-200 p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            defaultValue="password"
            className="w-full rounded-lg border border-neutral-200 p-2 focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full rounded-lg bg-primary py-2 text-white transition duration-200 hover:bg-primary-dark"
        >
          Log In
        </button>
      </form>
      
      <p className="mt-4 text-center text-xs text-neutral-400">
        Demo credentials are pre-filled for testing purposes.
      </p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
