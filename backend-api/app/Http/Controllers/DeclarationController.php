<?php

namespace App\Http\Controllers;

use App\Models\Comptables;
use App\Models\lignes_parametres_decalarations;
use App\Models\Parametres_declarations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class DeclarationController extends Controller
{
    public function getDeclarationSettings()
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    
        if ($user->usertype === 'admin') {
            // Admin: return everything
            $parametres_declarations = Parametres_declarations::all();
        } else if ($user->usertype === 'comptable') {
            $comptable = Comptables::where('email', $user->email)->first();
    
            if (!$comptable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Comptable not found'
                ], 404);
            }
    
            // Get all declaration types
            $allTypes = Parametres_declarations::select('typedeclaration')->distinct()->pluck('typedeclaration');
    
            $parametres_declarations = collect();
    
            foreach ($allTypes as $type) {
                // Check if comptable has a declaration for this type
                $comptableSetting = Parametres_declarations::where('typedeclaration', $type)
                    ->where('Comptables_idComptable', $comptable->idComptable)
                    ->first();
    
                if ($comptableSetting) {
                    $parametres_declarations->push($comptableSetting);
                } else {
                    // Otherwise, return the default (Comptables_idComptable = null)
                    $defaultSetting = Parametres_declarations::where('typedeclaration', $type)
                        ->whereNull('Comptables_idComptable')
                        ->first();
    
                    if ($defaultSetting) {
                        $parametres_declarations->push($defaultSetting);
                    }
                }
            }
        } else {
            // Other users: return only defaults
            $parametres_declarations = Parametres_declarations::whereNull('Comptables_idComptable')->get();
        }
    
        return response()->json($parametres_declarations->values(), 200);
    }
    
    
    
    //add default settings 
    public function storesettings(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $validated = $request->validate([
            'typedeclaration' => 'required|string|max:255',
            'typedeclarationArabe' => 'nullable|string|max:255',
            'Comptables_idComptable' => 'nullable|integer|exists:Comptables,idComptable',
        ]);
        // 🔍 Check if a default parameter with the same typedeclaration already exists
        $exists = Parametres_declarations::where('typedeclaration', $validated['typedeclaration'])->exists();
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Un paramètre par défaut pour ce type de déclaration existe déjà ❌'
            ], 422);
        }

        $param = Parametres_declarations::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paramètre de déclaration créé avec succès',
            'data' => $param
        ], 201);
    }

    public function deleteDeclarationSetting($id)
    {
            // Dans deleteDeclarationLine()
        try {
            Log::info("Delete request received for ID: $id");
            
            $declaration = Parametres_declarations::find($id);
            if (!$declaration) {
                Log::warning("Declaration Settings not found: $id");
                return response()->json([
                    'success' => false,
                    'message' => 'Declaration Settings not found.'
                ], 404);
            }

            $declaration->delete();
            Log::info("Declaration Settings deleted: $id");

            return response()->json([
                'success' => true,
                'message' => 'Declaration Settings deleted successfully.'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error deleting Settings $id: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error while deleting declaration Settings.',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    public function getLinesByDeclaration($declarationId)
    {
        $lines = lignes_parametres_decalarations::where('Paramtres_declaration_idParamtres_declaration', $declarationId)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $lines
        ]);
    }
    public function getDeclarationSettingById($id)
    {
        $declarationsetting = Parametres_declarations::with('lignes')
            ->where('idParamtres_declaration', $id)
            ->first();

        if (!$declarationsetting) {
            return response()->json(['success' => false, 'message' => 'Declaration Setting not found'], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $declarationsetting
        ]);
    }

    public function updateDeclarationSettings(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user || $user->usertype !== 'comptable') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
    
        // Validate request
        $request->validate([
            'typedeclaration' => 'required|string|max:255',
            'typedeclarationArabe' => 'nullable|string|max:255',
            'lines' => 'nullable|array',
            'lines.*.libellee' => 'required|string|max:255',
            'lines.*.libelleeArabe' => 'nullable|string|max:255',
            'lines.*.compte_comptable' => 'nullable|string|max:255',
            'lines.*.debit_credit' => 'required|in:Débit,Crédit',
            'lines.*.rang' => 'required|integer'
        ]);
    
        $declaration = Parametres_declarations::with('lignes')->find($id);
    
        if (!$declaration) {
            return response()->json(['success' => false, 'message' => 'Declaration not found'], 404);
        }
    
        $comptable = Comptables::where('email', $user->email)->first();
    
        // Case 1: Declaration already belongs to this comptable -> update directly
        if ($declaration->Comptables_idComptable === $comptable->idComptable) {
            $declaration->update([
                'typedeclaration' => $request->typedeclaration,
                'typedeclarationArabe' => $request->typedeclarationArabe,
            ]);
    
            // Sync lines
            $submittedIds = collect($request->lines)->pluck('id')->filter()->toArray();
            $existingIds = $declaration->lignes->pluck('idlignes_parametres_decalarations')->toArray();
    
            // Delete removed lines
            $toDelete = array_diff($existingIds, $submittedIds);
            if (!empty($toDelete)) {
                Lignes_parametres_decalarations::whereIn('idlignes_parametres_decalarations', $toDelete)->delete();
            }
    
            // Add / update lines
            foreach ($request->lines ?? [] as $lineData) {
                if (!empty($lineData['id'])) {
                    $line = Lignes_parametres_decalarations::find($lineData['id']);
                    if ($line) {
                        $line->update([
                            'libellee' => $lineData['libellee'],
                            'libelleeArabe' => $lineData['libelleeArabe'] ?? '',
                            'compte_comptable' => $lineData['compte_comptable'],
                            'debit_credit' => $lineData['debit_credit'],
                            'rang' => $lineData['rang']
                        ]);
                    }
                } else {
                    Lignes_parametres_decalarations::create([
                        'Paramtres_declaration_idParamtres_declaration' => $declaration->idParamtres_declaration,
                        'libellee' => $lineData['libellee'],
                        'libelleeArabe' => $lineData['libelleeArabe'] ?? '',
                        'compte_comptable' => $lineData['compte_comptable'],
                        'debit_credit' => $lineData['debit_credit'],
                        'rang' => $lineData['rang']
                    ]);
                }
            }
    
        } else {
            // Case 2: Declaration is default (belongs to no comptable) -> clone
            $newDeclaration = Parametres_declarations::create([
                'typedeclaration' => $request->typedeclaration,
                'typedeclarationArabe' => $request->typedeclarationArabe,
                'Comptables_idComptable' => $comptable->idComptable
            ]);
    
            // Copy default lines
            foreach ($declaration->lignes as $line) {
                Lignes_parametres_decalarations::create([
                    'Paramtres_declaration_idParamtres_declaration' => $newDeclaration->idParamtres_declaration,
                    'libellee' => $line->libellee,
                    'libelleeArabe' => $line->libelleeArabe,
                    'compte_comptable' => $line->compte_comptable,
                    'debit_credit' => $line->debit_credit,
                    'rang' => $line->rang
                ]);
            }
    
            // Add custom lines
            foreach ($request->lines ?? [] as $lineData) {
                Lignes_parametres_decalarations::create([
                    'Paramtres_declaration_idParamtres_declaration' => $newDeclaration->idParamtres_declaration,
                    'libellee' => $lineData['libellee'],
                    'libelleeArabe' => $lineData['libelleeArabe'] ?? '',
                    'compte_comptable' => $lineData['compte_comptable'],
                    'debit_credit' => $lineData['debit_credit'],
                    'rang' => $lineData['rang']
                ]);
            }
        }
    
        return response()->json(['success' => true, 'message' => 'Declaration updated successfully']);
    }
    
    
    public function createDeclarationSettings(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->usertype !== 'comptable') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
    
        $request->validate([
            'typedeclaration' => 'required|string|max:255',
            'typedeclarationArabe' => 'nullable|string|max:255',
            'lines' => 'nullable|array',
            'lines.*.libellee' => 'required|string|max:255',
            'lines.*.libelleeArabe' => 'nullable|string|max:255',
            'lines.*.compte_comptable' => 'nullable|string|max:255',
            'lines.*.debit_credit' => 'required|in:Débit,Crédit',
            'lines.*.rang' => 'required|integer'
        ]);
    
        $comptable = Comptables::where('email', $user->email)->first();
    
        $declaration = Parametres_declarations::create([
            'typedeclaration' => $request->typedeclaration,
            'typedeclarationArabe' => $request->typedeclarationArabe,
            'Comptables_idComptable' => $comptable->idComptable
        ]);
    
        foreach ($request->lines ?? [] as $lineData) {
            Lignes_parametres_decalarations::create([
                'Paramtres_declaration_idParamtres_declaration' => $declaration->idParamtres_declaration,
                'libellee' => $lineData['libellee'],
                'libelleeArabe' => $lineData['libelleeArabe'] ?? '',
                'compte_comptable' => $lineData['compte_comptable'],
                'debit_credit' => $lineData['debit_credit'],
                'rang' => $lineData['rang']
            ]);
        }
    
        return response()->json([
            'success' => true,
            'message' => 'Declaration created successfully',
            'data' => $declaration
        ]);
    }
    



}
