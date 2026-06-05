import { useAuthStore, getMe } from '../../../store/authStore';
import { useVendorProductsStore } from '../../../store/vendorProductsStore';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isVendorRegistered } from '../../../utils/isVendorRegistered';

/**
 * Shared gate for "Post property": subscription checks, then registered profile check.
 */
export default function useNewPropertyAction() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const subscription = useVendorProductsStore((s) => s.subscription);
  const statusCounts = useVendorProductsStore((s) => s.statusCounts) ?? {};

  const [showSubModal, setShowSubModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [postAfterRegistration, setPostAfterRegistration] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getMe();
    }
  }, [isLoggedIn]);

  const runSubscriptionChecks = useCallback(() => {
    if (!subscription) {
      setModalType('none');
      setShowSubModal(true);
      return false;
    }

    const activeAndProcessingCount =
      (statusCounts.activePropertiesCount || 0) +
      (statusCounts.processingPropertiesCount || 0) +
      (statusCounts.verifieddPropertiesCount || statusCounts.verifiedPropertiesCount || 0);

    if (subscription.expiryDate && new Date(subscription.expiryDate) < new Date()) {
      setModalType('expiry');
      setShowSubModal(true);
      return false;
    }

    if (activeAndProcessingCount >= subscription.totalLimit) {
      setModalType('limit');
      setShowSubModal(true);
      return false;
    }

    return true;
  }, [subscription, statusCounts]);

  const handleNewPost = useCallback(() => {
    if (!runSubscriptionChecks()) return;

    if (!isVendorRegistered(user)) {
      setPostAfterRegistration(true);
      setShowRegistrationModal(true);
      return;
    }

    navigate('/profile/create-property');
  }, [runSubscriptionChecks, user, navigate]);

  const handleRegistrationComplete = useCallback(() => {
    setShowRegistrationModal(false);
    if (postAfterRegistration) {
      setPostAfterRegistration(false);
      navigate('/profile/create-property');
    }
  }, [navigate, postAfterRegistration]);

  const handleRegistrationDismiss = useCallback(() => {
    setShowRegistrationModal(false);
    setPostAfterRegistration(false);
  }, []);

  return {
    user,
    subscription,
    showSubModal,
    setShowSubModal,
    modalType,
    showRegistrationModal,
    setShowRegistrationModal,
    handleNewPost,
    handleRegistrationComplete,
    handleRegistrationDismiss,
  };
}
