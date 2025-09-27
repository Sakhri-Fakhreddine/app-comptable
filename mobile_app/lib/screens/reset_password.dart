import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _loading = false;

  void _showFlushBar(String message, {Color bg = Colors.black}) {
    debugPrint("📢 Flushbar: $message");
    Flushbar(
      message: message,
      backgroundColor: bg,
      duration: const Duration(seconds: 3),
      margin: const EdgeInsets.all(8),
      borderRadius: BorderRadius.circular(8),
      flushbarPosition: FlushbarPosition.TOP,
    ).show(context);
  }

  Future<void> _resetPassword() async {
    if (!_formKey.currentState!.validate()) {
      debugPrint("❌ Validation failed.");
      return;
    }

    setState(() => _loading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      debugPrint("🔑 Using token: $token");

      final response = await http.post(
        Uri.parse("http://10.0.2.2:8000/api/reset-password"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: json.encode({
          "current_password": _currentPasswordController.text,
          "new_password": _newPasswordController.text,
          "confirm_password": _confirmPasswordController.text,
        }),
      );

      debugPrint("📩 Response: ${response.statusCode}");
      debugPrint("📩 Body: ${response.body}");

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _showFlushBar(data['message'] ?? "Mot de passe mis à jour", bg: Colors.green);
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) Navigator.pop(context);
      } else if (response.statusCode == 422) {
        _showFlushBar(data['message'] ?? "Erreur de validation", bg: Colors.orange);
      } else {
        _showFlushBar(data['message'] ?? "Erreur ${response.statusCode}", bg: Colors.red);
      }
    } catch (e) {
      _showFlushBar("Erreur: $e", bg: Colors.red);
      debugPrint("🔥 Exception: $e");
    } finally {
      setState(() => _loading = false);
      debugPrint("🔄 Reset process finished.");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color.fromARGB(255, 102, 0, 0), Color.fromARGB(255, 251, 64, 64)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  "Réinitialiser le mot de passe",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 40),
                Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _currentPasswordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: "Mot de passe actuel",
                          labelStyle: TextStyle(color: Colors.white70),
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.white54),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.white),
                          ),
                        ),
                        validator: (value) =>
                            value == null || value.isEmpty ? "Veuillez entrer votre mot de passe actuel" : null,
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _newPasswordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: "Nouveau mot de passe",
                          labelStyle: TextStyle(color: Colors.white70),
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.white54),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.white),
                          ),
                        ),
                        validator: (value) =>
                            value == null || value.isEmpty ? "Veuillez entrer un nouveau mot de passe" : null,
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          labelText: "Confirmer le nouveau mot de passe",
                          labelStyle: TextStyle(color: Colors.white70),
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.white54),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(color: Colors.white),
                          ),
                        ),
                        validator: (value) => value != _newPasswordController.text
                            ? "Les mots de passe ne correspondent pas"
                            : null,
                      ),
                      const SizedBox(height: 30),
                      _loading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : ElevatedButton(
                              onPressed: _resetPassword,
                              style: ElevatedButton.styleFrom(
                                minimumSize: const Size(double.infinity, 50),
                                backgroundColor: const Color(0xFFb8860b),
                              ),
                              child: const Text(
                                "Réinitialiser le mot de passe",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
