# Expo Mixpanel

Mixpanel integration for use with React Native apps built on Expo.

## Installation

```
npm install expo-mixpanel --save
```

## Usage

```
import Mixpanel from 'expo-mixpanel';

const analytics = new Mixpanel("token");
analytics.track("New User", { "email": "test@test.com" });
analytics.identify("13793");

```

## References
https://mixpanel.com/help/reference/http