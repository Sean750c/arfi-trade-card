import { KochavaMeasurement, KochavaMeasurementEventType } from 'react-native-kochava-measurement';

export class KochavaTracker {
  // APP首次打开
  static trackAppFirstOpen() {
    try {
      KochavaMeasurement.instance.sendEvent(
        KochavaMeasurementEventType.ApplicationInstalled,
        {}
      );
      console.log('Kochava: App first open tracked');
    } catch (error) {
      console.error('Kochava: Failed to track app first open', error);
    }
  }

  // 提交注册
  static trackRegisterSubmit(params: {
    register_type: string;
    country_id: string;
    username: string;
    email?: string;
    whatsapp?: string;
    recommend_code?: string;
  }) {
    try {
      KochavaMeasurement.instance.sendEvent(
        'register_submit',
        {
          register_type: params.register_type,
          country_id: params.country_id,
          username: params.username,
          has_email: params.email ? 'true' : 'false',
          has_whatsapp: params.whatsapp ? 'true' : 'false',
          has_recommend_code: params.recommend_code ? 'true' : 'false',
        }
      );
      console.log('Kochava: Register submit tracked', params.username);
    } catch (error) {
      console.error('Kochava: Failed to track register submit', error);
    }
  }

  // 注册成功
  static trackRegisterSuccess(params: {
    user_id: number;
    username: string;
    country_name: string;
    register_type: string;
    recommend_code?: string;
  }) {
    try {
      KochavaMeasurement.instance.sendEvent(
        KochavaMeasurementEventType.ApplicationInstalled,
        {
          user_id: params.user_id.toString(),
          username: params.username,
          country: params.country_name,
          register_type: params.register_type,
          has_referral: params.recommend_code ? 'true' : 'false',
        }
      );
      console.log('Kochava: Register success tracked', params.username);
    } catch (error) {
      console.error('Kochava: Failed to track register success', error);
    }
  }

  // 提交登录
  static trackLoginSubmit(username: string) {
    try {
      KochavaMeasurement.instance.sendEvent(
        'login_submit',
        {
          username: username,
        }
      );
      console.log('Kochava: Login submit tracked', username);
    } catch (error) {
      console.error('Kochava: Failed to track login submit', error);
    }
  }

  // 登录成功
  static trackLoginSuccess(params: {
    user_id: number;
    username: string;
    country_name: string;
    vip_level: number;
    login_method: 'password' | 'google' | 'facebook' | 'apple' | 'biometric';
  }) {
    try {
      KochavaMeasurement.instance.sendEvent(
        KochavaMeasurementEventType.ApplicationInstalled,
        {
          user_id: params.user_id.toString(),
          username: params.username,
          country: params.country_name,
          vip_level: params.vip_level.toString(),
          login_method: params.login_method,
        }
      );
      console.log('Kochava: Login success tracked', params.username);
    } catch (error) {
      console.error('Kochava: Failed to track login success', error);
    }
  }

  // 提交订单
  static trackOrderSubmit(params: {
    user_id: number;
    wallet_type: number;
    images_count: number;
    has_memo: boolean;
    has_coupon: boolean;
    coupon_code?: string;
  }) {
    try {
      KochavaMeasurement.instance.sendEvent(
        'order_submit',
        {
          user_id: params.user_id.toString(),
          wallet_type: params.wallet_type.toString(),
          images_count: params.images_count.toString(),
          has_memo: params.has_memo ? 'true' : 'false',
          has_coupon: params.has_coupon ? 'true' : 'false',
          coupon_code: params.coupon_code || '',
        }
      );
      console.log('Kochava: Order submit tracked', params.user_id);
    } catch (error) {
      console.error('Kochava: Failed to track order submit', error);
    }
  }

  // 订单创建成功
  static trackOrderSuccess(params: {
    user_id: number;
    order_no: string;
    wallet_type: number;
    images_count: number;
    has_coupon: boolean;
    coupon_code?: string;
    is_first_order: boolean;
  }) {
    try {
      KochavaMeasurement.instance.sendEvent(
        KochavaMeasurementEventType.Purchase,
        {
          user_id: params.user_id.toString(),
          order_no: params.order_no,
          wallet_type: params.wallet_type.toString(),
          images_count: params.images_count.toString(),
          has_coupon: params.has_coupon ? 'true' : 'false',
          coupon_code: params.coupon_code || '',
          is_first_order: params.is_first_order ? 'true' : 'false',
        }
      );
      console.log('Kochava: Order success tracked', params.order_no);
    } catch (error) {
      console.error('Kochava: Failed to track order success', error);
    }
  }

  // 社交登录成功
  static trackSocialLoginSuccess(params: {
    user_id: number;
    username: string;
    social_type: string;
    is_new_user: boolean;
  }) {
    try {
      KochavaMeasurement.instance.sendEvent(
        'social_login_success',
        {
          user_id: params.user_id.toString(),
          username: params.username,
          social_type: params.social_type,
          is_new_user: params.is_new_user ? 'true' : 'false',
        }
      );
      console.log('Kochava: Social login success tracked', params.social_type);
    } catch (error) {
      console.error('Kochava: Failed to track social login success', error);
    }
  }
}