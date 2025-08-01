import { useState, useEffect } from 'react';
import { CommonService } from '@/services/common';
import type { PopData, PopDataDetail } from '@/types/common';
import { useAuthStore } from '@/stores/useAuthStore';

type PopupCondition = '0' | '1' | '2' | '3';

interface PopupState {
  isVisible: boolean;
  popData: PopDataDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function usePopupManager() {
  const { user, isAuthenticated } = useAuthStore();
  const [popupState, setPopupState] = useState<PopupState>({
    isVisible: false,
    popData: null,
    isLoading: false,
    error: null,
  });

  // 检查并显示弹窗
  const checkAndShowPopup = async (condition: PopupCondition, value: string = '1') => {
    setPopupState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const popConfig = await CommonService.popConfig(condition);
      
      if (popConfig.pop && popConfig.data) {
        setPopupState({
          isVisible: true,
          popData: popConfig.data,
          isLoading: false,
          error: null,
        });
      } else {
        setPopupState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error checking popup config:', error);
      setPopupState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check popup',
      }));
    }
  };

  // 关闭弹窗
  const closePopup = () => {
    setPopupState(prev => ({ ...prev, isVisible: false, popData: null }));
  };

  // 应用启动时检查弹窗（条件0）
  const checkAppStartPopup = () => {
    checkAndShowPopup('0');
  };

  // 注册成功后检查弹窗（条件1）
  const checkRegisterSuccessPopup = () => {
    checkAndShowPopup('1');
  };

  // 订单创建成功后检查弹窗（条件2）
  const checkOrderCreatedPopup = (orderNo?: string) => {
    checkAndShowPopup('2', orderNo || '1');
  };

  // 提现发起成功后检查弹窗（条件3）
  const checkWithdrawInitiatedPopup = (withdrawNo?: string) => {
    checkAndShowPopup('3', withdrawNo || '1');
  };

  return {
    ...popupState,
    closePopup,
    checkAppStartPopup,
    checkRegisterSuccessPopup,
    checkOrderCreatedPopup,
    checkWithdrawInitiatedPopup,
  };
}