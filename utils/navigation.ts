import { router } from 'expo-router';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';

// 内链代码到路由的映射
const INTERNAL_ROUTE_MAP: Record<string, string> = {
  // 主要页面
  'app_home': '/(tabs)',
  'app_mine': '/(tabs)/profile',
  'app_wallet': '/(tabs)/wallet',
  'app_sellcard': '/(tabs)/sell',
  'app_buycard': '/(tabs)/sell', // 买卡和卖卡使用同一个页面
  
  // 订单相关
  'app_orderlist': '/orders',
  'app_orderdetail': '/orders', // 订单详情需要订单号参数
  
  // 提现相关
  'app_withdrawlist': '/wallet/withdraw',
  'app_withdrawdetail': '/wallet/withdraw', // 提现详情需要提现单号参数
  
  // 工具和功能
  'app_calculator': '/calculator',
  'app_ratelist': '/rates',
  
  // 个人中心功能
  'app_discountlist': '/profile/promo-codes',
  'app_vip': '/profile/vip',
  
  // 活动和奖励
  'app_checkin': '/profile/checkin',
  'app_rank': '/profile/ranking',
  'app_rankreward': '/profile/ranking-history',
  'app_prizedraw': '/profile/lottery',
  'app_share': '/refer',
  
  // 消息和发现
  'app_message': '/notifications',
};

export class NavigationUtils {
  /**
   * 根据内链代码跳转到对应页面
   * @param internalCode 后台返回的内链代码
   * @param params 可选参数，用于需要参数的页面
   */
  static navigateToInternalRoute(internalCode: string, params?: Record<string, any>) {
    try {
      const route = INTERNAL_ROUTE_MAP[internalCode];
      
      if (!route) {
        console.warn(`Unknown internal route code: ${internalCode}`);
        // 跳转到首页
        router.push('/(tabs)');
        return true;
      }

      // 处理需要参数的特殊路由
      let finalRoute = route;
      
      switch (internalCode) {
        case 'app_orderdetail':
          if (params?.order_no) {
            finalRoute = `/orders/${params.order_no}`;
          } else {
            // 如果没有订单号，跳转到订单列表
            finalRoute = '/orders';
          }
          break;
          
        case 'app_withdrawdetail':
          if (params?.withdraw_no || params?.log_id) {
            const id = params.withdraw_no || params.log_id;
            finalRoute = `/wallet/${id}`;
          } else {
            // 如果没有提现单号，跳转到提现列表
            finalRoute = '/wallet/withdraw';
          }
          break;
          
        case 'app_web':
          if (params?.url) {
            // 对于Web页面，可以考虑使用WebView或外部浏览器
            finalRoute = `/profile/web?url=${encodeURIComponent(params.url)}`;
          } else {
            console.warn('Web route requires URL parameter');
            Alert.alert('Navigation Error', 'Web page URL is required');
            return false;
          }
          break;
      }

      // 执行路由跳转
      router.push(finalRoute as any);
      return true;
      
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to the requested page');
      return false;
    }
  }

  /**
   * 检查内链代码是否有效
   * @param internalCode 内链代码
   */
  static isValidInternalRoute(internalCode: string): boolean {
    return internalCode in INTERNAL_ROUTE_MAP;
  }

  /**
   * 获取内链代码对应的路由
   * @param internalCode 内链代码
   */
  static getRouteForCode(internalCode: string): string | null {
    return INTERNAL_ROUTE_MAP[internalCode] || null;
  }

  /**
   * 获取所有支持的内链代码
   */
  static getSupportedCodes(): string[] {
    return Object.keys(INTERNAL_ROUTE_MAP);
  }

  /**
   * 处理通知消息中的跳转
   * @param noticeAction 通知动作代码
   * @param noticeParams 通知参数（JSON字符串）
   */
  static handleNotificationNavigation(noticeAction: string, noticeParams?: string) {
    try {
      let params: Record<string, any> = {};
      
      // 解析通知参数
      if (noticeParams) {
        try {
          params = JSON.parse(noticeParams);
        } catch (error) {
          console.warn('Failed to parse notification params:', noticeParams);
        }
      }

      // 如果是内链代码，使用内链跳转
      if (this.isValidInternalRoute(noticeAction)) {
        return this.navigateToInternalRoute(noticeAction, params);
      }

      // 如果是URL，使用外部链接处理
      if (noticeAction.startsWith('http://') || noticeAction.startsWith('https://')) {
        return this.handleExternalUrl(noticeAction);
      }

      // 其他情况，尝试作为路由路径处理
      if (noticeAction.startsWith('/')) {
        router.push(noticeAction as any);
        return true;
      }

      console.warn(`Unknown notification action: ${noticeAction}`);
      return false;
      
    } catch (error) {
      console.error('Notification navigation error:', error);
      return false;
    }
  }

  /**
   * 处理弹窗中的跳转
   * @param jumpType 跳转类型 (1: 内链, 2: 外链)
   * @param url 跳转地址
   */
  static handlePopupNavigation(jumpType: 1 | 2, url: string) {
    try {
      if (jumpType === 1) {
        // APP内链
        if (this.isValidInternalRoute(url)) {
          // 如果是内链代码
          return this.navigateToInternalRoute(url);
        } else if (url.startsWith('/')) {
          // 如果是路由路径
          router.push(url as any);
          return true;
        } else {
          console.warn(`Invalid internal route: ${url}`);
          return false;
        }
      } else if (jumpType === 2) {
        // 外部链接
        return this.handleExternalUrl(url);
      }
      
      return false;
    } catch (error) {
      console.error('Popup navigation error:', error);
      return false;
    }
  }

  /**
   * 处理外部URL
   * @param url 外部URL
   */
  private static async handleExternalUrl(url: string): Promise<boolean> {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('Error', 'Cannot open this link');
        return false;
      }
    } catch (error) {
      console.error('External URL error:', error);
      Alert.alert('Error', 'Failed to open link');
      return false;
    }
  }

  /**
   * 根据订单状态跳转到对应页面
   * @param orderNo 订单号
   * @param status 订单状态
   */
  static navigateToOrderByStatus(orderNo: string, status?: string) {
    if (orderNo) {
      this.navigateToInternalRoute('app_orderdetail', { order_no: orderNo });
    } else {
      this.navigateToInternalRoute('app_orderlist');
    }
  }

  /**
   * 根据提现状态跳转到对应页面
   * @param withdrawNo 提现单号
   * @param logId 日志ID
   */
  static navigateToWithdrawByStatus(withdrawNo?: string, logId?: string) {
    if (withdrawNo || logId) {
      this.navigateToInternalRoute('app_withdrawdetail', { 
        withdraw_no: withdrawNo,
        log_id: logId 
      });
    } else {
      this.navigateToInternalRoute('app_withdrawlist');
    }
  }
}

export default NavigationUtils;