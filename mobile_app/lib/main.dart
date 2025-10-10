import 'package:flutter/material.dart';
import 'package:mobile_app/screens/declarations.dart';
import 'screens/splash_screen.dart';
import 'screens/sign_in.dart';
import 'screens/client_home.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Client App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
      routes: {
        '/clientHome': (context) => const ClientHomePage(),
        '/signIn': (context) => const SignInPage(),
        '/declarations':(context) => const DeclarationsPage(),
        // Add more routes here if needed
      },
    );
  }
}
