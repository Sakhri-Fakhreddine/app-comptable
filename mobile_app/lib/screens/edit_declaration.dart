import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:another_flushbar/flushbar.dart';
import 'package:file_picker/file_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EditDeclarationPage extends StatefulWidget {
  final int declaration;

  const EditDeclarationPage({super.key, required this.declaration});

  @override
  State<EditDeclarationPage> createState() => _EditDeclarationPageState();
}

class _EditDeclarationPageState extends State<EditDeclarationPage> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = true;
  bool _submitting = false;

  late TextEditingController _typeController;
  late TextEditingController _anneeMoisController;
  late TextEditingController _dateController;

  Map<String, dynamic>? _declarationData;
  List<dynamic> _lines = [];
  File? _pickedDocument;

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

  @override
  void initState() {
    super.initState();
    _typeController = TextEditingController();
    _anneeMoisController = TextEditingController();
    _dateController = TextEditingController();
    _fetchDeclaration();
  }

  Future<void> _fetchDeclaration() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final response = await http.get(
        Uri.parse('http://10.0.2.2:8000/api/declarations/${widget.declaration}'),
        headers: {"Authorization": "Bearer $token"},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _declarationData = data['declaration'];
          _typeController.text = _declarationData?['typedeclaration'] ?? '';
          _anneeMoisController.text = _declarationData?['anneemois'] ?? '';
          _dateController.text = _declarationData?['datedeclaration'] ?? '';
          _lines = List.from(_declarationData?['lines'] ?? []);
          _loading = false;
        });
      } else {
        _showFlushbar("Erreur serveur: ${response.statusCode}", bg: Colors.red);
        setState(() => _loading = false);
      }
    } catch (e) {
      _showFlushbar("Erreur réseau: $e", bg: Colors.red);
      setState(() => _loading = false);
    }
  }

  Future<void> _pickDocument() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
    );
    if (result != null && result.files.single.path != null) {
      setState(() {
        _pickedDocument = File(result.files.single.path!);
      });
    }
  }

  Future<void> _updateDeclaration() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';

      final updatedLines = _lines.map((line) {
        return {
          "id": line['id'],
          "parametre": line['libelle'],
          "valeur": (line['values'] as List).map((v) => v['valeur']).join(),
        };
      }).toList();

      final request = http.MultipartRequest(
        'POST',
        Uri.parse('http://10.0.2.2:8000/api/declarations/${widget.declaration}'),
      );

      request.headers['Authorization'] = 'Bearer $token';
      request.fields['anneemois'] = _anneeMoisController.text;
      request.fields['etat_declaration'] = 'En cours';
      request.fields['lines'] = jsonEncode(updatedLines);

      if (_pickedDocument != null) {
        request.files.add(await http.MultipartFile.fromPath(
          'document',
          _pickedDocument!.path,
        ));
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        _showFlushbar("Déclaration mise à jour avec succès", bg: Colors.green);
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/declarations');
        }
      } else {
        _showFlushbar("Erreur de mise à jour (${response.statusCode})", bg: Colors.red);
      }
    } catch (e) {
      _showFlushbar("Erreur réseau: $e", bg: Colors.red);
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
  void dispose() {
    _typeController.dispose();
    _anneeMoisController.dispose();
    _dateController.dispose();
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
              AppBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                title: const Text(
                  "Modifier la Déclaration",
                  style: TextStyle(color: Colors.white),
                ),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pushReplacementNamed(context, '/declarations'),
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
                            child: Form(
                              key: _formKey,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    "Modifier les informations de la déclaration",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  TextFormField(
                                    controller: _typeController,
                                    readOnly: true,
                                    style: const TextStyle(color: Colors.white),
                                    decoration: const InputDecoration(
                                      labelText: "Type de déclaration",
                                      labelStyle: TextStyle(color: Colors.white70),
                                      enabledBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white54)),
                                      focusedBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white)),
                                    ),
                                  ),
                                  const SizedBox(height: 15),
                                  TextFormField(
                                    controller: _anneeMoisController,
                                    style: const TextStyle(color: Colors.white),
                                    decoration: const InputDecoration(
                                      labelText: "Année / Mois (YYYY-MM)",
                                      labelStyle: TextStyle(color: Colors.white70),
                                      enabledBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white54)),
                                      focusedBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white)),
                                    ),
                                    validator: (v) =>
                                        v == null || v.isEmpty ? "Champ obligatoire" : null,
                                  ),
                                  const SizedBox(height: 15),
                                  TextFormField(
                                    controller: _dateController,
                                    readOnly: true,
                                    style: const TextStyle(color: Colors.white),
                                    decoration: const InputDecoration(
                                      labelText: "Date de déclaration",
                                      labelStyle: TextStyle(color: Colors.white70),
                                      enabledBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white54)),
                                      focusedBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white)),
                                    ),
                                  ),
                                  const SizedBox(height: 25),
                                  const Text(
                                    "Document :",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  _pickedDocument != null
                                      ? Column(
                                          children: [
                                            Text(
                                              _pickedDocument!.path.split('/').last,
                                              style: const TextStyle(
                                                  fontSize: 14, color: Colors.white),
                                            ),
                                            TextButton.icon(
                                              onPressed: _pickDocument,
                                              icon: const Icon(Icons.edit, color: Colors.white),
                                              label: const Text("Changer le document",
                                                  style: TextStyle(color: Colors.white)),
                                            ),
                                          ],
                                        )
                                      : (_declarationData?['document'] != null
                                          ? Column(
                                              children: [
                                                Image.network(
                                                  _declarationData!['document'],
                                                  height: 150,
                                                  errorBuilder: (context, error, stackTrace) {
                                                    return const Text(
                                                      "Impossible de charger le document",
                                                      style: TextStyle(color: Colors.white70),
                                                    );
                                                  },
                                                ),
                                                TextButton.icon(
                                                  onPressed: _pickDocument,
                                                  icon:
                                                      const Icon(Icons.edit, color: Colors.white),
                                                  label: const Text("Changer le document",
                                                      style: TextStyle(color: Colors.white)),
                                                ),
                                              ],
                                            )
                                          : TextButton.icon(
                                              onPressed: _pickDocument,
                                              icon: const Icon(Icons.upload_file,
                                                  color: Colors.white),
                                              label: const Text("Ajouter un document",
                                                  style: TextStyle(color: Colors.white)),
                                            )),
                                  const SizedBox(height: 25),
                                  const Text(
                                    "Lignes de la déclaration :",
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  ..._lines.map((line) {
                                    return Card(
                                      color: Colors.white.withOpacity(0.15),
                                      margin: const EdgeInsets.symmetric(vertical: 8),
                                      elevation: 3,
                                      child: Padding(
                                        padding: const EdgeInsets.all(12.0),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              line['libelle'] ?? "Ligne",
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 10),
                                            ...(line['values'] as List).map((v) {
                                              TextEditingController valueController =
                                                  TextEditingController(
                                                      text: v['valeur'] ?? '');
                                              return Padding(
                                                padding:
                                                    const EdgeInsets.only(bottom: 10.0),
                                                child: TextFormField(
                                                  controller: valueController,
                                                  style: const TextStyle(
                                                      color: Colors.white),
                                                  decoration:
                                                      const InputDecoration(
                                                    labelText: "Valeur",
                                                    labelStyle: TextStyle(
                                                        color: Colors.white70),
                                                    enabledBorder:
                                                        UnderlineInputBorder(
                                                            borderSide: BorderSide(
                                                                color:
                                                                    Colors.white54)),
                                                    focusedBorder:
                                                        UnderlineInputBorder(
                                                            borderSide: BorderSide(
                                                                color:
                                                                    Colors.white)),
                                                  ),
                                                  onChanged: (val) =>
                                                      v['valeur'] = val,
                                                ),
                                              );
                                            }).toList(),
                                          ],
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                  const SizedBox(height: 25),
                                  Center(
                                    child: ElevatedButton.icon(
                                      onPressed: _submitting ? null : _updateDeclaration,
                                      icon: const Icon(Icons.save),
                                      label: Text(_submitting
                                          ? "Mise à jour..."
                                          : "Enregistrer les modifications"),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor:
                                            const Color.fromARGB(255, 255, 255, 255),
                                        foregroundColor:
                                            const Color.fromARGB(255, 102, 0, 0),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 15, horizontal: 25),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
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
