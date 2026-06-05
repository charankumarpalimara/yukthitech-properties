import { lazy } from 'react';
import { Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home';

const Properties = lazy(() => import('../pages/Properties'));
const Subscription = lazy(() => import('../pages/Subscription'));
const PropertyDetails = lazy(() => import('../pages/PropertyDetails'));
const CategoryViewDetails = lazy(() => import('../pages/CategoryViewDetails'));
const UserPanel = lazy(() => import('../pages/UserPanel'));
const CollectionPage = lazy(() => import('../pages/CollectionPage'));
const CityPropertiesPage = lazy(() => import('../pages/CityPropertiesPage'));
const NearbyPropertiesPage = lazy(() => import('../pages/NearbyPropertiesPage'));
const Blogs = lazy(() => import('../pages/Blogs'));
const AllBlogs = lazy(() => import('../pages/AllBlogs'));
const BlogPost = lazy(() => import('../pages/BlogPost'));
const DeleteAccount = lazy(() => import('../pages/DeleteAccount'));

const AboutUs = lazy(() => import('../pages/info/AboutUs'));
const ContactUs = lazy(() => import('../pages/info/ContactUs'));
const TermsConditions = lazy(() => import('../pages/info/TermsConditions'));
const PrivacyPolicy = lazy(() => import('../pages/info/PrivacyPolicy'));
const Grievances = lazy(() => import('../pages/info/Grievances'));
const SafetyGuide = lazy(() => import('../pages/info/SafetyGuide'));
const Disclaimer = lazy(() => import('../pages/info/Disclaimer'));
const Careers = lazy(() => import('../pages/info/Careers'));
const Feedback = lazy(() => import('../pages/info/Feedback'));
const ReportProblem = lazy(() => import('../pages/info/ReportProblem'));
const RequestInfo = lazy(() => import('../pages/info/RequestInfo'));
const SummonsNotices = lazy(() => import('../pages/info/SummonsNotices'));

export const websiteRoutes = (
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="category/:id" element={<CategoryViewDetails />} />
    <Route path="properties" element={<Properties />} />
    <Route path="property/:id" element={<PropertyDetails />} />
    <Route path="subscription" element={<Subscription />} />
    <Route path="profile/:tab?/:id?" element={<UserPanel />} />

    <Route path="about-us" element={<AboutUs />} />
    <Route path="contact-us" element={<ContactUs />} />
    <Route path="terms-conditions" element={<TermsConditions />} />
    <Route path="privacy-policy" element={<PrivacyPolicy />} />
    <Route path="grievances" element={<Grievances />} />
    <Route path="safety-guide" element={<SafetyGuide />} />
    <Route path="disclaimer" element={<Disclaimer />} />
    <Route path="delete-account" element={<DeleteAccount />} />
    <Route path="careers" element={<Careers />} />
    <Route path="feedback" element={<Feedback />} />
    <Route path="report-problem" element={<ReportProblem />} />
    <Route path="request-info" element={<RequestInfo />} />
    <Route path="summons-notices" element={<SummonsNotices />} />

    <Route
      path="high-rated-properties"
      element={
        <CollectionPage
          type="high-rated"
          title="Highest Rated Properties"
          subtitle="Properties loved by customers and highly reviewed for their quality and location."
        />
      }
    />
    <Route
      path="high-rated-locality-properties"
      element={
        <CollectionPage
          type="high-rated-locality"
          title="Highest Rated Properties in Hyderabad"
          subtitle="Properties loved by customers and highly reviewed for their quality and location."
        />
      }
    />
    <Route
      path="plots-land-properties"
      element={
        <CollectionPage
          type="land"
          title="Plots & Land"
          subtitle="Explore premium residential plots, farmlands and industrial sites across top locations."
        />
      }
    />
    <Route
      path="featured-properties"
      element={
        <CollectionPage
          type="featured"
          title="Handpicked Featured Listings"
          subtitle="Exclusively sourced and verified properties curated by our real estate experts."
        />
      }
    />
    <Route
      path="premium-properties"
      element={
        <CollectionPage
          type="premium"
          title="Premium Properties"
          subtitle="Verified listings from sellers on premium subscription plans."
        />
      }
    />
    <Route path="top-budget-properties" element={<CollectionPage />} />
    <Route path="collection/:id" element={<CollectionPage />} />
    <Route path="city/:cityName" element={<CityPropertiesPage />} />
    <Route path="nearby" element={<NearbyPropertiesPage />} />
    <Route path="blogs" element={<Blogs />} />
    <Route path="all-blogs" element={<AllBlogs />} />
    <Route path="blog/:slug" element={<BlogPost />} />
  </Route>
);
