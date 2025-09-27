import 'dart:async';
import 'package:flutter/material.dart';
import 'welcome_page.dart'; // make sure path is correct

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 3), () {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const WelcomePage()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 102, 0, 0),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children:  [
             Image.asset(
              'assets/Accounting_log-removebg-preview.png', // <-- make sure this path matches your logo file
              width: 220,
              height: 220,
            ),
            
          ],
        ),
      ),
    );
  }
}
