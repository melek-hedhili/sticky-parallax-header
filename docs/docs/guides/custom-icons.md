---
sidebar_position: 4
---

# Rendering custom (styled) icons

`leftTopIcon` and `rightTopIcon` accept an image source or a render function in Avatar and Details headers. Supply an accessibility label for each interactive icon. This example assumes `SafeAreaProvider` at the app root.

```tsx
import { Alert, Text } from 'react-native';
import { AvatarHeaderScrollView } from 'react-native-sticky-parallax-header';

export default function IconsScreen() {
  return (
    <AvatarHeaderScrollView
      containerStyle={{ flex: 1 }}
      backgroundColor="#22577a"
      title="Field notes"
      leftTopIcon={() => <Text style={{ color: 'white', fontSize: 24 }}>←</Text>}
      leftTopIconAccessibilityLabel="Go back"
      leftTopIconOnPress={() => Alert.alert('Back pressed')}
      rightTopIcon={() => <Text style={{ color: 'white', fontSize: 24 }}>⋮</Text>}
      rightTopIconAccessibilityLabel="Open menu"
      rightTopIconOnPress={() => Alert.alert('Menu pressed')}>
      <Text style={{ minHeight: 1200, padding: 24 }}>Your field notes</Text>
    </AvatarHeaderScrollView>
  );
}
```
