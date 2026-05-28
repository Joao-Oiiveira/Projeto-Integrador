import 'package:flutter/material.dart';
import 'accessibility_preferences.dart';

final accessibilityProvider = AccessibilityPreferences();

class AccessibilityConsumer extends StatefulWidget {
  final Widget child;

  const AccessibilityConsumer({super.key, required this.child});

  @override
  State<AccessibilityConsumer> createState() => _AccessibilityConsumerState();
}

class _AccessibilityConsumerState extends State<AccessibilityConsumer> {
  @override
  void initState() {
    super.initState();
    accessibilityProvider.addListener(_onAccessibilityChanged);
  }

  @override
  void dispose() {
    accessibilityProvider.removeListener(_onAccessibilityChanged);
    super.dispose();
  }

  void _onAccessibilityChanged() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
