import { useEffect } from 'react';
import { notify } from 'react-notify-toast';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { RouteHelperStatus, useGuardStatus } from '@symfa/react-router-helpers';

export const AdminDashboardLoading = () => {
  const guardStatus = useGuardStatus();
  const navigate = useNavigate();

  useEffect(() => {

    if (guardStatus === RouteHelperStatus.Failed) {
      notify.show("You can not see this page, you are not admin! You'll be redirected back", "custom", 5000, {
        background: '#dc3545',
        text: "#FFFFFF"
      });

      setTimeout(() => {
        navigate('/guards');
      }, 2000);

    }
  }, [guardStatus]);

  return <div className="w-100 d-flex justify-content-center align-item-center">
    <LoadingSpinner />
  </div>;
};
