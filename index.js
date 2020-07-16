import { Platform, Dimensions } from "react-native";
import Constants from "expo-constants";
import { Buffer } from "buffer";

const { width, height } = Dimensions.get("window");

const MIXPANEL_API_URL = "http://api.mixpanel.com";

export default class Mixpanel {
  constructor(token) {
    this.ready = false;
    this.queue = [];

    this.token = token;
    this.userId = null;
    this.clientId = Constants.deviceId;
    this.identify(this.clientId);

    Constants.getWebViewUserAgentAsync().then((userAgent) => {
      this.userAgent = userAgent;
      this.appName = Constants.manifest.name;
      this.appId = Constants.manifest.slug;
      this.appVersion = Constants.manifest.version;
      this.screenSize = `${width}x${height}`;
      this.deviceName = Constants.deviceName;
      if (Platform.OS === "ios") {
        this.platform = Constants.platform.ios.platform;
        this.model = Constants.platform.ios.model;
        this.osVersion = Constants.platform.ios.systemVersion;
      } else {
        this.platform = "android";
      }

      this.ready = true;
      this.flush();
    });
  }

  track(name, props) {
    this.queue.push({
      name,
      props,
    });
    this.flush();
  }

  identify(userId) {
    this.userId = userId;
  }

  flush() {
    if (this.ready) {
      while (this.queue.length) {
        const event = this.queue.pop();
        this.pushEvent(event).then(() => (event.sent = true));
      }
    }
  }

  pushEvent(event) {
    let data = {
      event: event.name,
      properties: event.props,
    };
    if (this.userId) {
      data.properties.distinct_id = this.userId;
    }
    data.properties.token = this.token;
    data.properties.user_agent = this.userAgent;
    data.properties.app_name = this.appName;
    data.properties.app_id = this.appId;
    data.properties.app_version = this.appVersion;
    data.properties.screen_size = this.screenSize;
    data.properties.client_id = this.clientId;
    data.properties.device_name = this.deviceName;
    if (this.platform) {
      data.properties.platform = this.platform;
    }
    if (this.model) {
      data.properties.model = this.model;
    }
    if (this.osVersion) {
      data.properties.os_version = this.osVersion;
    }

    data = new Buffer(JSON.stringify(data)).toString("base64");
    return fetch(`${MIXPANEL_API_URL}/track/?data=${data}`);
  }
}
