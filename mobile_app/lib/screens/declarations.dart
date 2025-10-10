import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';

import 'edit_declaration.dart'; // 👈 Create this file next

class DeclarationsPage extends StatefulWidget {
  const DeclarationsPage({super.key});

  @override
  State<DeclarationsPage> createState() => _DeclarationsPageState();
}

class _DeclarationsPageState extends State<DeclarationsPage> {
  bool _loading = true;
  List<dynamic> _declarations = [];

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

  Future<void> _fetchDeclarations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.get(
        Uri.parse("http://10.0.2.2:8000/api/client-declarations"),
        headers: {"Authorization": "Bearer $token"},
      );

      print("📩 Fetch response: ${response.statusCode} - ${response.body}");

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          setState(() {
            _declarations = data['declarations'];
            _loading = false;
          });
        } else {
          _showFlushbar("Erreur: ${data['message']}", bg: Colors.red);
          setState(() => _loading = false);
        }
      } else {
        _showFlushbar("Erreur serveur: ${response.statusCode}", bg: Colors.red);
        setState(() => _loading = false);
      }
    } catch (e) {
      _showFlushbar("Erreur: $e", bg: Colors.red);
      setState(() => _loading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    _fetchDeclarations();
  }

  Color _getEtatColor(String etat) {
    switch (etat.toLowerCase()) {
      case 'en cours':
        return Colors.yellowAccent;
      case 'traitée':
        return Colors.greenAccent;
      case 'refusée':
        return Colors.redAccent;
      default:
        return Colors.white;
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
          child: Column(
            children: [
              AppBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                title: const Text(
                  "Mes Déclarations",
                  style: TextStyle(color: Colors.white),
                ),
                centerTitle: true,
              ),
              _loading
                  ? const Expanded(
                      child: Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      ),
                    )
                  : _declarations.isEmpty
                      ? const Expanded(
                          child: Center(
                            child: Text(
                              "Aucune déclaration trouvée",
                              style: TextStyle(color: Colors.white, fontSize: 16),
                            ),
                          ),
                        )
                      : Expanded(
                          child: ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _declarations.length,
                            itemBuilder: (context, index) {
                              final decl = _declarations[index];
                              final etat = decl['etat_declaration'] ?? 'N/A';

                              return Card(
                                color: Colors.white.withOpacity(0.15),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                margin: const EdgeInsets.symmetric(vertical: 12),
                                elevation: 5,
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        "Déclaration: ${decl['typedeclaration']}",
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        "Année/Mois: ${decl['anneemois']}",
                                        style: const TextStyle(color: Colors.white70),
                                      ),
                                      Text(
                                        "Date: ${decl['datedeclaration']}",
                                        style: const TextStyle(color: Colors.white70),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        "État: $etat",
                                        style: TextStyle(
                                          backgroundColor: _getEtatColor(etat),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      if (decl['document'] != null)
                                        GestureDetector(
                                          onTap: () {
                                            // TODO: open document
                                          },
                                          child: Text(
                                            "Voir document",
                                            style: TextStyle(
                                              color: Colors.blue[200],
                                              decoration: TextDecoration.underline,
                                            ),
                                          ),
                                        ),
                                      const SizedBox(height: 12),
                                      ElevatedButton.icon(
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (_) => EditDeclarationPage(
                                                declaration: decl,
                                              ),
                                            ),
                                          );
                                        },
                                        icon: const Icon(Icons.edit, color: Colors.black),
                                        label: const Text("Modifier"),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.white,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20, vertical: 10),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
            ],
          ),
        ),
      ),
    );
  }
}
