import React from 'react';
import { Outlet } from 'react-router-dom';

const ProtectedRouteLayout = () => {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    )
};

export default ProtectedRouteLayout;