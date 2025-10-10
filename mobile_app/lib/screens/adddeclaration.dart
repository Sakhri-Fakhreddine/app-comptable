import 'dart:io';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:another_flushbar/flushbar.dart';
import 'package:file_picker/file_picker.dart';

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

  String? _selectedAnneemois;
  File? _selectedFile;

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

  Future<void> _pickFile() async {
    if (_selectedFile != null) {
      setState(() => _selectedFile = null);
      _showFlushBar("Fichier désélectionné", bg: Colors.orange);
      return;
    }

    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    );

    if (result != null && result.files.single.path != null) {
      setState(() => _selectedFile = File(result.files.single.path!));
      _showFlushBar(
        "Fichier sélectionné : ${result.files.single.name}",
        bg: Colors.green,
      );
    }
  }

  Future<void> _selectAnneemois(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(now.year - 2),
      lastDate: DateTime(now.year + 2),
      helpText: 'Choisissez une année et un mois',
    );
    if (picked != null) {
      setState(() => _selectedAnneemois =
          "${picked.year}-${picked.month.toString().padLeft(2, '0')}");
    }
  }

  Future<void> _submitDeclaration() async {
    if (_selectedType == null) {
      _showFlushBar("Veuillez sélectionner un type", bg: Colors.red);
      return;
    }
    if (_selectedAnneemois == null) {
      _showFlushBar("Veuillez choisir l'année et le mois", bg: Colors.red);
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      final clientId = prefs.getInt('client_id') ?? 0;

      var request = http.MultipartRequest(
        'POST',
        Uri.parse("http://10.0.2.2:8000/api/declarations"),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.fields['client_id'] = clientId.toString();
      request.fields['typedeclaration'] = _selectedType!['typedeclaration'];
      request.fields['anneemois'] = _selectedAnneemois!;

      final linesJson = _lines.map((line) {
        return {
          'param_id': line['id'],
          'valeur': _lineControllers[line['id']]?.text ?? '',
          'libelle': line['libelle']
        };
      }).toList();
      request.fields['lines'] = json.encode(linesJson);

      if (_selectedFile != null) {
        request.files.add(await http.MultipartFile.fromPath(
          'document',
          _selectedFile!.path,
        ));
      }

      final response = await request.send();
      final respStr = await response.stream.bytesToString();

      if (response.statusCode == 200 || response.statusCode == 201) {
        _showFlushBar("Déclaration ajoutée avec succès", bg: Colors.green);
        _lineControllers.forEach((key, controller) => controller.clear());
        setState(() {
          _selectedAnneemois = null;
          _selectedFile = null;
        });
      } else {
        final data = json.decode(respStr);
        _showFlushBar(data['message'] ?? "Échec de l'ajout", bg: Colors.red);
      }
    } catch (e) {
      _showFlushBar("Erreur: $e", bg: Colors.red);
    } finally {
      setState(() => _loading = false);
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
                  onPressed: () => Navigator.pop(context),
                ),
                title: const Text(
                  "Ajouter Déclaration",
                  style: TextStyle(color: Colors.white),
                ),
              ),
              Expanded(
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
                          children: [
                            const Center(
                              child: Text(
                                "Remplir les informations de la déclaration",
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Type dropdown
                            DropdownButtonFormField<Map<String, dynamic>>(
                              dropdownColor:
                                  const Color.fromARGB(255, 102, 0, 0),
                              initialValue: _selectedType,
                              items: _types.map((typeMap) {
                                return DropdownMenuItem<Map<String, dynamic>>(
                                  value: typeMap,
                                  child: Text(
                                    "${typeMap['typedeclaration']} / ${typeMap['typedeclarationArabe']}",
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() => _selectedType = value);
                                if (value != null) {
                                  _fetchFieldsForType(value['typedeclaration']);
                                }
                              },
                              decoration: const InputDecoration(
                                labelText: "Type de déclaration",
                                labelStyle: TextStyle(color: Colors.white),
                                enabledBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Colors.white54),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Colors.white),
                                ),
                              ),
                              validator: (value) =>
                                  value == null ? "Veuillez choisir un type" : null,
                            ),

                            const SizedBox(height: 16),

                            // Show rest only if type selected
                            if (_selectedType != null)
                              Column(
                                children: [
                                  // Date selector
                                  InkWell(
                                    onTap: () => _selectAnneemois(context),
                                    child: InputDecorator(
                                      decoration: const InputDecoration(
                                        labelText: "Année et Mois",
                                        labelStyle: TextStyle(color: Colors.white70),
                                        enabledBorder: UnderlineInputBorder(
                                          borderSide: BorderSide(color: Colors.white54),
                                        ),
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            _selectedAnneemois ?? "Choisir une date",
                                            style: const TextStyle(color: Colors.white),
                                          ),
                                          const Icon(Icons.calendar_today,
                                              color: Colors.white),
                                        ],
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 20),

                                  // Dynamic fields
                                  if (_loadingFields)
                                    const CircularProgressIndicator(color: Colors.white)
                                  else
                                    Column(
                                      children: _lines.map((line) {
                                        return Padding(
                                          padding: const EdgeInsets.symmetric(vertical: 8.0),
                                          child: TextFormField(
                                            controller: _lineControllers[line['id']],
                                            style: const TextStyle(color: Colors.white),
                                            decoration: InputDecoration(
                                              labelText: line['libelle'],
                                              labelStyle: const TextStyle(color: Colors.white70),
                                              enabledBorder: const UnderlineInputBorder(
                                                borderSide: BorderSide(color: Colors.white54),
                                              ),
                                              focusedBorder: const UnderlineInputBorder(
                                                borderSide: BorderSide(color: Colors.white),
                                              ),
                                            ),
                                            keyboardType: TextInputType.number,
                                            validator: (value) =>
                                                value == null || value.isEmpty ? "Requis" : null,
                                          ),
                                        );
                                      }).toList(),
                                    ),

                                  const SizedBox(height: 20),

                                  // Upload button
                                  ElevatedButton.icon(
                                    icon: Icon(
                                      _selectedFile == null ? Icons.upload_file : Icons.close,
                                      color: Colors.black87,
                                    ),
                                    label: Text(
                                      _selectedFile == null
                                          ? "Ajouter un document"
                                          : _selectedFile!.path.split('/').last,
                                      style: const TextStyle(color: Colors.black87),
                                    ),
                                    onPressed: _pickFile,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.white,
                                      minimumSize: const Size(double.infinity, 50),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      elevation: 2,
                                    ),
                                  ),

                                  const SizedBox(height: 15),

                                  // Submit button
                                  _loading
                                      ? const CircularProgressIndicator(color: Colors.white)
                                      : ElevatedButton.icon(
                                          icon: const Icon(Icons.add_circle, color: Colors.black87),
                                          label: const Text(
                                            "Ajouter Déclaration",
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: Colors.black87,
                                            ),
                                          ),
                                          onPressed: _submitDeclaration,
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.white,
                                            minimumSize: const Size(double.infinity, 50),
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            elevation: 2,
                                          ),
                                        ),
                                ],
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
