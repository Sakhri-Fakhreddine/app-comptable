import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';

class ContactComptable extends StatefulWidget {
  const ContactComptable({super.key});

  @override
  State<ContactComptable> createState() => _ContactComptableState();
}

class _ContactComptableState extends State<ContactComptable> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();

  String? comptableEmail;
  bool _loading = true;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _fetchComptableEmail();
  }

  void _showFlushbar(String message, {Color bg = Colors.black}) {
    Flushbar(
      message: message,
      backgroundColor: bg,
      duration: const Duration(seconds: 3),
      margin: const EdgeInsets.all(8),
      borderRadius: BorderRadius.circular(8),
      flushbarPosition: FlushbarPosition.TOP,
    ).show(context);
  }

  Future<void> _fetchComptableEmail() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.get(
        Uri.parse('http://10.0.2.2:8000/api/comptablemail'),
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          comptableEmail = data['email'];
          _loading = false;
        });
      } else {
        _showFlushbar('Erreur serveur: ${response.statusCode}', bg: Colors.red);
        setState(() => _loading = false);
      }
    } catch (e) {
      _showFlushbar('Erreur: $e', bg: Colors.red);
      setState(() => _loading = false);
    }
  }

  Future<void> _sendEmail() async {
    if (!_formKey.currentState!.validate()) return;
    if (comptableEmail == null) {
      _showFlushbar('Adresse du comptable introuvable', bg: Colors.red);
      return;
    }

    setState(() => _sending = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.post(
        Uri.parse('http://10.0.2.2:8000/api/sendmail'),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json"
        },
        body: json.encode({
          'to': comptableEmail,
          'subject': _subjectController.text.trim(),
          'message': _messageController.text.trim(),
        }),
      );

      if (response.statusCode == 200) {
        _showFlushbar('Email envoyé avec succès', bg: Colors.green);
        _subjectController.clear();
        _messageController.clear();
      } else {
        final data = json.decode(response.body);
        _showFlushbar('Erreur: ${data['message'] ?? 'Échec'}', bg: Colors.red);
      }
    } catch (e) {
      _showFlushbar('Erreur: $e', bg: Colors.red);
    } finally {
      setState(() => _sending = false);
    }
  }

  Widget _buildInputField(String label, TextEditingController controller,
      {int maxLines = 1, bool enabled = true}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        controller: controller,
        enabled: enabled,
        maxLines: maxLines,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70),
          filled: true,
          fillColor: Colors.white.withOpacity(0.1),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
        ),
        validator: (value) =>
            value == null || value.isEmpty ? 'Veuillez remplir ce champ' : null,
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
            colors: [Color.fromARGB(255, 102, 0, 0), Color.fromARGB(255, 251, 64, 64)],
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
                  onPressed: () => Navigator.pop(context),
                ),
                title: const Text(
                  "Contacter Comptable",
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
                        child: Column(
                          children: [
                            _buildInputField("Email du comptable",
                                TextEditingController(text: comptableEmail ?? ''),
                                enabled: false),
                            _buildInputField("Sujet", _subjectController),
                            _buildInputField("Message", _messageController,
                                maxLines: 6),
                            const SizedBox(height: 20),
                            _sending
                                ? const CircularProgressIndicator()
                                : SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton.icon(
                                      icon: const Icon(Icons.send),
                                      label: const Text("Envoyer"),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.white,
                                        foregroundColor: const Color.fromARGB(255, 0, 0, 0),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                      ),
                                      onPressed: _sendEmail,
                                    ),
                                  ),
                          ],
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
