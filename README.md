# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




Here’s a clean **feature-based folder structure** for an **enterprise React app** with **Auth + Login**, using:

* **React Router**
* **Zustand** (auth state)
* **Axios** (API + interceptors)
* **Material UI** (UI)

---

## Folder structure

```
src/
  app/
    App.tsx
    router.tsx
    providers/
      QueryProvider.tsx            (optional if using React Query)
    layout/
      MainLayout.tsx
      AuthLayout.tsx
  shared/
    api/
      http.ts                      (axios instance + interceptors)
      endpoints.ts                 (optional)
    components/
      Loading.tsx
      ProtectedRoute.tsx
    config/
      env.ts
    utils/
      storage.ts                   (token helpers)
  features/
    auth/
      api/
        auth.api.ts                (login/logout/refresh calls)
      components/
        LoginForm.tsx
      pages/
        LoginPage.tsx
      store/
        auth.store.ts              (zustand: token/user/isAuth)
      types/
        auth.types.ts
      index.ts                     (barrel exports)
    users/
      api/
      components/
      pages/
      store/
      types/
  assets/
  main.tsx
```

**Rules**

* `features/*` owns its UI + logic + API.
* `shared/*` is reusable across features (axios, ProtectedRoute, storage).
* `app/*` wires routing/layout/providers only.

---

## Key files (minimal but complete)

### 1) `shared/api/http.ts` (Axios instance + auth header)

```ts
import axios from "axios";
import { getToken, clearToken } from "../utils/storage";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken(); // optional: also redirect to /login
    }
    return Promise.reject(err);
  }
);
```

### 2) `shared/utils/storage.ts`

```ts
const KEY = "token";

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);
```

### 3) `features/auth/api/auth.api.ts`

```ts
import { http } from "../../../shared/api/http";
import type { LoginRequest, LoginResponse } from "../types/auth.types";

export const loginApi = (body: LoginRequest) =>
  http.post<LoginResponse>("/auth/login", body).then(r => r.data);
```

### 4) `features/auth/store/auth.store.ts` (Zustand auth state)

```ts
import { create } from "zustand";
import { setToken, clearToken, getToken } from "../../../shared/utils/storage";
import { loginApi } from "../api/auth.api";

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  isAuthenticated: !!getToken(),

  login: async (email, password) => {
    const data = await loginApi({ email, password });
    setToken(data.token);
    set({ token: data.token, isAuthenticated: true });
  },

  logout: () => {
    clearToken();
    set({ token: null, isAuthenticated: false });
  },
}));
```

### 5) `shared/components/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

### 6) `features/auth/pages/LoginPage.tsx` (MUI page)

```tsx
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const login = useAuthStore(s => s.login);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch {
      setErr("Invalid email or password");
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 380, mx: "auto", mt: 10 }}>
      <Typography variant="h5" mb={2}>Login</Typography>

      <TextField fullWidth label="Email" value={email} onChange={e => setEmail(e.target.value)} margin="normal" />
      <TextField fullWidth label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} margin="normal" />

      {err && <Typography color="error" mt={1}>{err}</Typography>}

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
        Sign in
      </Button>
    </Box>
  );
}
```

### 7) `app/router.tsx`

```tsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import LoginPage from "../features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <div>Home</div> },
          { path: "/customers", element: <div>Customers</div> },
        ],
      },
    ],
  },
]);
```



