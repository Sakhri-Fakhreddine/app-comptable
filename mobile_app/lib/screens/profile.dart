import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';

import 'client_home.dart';
import 'reset_password.dart';

class ClientProfilePage extends StatefulWidget {
  const ClientProfilePage({super.key});

  @override
  State<ClientProfilePage> createState() => _ClientProfilePageState();
}

class _ClientProfilePageState extends State<ClientProfilePage> {
  bool _loading = true;
  Map<String, dynamic> _client = {};

  // Controllers
  final _nomPrenomController = TextEditingController();
  final _nomCommercialController = TextEditingController();
  final _emailController = TextEditingController();
  final _adresseController = TextEditingController();
  final _phoneController = TextEditingController();
  final _codeTvaController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchClientData();
  }

  // 🔹 Show Flushbar
  void _showFlushbar(String message, {Color bg = Colors.black}) {
    print("📢 Flushbar: $message");
    Flushbar(
      message: message,
      backgroundColor: bg,
      duration: const Duration(seconds: 3),
      margin: const EdgeInsets.all(8),
      borderRadius: BorderRadius.circular(8),
      flushbarPosition: FlushbarPosition.TOP,
    ).show(context);
  }

  // 🔹 Fetch profile info
  Future<void> _fetchClientData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      print("🔑 Using token: $token");

      final response = await http.get(
        Uri.parse("http://10.0.2.2:8000/api/client-profile"),
        headers: {"Authorization": "Bearer $token"},
      );

      print("📩 Fetch response: ${response.statusCode} - ${response.body}");

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print("✅ Profile data fetched: $data");

        setState(() {
          _client = data;
          _loading = false;

          // Pre-fill controllers
          _nomPrenomController.text = data['Nomprenom'] ?? '';
          _nomCommercialController.text = data['nom_commerciale'] ?? '';
          _emailController.text = data['email'] ?? '';
          _adresseController.text = data['adresse'] ?? '';
          _phoneController.text = data['phone'] ?? '';
          _codeTvaController.text = data['code_tva'] ?? '';
        });
      } else {
        _showFlushbar("Erreur de récupération des données", bg: Colors.red);
      }
    } catch (e) {
      print("❌ Error fetching profile: $e");
      _showFlushbar("Erreur: $e", bg: Colors.red);
    }
  }

  // 🔹 Update profile info
  Future<void> _updateProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      print("🔑 Using token: $token");

      final body = json.encode({
        "Nomprenom": _nomPrenomController.text,
        "nom_commerciale": _nomCommercialController.text,
        "email": _emailController.text,
        "adresse": _adresseController.text,
        "phone": _phoneController.text,
        "code_tva": _codeTvaController.text,
      });

      print("📤 Sending update: $body");

      final response = await http.put(
        Uri.parse("http://10.0.2.2:8000/api/client-profile/update"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
        },
        body: body,
      );

      print("📩 Update response: ${response.statusCode} - ${response.body}");

      if (response.statusCode == 200) {
        _showFlushbar("Profil mis à jour avec succès", bg: Colors.green);
        _fetchClientData(); // refresh after save
      } else {
        final error = json.decode(response.body);
        _showFlushbar(
          "Erreur: ${error['message'] ?? 'Échec de la mise à jour'}",
          bg: Colors.red,
        );
      }
    } catch (e) {
      print("❌ Error updating profile: $e");
      _showFlushbar("Erreur: $e", bg: Colors.red);
    }
  }

  // 🔹 Editable field with icon
  Widget _buildEditableField(
    String iconPath,
    String label,
    TextEditingController controller,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Image.asset(iconPath, width: 24, height: 24, color: Colors.white),
          const SizedBox(width: 12),
          Expanded(
            child: TextFormField(
              controller: controller,
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
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _nomPrenomController.dispose();
    _nomCommercialController.dispose();
    _emailController.dispose();
    _adresseController.dispose();
    _phoneController.dispose();
    _codeTvaController.dispose();
    super.dispose();
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
              // 🔹 AppBar
              AppBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () {
                    print("⬅️ Back to ClientHomePage");
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ClientHomePage(),
                      ),
                    );
                  },
                ),
                title: const Text(
                  "Profil Client",
                  style: TextStyle(color: Colors.white),
                ),
              ),

              _loading
                  ? const Expanded(
                      child: Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      ),
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
                                  "Modifier vos informations",
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(height: 20),

                                _buildEditableField(
                                  "assets/profile-user.png",
                                  "Nom et Prénom",
                                  _nomPrenomController,
                                ),
                                _buildEditableField(
                                  "assets/commercial.png",
                                  "Nom Commercial",
                                  _nomCommercialController,
                                ),
                                _buildEditableField(
                                  "assets/email.png",
                                  "Email",
                                  _emailController,
                                ),
                                _buildEditableField(
                                  "assets/addresse.png",
                                  "Adresse",
                                  _adresseController,
                                ),
                                _buildEditableField(
                                  "assets/telephone-call.png",
                                  "Téléphone",
                                  _phoneController,
                                ),
                                _buildEditableField(
                                  "assets/barcode.png",
                                  "Code TVA",
                                  _codeTvaController,
                                ),

                                const SizedBox(height: 30),

                                // 🔹 Save button
                                ElevatedButton.icon(
                                  icon: const Icon(Icons.save),
                                  label: const Text("Enregistrer"),
                                  onPressed: () {
                                    print("💾 Save button clicked");
                                    _updateProfile();
                                  },
                                ),
                                const SizedBox(height: 15),

                                // 🔹 Change password
                                ElevatedButton.icon(
                                  icon: const Icon(Icons.lock),
                                  label: const Text("Changer mot de passe"),
                                  onPressed: () {
                                    print(
                                      "🔑 Navigating to ResetPasswordPage with email: ${_emailController.text}",
                                    );
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            ResetPasswordPage(),
                                      ),
                                    );
                                  },
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
