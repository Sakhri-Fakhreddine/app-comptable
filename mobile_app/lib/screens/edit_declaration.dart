import 'package:flutter/material.dart';

class EditDeclarationPage extends StatelessWidget {
  final dynamic declaration;

  const EditDeclarationPage({super.key, required this.declaration});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Modifier la Déclaration"),
        backgroundColor: Colors.red.shade700,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          "Modifier la déclaration: ${declaration['typedeclaration']}",
          style: const TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}
