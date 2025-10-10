import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'profile.dart';

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

  // Password visibility
  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  void _showFlushBar(String message, {Color bg = Colors.black}) {
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
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

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

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _showFlushBar(data['message'] ?? "Mot de passe mis à jour", bg: Colors.green);
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) Navigator.pop(context);
      } else {
        _showFlushBar(data['message'] ?? "Erreur ${response.statusCode}", bg: Colors.red);
      }
    } catch (e) {
      _showFlushBar("Erreur: $e", bg: Colors.red);
    } finally {
      setState(() => _loading = false);
    }
  }

  Widget _buildPasswordField(
      String label, TextEditingController controller, bool obscure, Function toggleObscure) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        controller: controller,
        obscureText: obscure,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70),
          enabledBorder: const UnderlineInputBorder(
            borderSide: BorderSide(color: Colors.white54),
          ),
          focusedBorder: const UnderlineInputBorder(
            borderSide: BorderSide(color: Colors.white),
          ),
          suffixIcon: IconButton(
            icon: Icon(obscure ? Icons.visibility_off : Icons.visibility, color: Colors.white70),
            onPressed: () => toggleObscure(),
          ),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) return "Ce champ est requis";
          if (controller == _confirmPasswordController &&
              value != _newPasswordController.text) {
            return "Les mots de passe ne correspondent pas";
          }
          return null;
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Color.fromARGB(255, 102, 0, 0),
              Color.fromARGB(255, 251, 64, 64),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              AppBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const ClientProfilePage()),
                    );
                  },
                ),
                title: const Text(
                  "Changer mot de passe",
                  style: TextStyle(color: Colors.white),
                ),
              ),
              _loading
                  ? const Expanded(
                      child: Center(child: CircularProgressIndicator(color: Colors.white)),
                    )
                  : Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Card(
                          color: Colors.white.withOpacity(0.1),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                const Text(
                                  "Réinitialiser le mot de passe",
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 20),
                                Form(
                                  key: _formKey,
                                  child: Column(
                                    children: [
                                      _buildPasswordField(
                                          "Mot de passe actuel",
                                          _currentPasswordController,
                                          _obscureCurrent, () {
                                        setState(() => _obscureCurrent = !_obscureCurrent);
                                      }),
                                      _buildPasswordField(
                                          "Nouveau mot de passe",
                                          _newPasswordController,
                                          _obscureNew, () {
                                        setState(() => _obscureNew = !_obscureNew);
                                      }),
                                      _buildPasswordField(
                                          "Confirmer le nouveau mot de passe",
                                          _confirmPasswordController,
                                          _obscureConfirm, () {
                                        setState(() => _obscureConfirm = !_obscureConfirm);
                                      }),
                                      const SizedBox(height: 30),

                                      // Button wraps content only
                                      ElevatedButton.icon(
                                        icon: const Icon(Icons.save),
                                        label: const Text("Enregistrer"),
                                        onPressed: _resetPassword,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 16, vertical: 12),
                                          minimumSize: const Size(0, 0),
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
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
