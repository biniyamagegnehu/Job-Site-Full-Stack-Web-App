import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const isAuthenticated = !!token;
  const isJobSeeker = user?.role === 'ROLE_JOB_SEEKER';
  const isEmployer = user?.role === 'ROLE_EMPLOYER';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const signOut = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isJobSeeker,
    isEmployer,
    isAdmin,
    signOut,
  };
};