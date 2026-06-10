import 'package:flutter/material.dart';
import 'accessibility_preferences.dart';

final accessibilityProvider = AccessibilityPreferences();

class AccessibilityConsumer extends StatelessWidget {
  final WidgetBuilder builder;

  const AccessibilityConsumer({super.key, required this.builder});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: accessibilityProvider,
      builder: (context, _) => builder(context),
    );
  }
}
