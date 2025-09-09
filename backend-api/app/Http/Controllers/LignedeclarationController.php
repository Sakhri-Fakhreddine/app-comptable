<?php

namespace App\Http\Controllers;

use App\Models\lignes_parametres_decalarations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LignedeclarationController extends Controller
{
    public function getDeclatarionlineSettings() {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    
        $lignes_parametres_declarations = lignes_parametres_decalarations::all();
    
        return response()->json([
            'success' => true,
            'data' => $lignes_parametres_declarations
        ], 200);
    }
    

    public function storesettings(Request $request)
    {

        $validated = $request->validate([
            'Paramtres_declaration_idParamtres_declaration' => 'required|integer|exists:parametres_declarations,idParamtres_declaration',
            'declarationType' => 'required|string|max:255', // match frontend
            'rang' => 'required|integer',
            'libellee' => 'required|string|max:255',
            'debit_credit' => 'required|string|in:Débit,Crédit', // add debit/credit enum
            'libelleeArabe' => 'nullable|string|max:255' // optional, already sent by frontend
        ]);

        // Check if a line with the same libellee OR rang already exists for this parametre_declaration
        $exists = lignes_parametres_decalarations::where('Paramtres_declaration_idParamtres_declaration', $validated['Paramtres_declaration_idParamtres_declaration'])
            ->where(function ($query) use ($validated) {
                $query->where('libellee', $validated['libellee'])
                    ->orWhere('rang', $validated['rang']);
            })
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'A declaration line with the same libelle or rang already exists.'
            ], 409); // 409 Conflict
        }

        // Create the new declaration line
        $declarationLine = lignes_parametres_decalarations::create($validated);

        return response()->json([
            'message' => 'Declaration line created successfully.',
            'data' => $declarationLine
        ], 201);
    }

    public function deleteDeclarationLineSetting($id)
    {
            // Dans deleteDeclarationLine()
        try {
            // Log::info("Delete request received for ID: $id");
            
            $line = lignes_parametres_decalarations::find($id);
            if (!$line) {
                // Log::warning("Declaration line Settings not found: $id");
                return response()->json([
                    'success' => false,
                    'message' => 'Declaration line Settings not found.'
                ], 404);
            }

            $line->delete();
            // Log::info("Declaration line Settings deleted: $id");

            return response()->json([
                'success' => true,
                'message' => 'Declaration line Settings deleted successfully.'
            ], 200);

        } catch (\Exception $e) {
            //Log::error("Error deleting line Settings $id: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error while deleting declaration line Settings.',
                'error' => $e->getMessage()
            ], 500);
        }

    }


}
