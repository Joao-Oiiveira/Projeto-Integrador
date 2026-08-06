import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCHLLd_zUT0LuCMw8qKZQJvpNQ4Q5DecgY',
    appId: '1:6151713177:web:afa14d592701babf15e308',
    messagingSenderId: '6151713177',
    projectId: 'eduacess-ac280',
    authDomain: 'eduacess-ac280.firebaseapp.com',
    storageBucket: 'eduacess-ac280.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyCHLLd_zUT0LuCMw8qKZQJvpNQ4Q5DecgY',
    appId: '1:6151713177:android:afa14d592701babf15e308',
    messagingSenderId: '6151713177',
    projectId: 'eduacess-ac280',
    storageBucket: 'eduacess-ac280.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyCHLLd_zUT0LuCMw8qKZQJvpNQ4Q5DecgY',
    appId: '1:6151713177:ios:afa14d592701babf15e308',
    messagingSenderId: '6151713177',
    projectId: 'eduacess-ac280',
    storageBucket: 'eduacess-ac280.firebasestorage.app',
    iosBundleId: 'com.example.mobile',
  );
}
