import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:another_flushbar/flushbar.dart';
import 'ForgotPassword.dart';

class SignInPage extends StatefulWidget {
  const SignInPage({super.key});

  @override
  State<SignInPage> createState() => _SignInPageState();
}

class _SignInPageState extends State<SignInPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _loading = false;
  bool _obscurePassword = true;
  bool _rememberMe = false;

  // 🔹 Show Flushbar toast
  void _showToast(String message, {Color bg = Colors.black}) {
    Flushbar(
      message: message,
      backgroundColor: bg,
      duration: const Duration(seconds: 3),
      margin: const EdgeInsets.all(8),
      borderRadius: BorderRadius.circular(8),
      flushbarPosition: FlushbarPosition.TOP,
    ).show(context);
  }

  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      final response = await http.post(
        Uri.parse("http://10.0.2.2:8000/api/clientlogin"),
        body: {
          "email": _emailController.text,
          "password": _passwordController.text,
        },
      );

      final data = json.decode(response.body);
      print("Login Response: $data"); // 🔹 Log the full response

      if (response.statusCode == 200) {
        final token = data['token'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);

        // ✅ Save client ID if backend returns it
        if (data['client'] != null) {
          final clientId = data['client']['id'];
          await prefs.setInt('client_id', clientId);
          print("Saved Client ID: $clientId"); // 🔹 Log saved client ID
        } else {
          print("Warning: client object missing in response");
        }

        _showToast(data['message'] ?? "Connecté avec succès", bg: Colors.green);

        Navigator.pushReplacementNamed(context, "/clientHome");
      } else {
        _showToast(data['message'] ?? "Erreur de connexion", bg: Colors.red);
        print("Login Failed: ${data['message'] ?? 'Unknown error'}");
      }
    } catch (e) {
      _showToast("Erreur: $e", bg: Colors.red);
      print("Exception during login: $e");
    } finally {
      setState(() => _loading = false);
    }
  }



  Widget _buildTextField(TextEditingController controller, String label,
      {String? prefixAsset,
      TextInputType keyboardType = TextInputType.text,
      bool obscureText = false,
      Widget? suffixIcon}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white, fontSize: 16),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70, fontSize: 16),
          prefixIcon: prefixAsset != null
              ? Padding(
                  padding: const EdgeInsets.all(10),
                  child: Image.asset(prefixAsset, width: 24, height: 24),
                )
              : null,
          suffixIcon: suffixIcon,
          filled: true,
          fillColor: Colors.white.withOpacity(0.1),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Colors.white54),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFb8860b)),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFb8860b)),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFb8860b)),
          ),
          errorStyle: const TextStyle(
            color: Color(0xFFb8860b),
            fontWeight: FontWeight.bold,
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
        ),
        validator: (value) =>
            value!.isEmpty ? "Veuillez remplir ce champ" : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 102, 0, 0),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 60),
                Image.asset(
                  "assets/Accounting_log-removebg-preview.png",
                  width: 140,
                  height: 140,
                ),
                const SizedBox(height: 30),
                _buildTextField(_emailController, "Email",
                    prefixAsset: "assets/email.png",
                    keyboardType: TextInputType.emailAddress),
                _buildTextField(_passwordController, "Mot de passe",
                    prefixAsset: "assets/padlock.png",
                    obscureText: _obscurePassword,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: Colors.white70,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    )),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Checkbox(
                          value: _rememberMe,
                          onChanged: (value) {
                            setState(() => _rememberMe = value ?? false);
                          },
                          checkColor: Colors.white,
                          activeColor: const Color(0xFFb8860b),
                        ),
                        const Text(
                          "Rester connecté",
                          style: TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const ForgotPasswordPage(),
                          ),
                        );
                      },
                      child: const Text("Mot de passe oublié ?"),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _loading
                    ? const CircularProgressIndicator(color: Color(0xFFb8860b))
                    : ElevatedButton(
                        onPressed: _signIn,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 55),
                          backgroundColor: const Color(0xFFb8860b),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Text(
                          "Se connecter",
                          style: TextStyle(
                              fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                const SizedBox(height: 25),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "Pas encore inscrit ? ",
                      style: TextStyle(color: Colors.white70),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.pushNamed(context, "/welcome_page");
                      },
                      child: const Text(
                        "Contacter votre comptable",
                        style: TextStyle(
                            fontWeight: FontWeight.bold, color: Color(0xFFb8860b)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                const Divider(color: Colors.white70),
                const SizedBox(height: 10),
                const Text(
                  "Ou continuer avec",
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                        onPressed: () {},
                        icon: Image.asset("assets/facebook.png", width: 30)),
                    IconButton(
                        onPressed: () {},
                        icon: Image.asset("assets/instagram.png", width: 30)),
                    IconButton(
                        onPressed: () {},
                        icon: Image.asset("assets/github.png", width: 30)),
                    IconButton(
                        onPressed: () {},
                        icon: Image.asset("assets/linkedin.png", width: 30)),
                    IconButton(
                        onPressed: () {},
                        icon: Image.asset("assets/youtube.png", width: 30)),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
