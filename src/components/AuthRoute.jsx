import { Navigate, Outlet } from "react-router";


export default function AuthRoute({ requireAuth = true, }) {
    // const isLoggedIn

    // if (!requireAuth && isLoggedIn) {
    //     return (
    //         <Navigate
    //             to="/dashboard"
    //             replace
    //         />
    //     );
    // }
    
    // if (requireAuth && !isLoggedIn) {
    //     return (
    //         <Navigate
    //             to="/sign-in"
    //             replace
    //         />
    //     );
    // }

    

    return <Outlet />;
}