import { lazy } from 'react';
import { Route } from 'react-router-dom';
import VendorLayout from '../components/vendor/components/layout/Layout';
import ProfilePanel from '../components/UserPanel/ProfilePanel';
import MessagesPanel from '../components/UserPanel/MessagesPanel';

const Dashboard = lazy(() => import('../components/UserPanel/pages/Dashboard'));
const SubscriptionPlans = lazy(() => import('../components/UserPanel/pages/SubscriptionPlans'));
const VendorProperties = lazy(() => import('../components/UserPanel/pages/Properties'));
const VendorPropertyDetails = lazy(() => import('../components/UserPanel/pages/PropertyDetails'));
const Support = lazy(() => import('../components/UserPanel/pages/Support'));
const TicketDetails = lazy(() => import('../components/UserPanel/pages/TicketDetails'));
const VendorBanners = lazy(() => import('../components/UserPanel/pages/Banners'));
const VendorBannerSubscriptions = lazy(() => import('../components/UserPanel/pages/BannerSubscriptions'));
const Transactions = lazy(() => import('../components/UserPanel/pages/Transactions'));
const CreateProperty = lazy(() => import('../components/UserPanel/pages/CreateProperty'));
const PropertyPending = lazy(() => import('../components/UserPanel/pages/properties/PropertyPending'));
const PropertyVerified = lazy(() => import('../components/UserPanel/pages/properties/PropertyVerified'));
const PropertyRejected = lazy(() => import('../components/UserPanel/pages/properties/PropertyRejected'));
const PropertyDraft = lazy(() => import('../components/UserPanel/pages/properties/PropertyDraft'));

export const vendorRoutes = (
  <Route path="vendor" element={<VendorLayout />}>
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="subscriptions" element={<SubscriptionPlans />} />
    <Route path="transactions" element={<Transactions />} />
    <Route path="properties/list" element={<VendorProperties />} />
    <Route path="properties/:id" element={<VendorPropertyDetails />} />
    <Route path="properties/pending" element={<PropertyPending />} />
    <Route path="properties/verified" element={<PropertyVerified />} />
    <Route path="properties/rejected" element={<PropertyRejected />} />
    <Route path="properties/draft" element={<PropertyDraft />} />
    <Route path="create-property" element={<CreateProperty />} />
    <Route path="create-property/:id" element={<CreateProperty />} />
    <Route path="chats" element={<MessagesPanel />} />
    <Route path="support" element={<Support />} />
    <Route path="support/:id" element={<TicketDetails />} />
    <Route path="banner-subscriptions" element={<VendorBannerSubscriptions />} />
    <Route path="banners" element={<VendorBanners />} />
    <Route path="profile" element={<ProfilePanel />} />
    <Route path="profile/*" element={<ProfilePanel />} />
  </Route>
);
