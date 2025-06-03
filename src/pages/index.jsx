import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Tables from "./Tables";

import Customer from "./Customer";

import ServiceRequests from "./ServiceRequests";

import Menu from "./Menu";

import StaffManagement from "./StaffManagement";

import ServiceTypes from "./ServiceTypes";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Tables: Tables,
    
    Customer: Customer,
    
    ServiceRequests: ServiceRequests,
    
    Menu: Menu,
    
    StaffManagement: StaffManagement,
    
    ServiceTypes: ServiceTypes,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Tables" element={<Tables />} />
                
                <Route path="/Customer" element={<Customer />} />
                
                <Route path="/ServiceRequests" element={<ServiceRequests />} />
                
                <Route path="/Menu" element={<Menu />} />
                
                <Route path="/StaffManagement" element={<StaffManagement />} />
                
                <Route path="/ServiceTypes" element={<ServiceTypes />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}