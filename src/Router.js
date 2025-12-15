import {createBrowserRouter} from 'react-router';
import MainLayout from './Layout/MainLayout';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,

  },
   {
    path: "/details",
    element: <h1>Details</h1>,

  },
  
]);

 export default router;