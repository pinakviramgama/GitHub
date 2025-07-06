import { useRoutes } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import CreateRepo from "./components/repo/CreateRepo";
import Pinned from "./components/repo/Pinned";
import Repo from "./components/repo/Repo";
import Starred from "./components/repo/Starred";
import Profile from "./components/user/Profile";

export default function ProjectRoutes() {
  const routes = useRoutes([
    { path: "/", element: <Dashboard /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    { path: "/profile", element: <Profile /> },
    { path: "/create", element: <CreateRepo /> },
    { path: "/repo/:id", element: <Repo /> }, // 👈 this is the dynamic route
    { path: "*", element: <div>404 Not Found</div> },
    { path: "/starred", element: <Starred /> },
    { path: "/pinned", element: <Pinned /> },

  ]);

  return routes;
}
