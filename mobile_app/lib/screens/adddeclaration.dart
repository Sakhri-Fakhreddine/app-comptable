import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';

class AddDeclaration extends StatefulWidget {
  const AddDeclaration({super.key});

  @override
  State<AddDeclaration> createState() => _AddDeclarationState();
}

class _AddDeclarationState extends State<AddDeclaration> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  bool _loadingFields = false;

  List<Map<String, dynamic>> _types = [];
  Map<String, dynamic>? _selectedType;

  List<Map<String, dynamic>> _lines = [];
  final Map<int, TextEditingController> _lineControllers = {};

  @override
  void initState() {
    super.initState();
    _fetchDeclarationTypes();
  }

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

  Future<void> _fetchDeclarationTypes() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.get(
        Uri.parse("http://10.0.2.2:8000/api/declaration/types"),
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _types = List<Map<String, dynamic>>.from(data['types']);
        });
      } else {
        _showFlushBar("Impossible de charger les types", bg: Colors.red);
      }
    } catch (e) {
      _showFlushBar("Erreur: $e", bg: Colors.red);
    }
  }

  Future<void> _fetchFieldsForType(String type) async {
    setState(() => _loadingFields = true);
    _lines.clear();
    _lineControllers.clear();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.get(
        Uri.parse("http://10.0.2.2:8000/api/declaration/settings/$type"),
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        final lines = (data['lines'] as List).map((e) {
          return {
            'id': e['idlignes_parametres_decalarations'],
            'libelle': "${e['libellee']} / ${e['libelleeArabe']}",
            'debit_credit': e['debit_credit'],
          };
        }).toList();

        setState(() {
          _lines = lines;
          for (var line in lines) {
            _lineControllers[line['id']] = TextEditingController();
          }
        });
      } else {
        _showFlushBar("Impossible de charger les champs", bg: Colors.red);
      }
    } catch (e) {
      _showFlushBar("Erreur: $e", bg: Colors.red);
    } finally {
      setState(() => _loadingFields = false);
    }
  }

  Future<void> _submitDeclaration() async {
    print("=== SUBMIT DECLARATION START ===");

    if (_selectedType == null) {
      print("No type selected!");
      _showFlushBar("Veuillez sélectionner un type", bg: Colors.red);
      return;
    }

    if (!_formKey.currentState!.validate()) {
      print("Form validation failed!");
      return;
    }

    setState(() => _loading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      final clientId = prefs.getInt('client_id') ?? 0;

      print("Client ID: $clientId");
      print("Selected Type: ${_selectedType!['typedeclaration']} / ${_selectedType!['typedeclarationArabe']}");

      final linesData = _lines.map((line) {
        final value = _lineControllers[line['id']]?.text ?? '';
        print("Line ID: ${line['id']}, Value: $value");
        return {
          'param_id': line['id'],
          'valeur': value,
        };
      }).toList();

      final body = {
        'client_id': clientId,
        'typedeclaration': _selectedType!['typedeclaration'],
        'anneemois': DateTime.now().toIso8601String().substring(0, 7),
        'lines': linesData,
      };

      print("POST Body: ${json.encode(body)}");

      final response = await http.post(
        Uri.parse("http://10.0.2.2:8000/api/declarations"),
        headers: {
          "Authorization": "Bearer $token",
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: json.encode(body),
      );

      print("Response Status: ${response.statusCode}");
      print("Response Body: ${response.body}");

      final data = json.decode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        print("Declaration successfully submitted!");
        _showFlushBar("Déclaration ajoutée avec succès", bg: Colors.green);
        _lineControllers.forEach((key, controller) => controller.clear());
      } else {
        print("Error submitting declaration: ${data['message']}");
        _showFlushBar(data['message'] ?? "Échec de l'ajout", bg: Colors.red);
      }
    } catch (e) {
      print("Exception caught: $e");
      _showFlushBar("Erreur: $e", bg: Colors.red);
    } finally {
      setState(() => _loading = false);
      print("=== SUBMIT DECLARATION END ===");
    }
  }


  @override
  void dispose() {
    _lineControllers.forEach((key, controller) => controller.dispose());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Ajouter Déclaration"),
        backgroundColor: const Color.fromARGB(255, 102, 0, 0),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Declaration type dropdown
              DropdownButtonFormField<Map<String, dynamic>>(
                value: _selectedType,
                items: _types.map((typeMap) {
                  return DropdownMenuItem<Map<String, dynamic>>(
                    value: typeMap,
                    child: Text(
                      "${typeMap['typedeclaration']} / ${typeMap['typedeclarationArabe']}",
                    ),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() => _selectedType = value);
                  if (value != null) _fetchFieldsForType(value['typedeclaration']);
                },
                decoration: const InputDecoration(
                  labelText: "Type de déclaration",
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                    value == null ? "Veuillez choisir un type" : null,
              ),
              const SizedBox(height: 16),

              // Dynamic fields
              _loadingFields
                  ? const Center(child: CircularProgressIndicator())
                  : Column(
                      children: _lines.map((line) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0),
                          child: TextFormField(
                            controller: _lineControllers[line['id']],
                            decoration: InputDecoration(
                              labelText: line['libelle'],
                              border: const OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            validator: (value) => value == null || value.isEmpty
                                ? "Veuillez entrer une valeur"
                                : null,
                          ),
                        );
                      }).toList(),
                    ),
              const SizedBox(height: 24),
              _loading
                  ? const CircularProgressIndicator()
                  : ElevatedButton(
                      onPressed: _submitDeclaration,
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 50),
                        backgroundColor: const Color(0xFFb8860b),
                      ),
                      child: const Text(
                        "Ajouter Déclaration",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
