import { KochavaMeasurement, KochavaMeasurementEventType } from 'react-native-kochava-measurement';

export class KochavaTracker {
  // APP首次打开
  static trackAppFirstOpen() {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventName("First Open");
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track app first open', error);
    }
  }

  // 提交注册
  static trackRegisterSubmit(params: {
    register_type: string;
    recommend_code?: string;
  }) {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventName("Register Click");
      koEvent.setCustomStringValue("register_type", params.register_type);
      koEvent.setCustomStringValue("has_recommend_code", params.recommend_code ? 'true' : 'false');
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track register submit', error);
    }
  }

  // 注册成功
  static trackRegisterSuccess(register_type: string) {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventType(KochavaMeasurementEventType.RegistrationComplete);
      koEvent.setCustomStringValue("register_type", register_type);
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track register success', error);
    }
  }

  // 提交登录
  static trackLoginSubmit(username: string) {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventName("Login Click");
      koEvent.setCustomStringValue("username", username);
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track login submit', error);
    }
  }

  // 登录成功
  static trackLoginSuccess(login_method: 'password' | 'google' | 'facebook' | 'apple' | 'biometric') {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventName("Login Success");
      koEvent.setCustomStringValue("login_method", login_method);
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track login success', error);
    }
  }

  // 提交订单
  static trackOrderSubmit(images_count: number) {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventName("Sell Click");
      koEvent.setCustomNumberValue("images_count", images_count);
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track order submit', error);
    }
  }

  // 订单创建成功
  static trackOrderSuccess(order_no: string) {
    try {
      var koEvent = KochavaMeasurement.instance.buildEventWithEventName("Sell Success");
      koEvent.setCustomStringValue("order_no", order_no);
      koEvent.send();
    } catch (error) {
      console.error('Kochava: Failed to track order success', error);
    }
  }
}