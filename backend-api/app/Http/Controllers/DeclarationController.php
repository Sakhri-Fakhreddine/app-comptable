<?php

namespace App\Http\Controllers;

use App\Models\Clients_comptables;
use App\Models\Comptables;
use App\Models\declarations;
use App\Models\ligne_lignedecalarations;
use App\Models\lignedeclarations;
use App\Models\lignes_parametres_decalarations;
use App\Models\Parametres_declarations;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


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
    

    public function getSettings($type)
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $client = Clients_comptables::where('email', $user->email)->first();
        Log::info(message: "Authenticated client   :  $client");

        Log::info(message: "Getting settings for type  :  $type");
        // Try to get comptable-specific setting first
            $parametre = Parametres_declarations::where('typedeclaration', $type)
            ->where('Comptables_idComptable', $client->id_comptable)
            ->first();

            // If no comptable-specific setting, fallback to default
            if (!$parametre) {
            $parametre = Parametres_declarations::where('typedeclaration', $type)
                ->whereNull('Comptables_idComptable')
                ->first();
            }

            if (!$parametre) {
            return response()->json(['message' => 'Declaration type not found'], 404);
            }

            // Get associated line parameters
            $lines = Lignes_parametres_decalarations::where('Paramtres_declaration_idParamtres_declaration', $parametre->idParamtres_declaration)
            ->orderBy('rang', 'asc')
            ->get();

            Log::info(message: "returned lines  :  $lines");

            return response()->json([
            'id' => $parametre->idParamtres_declaration,
            'typedeclaration' => $parametre->typedeclaration,
            'lines' => $lines
            ]);

    }

    public function storeclientdeclaration(Request $request)
    {
        Log::info("🔹 Attempting to submit a declaration...");
        Log::info("📩 Incoming request data: " . json_encode($request->all()));

        // Decode lines if sent as JSON string
        if (is_string($request->lines)) {
            $request->merge(['lines' => json_decode($request->lines, true)]);
            Log::info("🔄 Decoded 'lines' from JSON: " . json_encode($request->lines));
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:Clients_comptables,idClients',
            'typedeclaration' => 'required',
            'anneemois' => 'required|string|max:7', // format YYYY-MM
            'lines' => 'required|array',
            'lines.*.param_id' => 'required|exists:lignes_parametres_decalarations,idlignes_parametres_decalarations',
            'lines.*.valeur' => 'required',
            'lines.*.libelle' => 'required|string',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120'
        ]);

        Log::info("✅ Validation passed. Validated data: " . json_encode($validated));

        try {
            DB::beginTransaction();

            // Handle file upload
            $documentPath = null;
            if ($request->hasFile('document')) {
                $documentPath = $request->file('document')->store('declarations_docs', 'public');
                Log::info("📄 Document uploaded to: " . $documentPath);
            }

            // Create declaration
            $declaration = declarations::create([
                'datedeclaration' => now(),
                'anneemois' => $validated['anneemois'],
                'Clients_comptable_idClients' => $validated['client_id'],
                'etat_declaration' => 'en cours',
                'typedeclaration' => $validated['typedeclaration'],
                'document' => $documentPath
            ]);

            Log::info("📝 Declaration created with ID: " . $declaration->iddeclarations);

            // Create ligne declaration
            foreach ($validated['lines'] as $line) {
                Log::info("➖ Processing line: " . json_encode($line));

                $ligneDeclaration = lignedeclarations::create([
                    'declarations_iddeclarations' => $declaration->iddeclarations,
                    'libelle' => $line['libelle'],
                ]);

                Log::info("   📄 LigneDeclaration created with ID: " . $ligneDeclaration->idlignedeclarations);

                ligne_lignedecalarations::create([
                    'valeurs' => $line['valeur'],
                    'lignedeclarations_idlignedeclarations' => $ligneDeclaration->idlignedeclarations,
                    'lignes_parametres_decalarations_idlignes_parametres_decalarations' => $line['param_id']
                ]);

                Log::info("   ✅ Ligne_lignedecalarations created for param_id: " . $line['param_id']);
            }

            DB::commit();
            Log::info("🎉 Declaration successfully committed.");
            return response()->json(['message' => 'Déclaration créée avec succès'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('💥 Erreur lors de la création de la déclaration: '.$e->getMessage());
            Log::error('Stack trace: '.$e->getTraceAsString());
            return response()->json([
                'message' => 'Échec de la création de la déclaration',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    

    // Get all available declaration types
    public function getTypes()
    {
        // Select both French and Arabic labels
        $types = Parametres_declarations::select('typedeclaration', 'typedeclarationArabe')->distinct()->get();

        if ($types->isEmpty()) {
            return response()->json(['message' => 'No declaration types found'], 404);
        }

        Log::info("Returned types : " . $types->toJson());

        return response()->json([
            'types' => $types
        ]);
    }


    //get all declarations of theauthenticated client 
    public function getClientDeclarations(Request $request)
    {
        Log::info("🔹 Fetching declarations for authenticated client...");

        try {
            $user = Auth::user();
            Log::info("👤 Authenticated user ID: {$user->id}, type: {$user->user_type}");

            // Ensure the user is a client
            if ($user->usertype !== 'client') {
                Log::warning("⚠️ Unauthorized access attempt by user ID: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            // get the client id from the authenticate user 
            $client = Clients_comptables::where('email', $user->email)->first();
            Log::info(message: "Authenticated client   :  $client");


            // Fetch all declarations of this client
            $declarations = declarations::with([
                'lignedeclarations.lignes',
            ])
            ->where('Clients_comptable_idClients', $client->idClients)
            ->orderBy('datedeclaration', 'desc')
            ->get();

            Log::info("📦 Declarations fetched: " . $declarations->count());

            // Format response
            $result = $declarations->map(function($declaration) {
                Log::info("📝 Processing declaration ID: {$declaration->iddeclarations}");
                return [
                    'id' => $declaration->iddeclarations,
                    'typedeclaration' => $declaration->typedeclaration,
                    'anneemois' => $declaration->anneemois,
                    'etat_declaration' => $declaration->etat_declaration,
                    Log::info("etat declaration : {$declaration->etat_declaration}"),
                    'document' => $declaration->document ? asset('storage/' . $declaration->document) : null,
                    'datedeclaration' => $declaration->datedeclaration,
                    'lines' => $declaration->lignedeclarations->map(function($line) {
                        Log::info("   ➖ Processing ligne ID: {$line->idlignedeclarations}");
                        return [
                            'id' => $line->idlignedeclarations,
                            'libelle' => $line->libelle,
                            'values' => $line->lignes->map(function($subLine) {
                                Log::info("      📄 Ligne_lignedecalarations param_id: {$subLine->lignes_parametres_decalarations_idlignes_parametres_decalarations}, valeur: {$subLine->valeurs}");
                                return [
                                    'param_id' => $subLine->lignes_parametres_decalarations_idlignes_parametres_decalarations,
                                    'valeur' => $subLine->valeurs,
                                ];
                            }),
                        ];
                    }),
                ];
            });

            Log::info("✅ Successfully prepared declarations response.");

            return response()->json([
                'success' => true,
                'declarations' => $result
            ], 200);

        } catch (\Exception $e) {
            Log::error("💥 Error fetching client declarations: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur: ' . $e->getMessage()
            ], 500);
        }
    }







}
