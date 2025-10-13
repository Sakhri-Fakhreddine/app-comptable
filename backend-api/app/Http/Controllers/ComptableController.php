<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Comptables;
use App\Models\Clients_comptables;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\declarations;
use App\Models\ligne_lignedecalarations;
use App\Models\lignedeclarations;

class ComptableController extends Controller
{
    public function clientslist(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    
        $comptable = Comptables::where('email', $user->email)->first();
    
        if (!$comptable) {
            return response()->json([
                'success' => false,
                'message' => 'Comptable not found'
            ], 404);
        }
    
        $clients = Clients_comptables::where('id_comptable', $comptable->idComptable)->get();
    
        return response()->json([
            'success' => true,
            'data' => $clients
        ]);
    }
    



public function createclient(Request $request)
{
    $user1 = Auth::user();
    
        if (!$user1) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
       
    try {
        // Validate client data
        $validatedData = $request->validate([
            'Nomprenom' => 'required|string|max:255',
            'nom_commerciale' => 'required|string|max:255',
            'adresse' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:clients_comptables,email',
        ]);

        // Find the authenticated user's accountant information
        $user = User::where('id', Auth::id())->first();
        $comptable = Comptables::where('email', $user->email)->first();

        if (!$comptable) {
            return response()->json([
                'success' => false,
                'message' => 'No associated accountant found.'
            ], 404);
        }

        // Generate a random password
        $randomPassword = Str::random(10);

        // Use DB transaction
        DB::beginTransaction();

        try {
            // Create a new user
            $user = User::create([
                'name' => $validatedData['Nomprenom'], 
                'email' => $validatedData['email'],    
                'password' => Hash::make($randomPassword), // Hash the password
                // 'password' => '12345678', // Hash the password
                'usertype' => 'client',
            ]);

            // Create the client and associate it with the accountant
            $client = Clients_comptables::create([
                'Nomprenom' => $validatedData['Nomprenom'],
                'nom_commerciale' => $validatedData['nom_commerciale'],
                'adresse' => $validatedData['adresse'],
                'phone' => $validatedData['phone'],
                'email' => $validatedData['email'],
                'id_comptable' => $comptable->idComptable,
                'compte_daccess' => Str::random(10), // required unique access account
            ]);

            // Optionally send email
            // Prepare email content
            $subject = "Création de compte avec succès";
            $messageBody = "Votre compte est créé avec succès. Voici les coordonnées :\n";
            $messageBody .= "Email : " . $client->email . "\n";
            $messageBody .= "Password : " . $randomPassword . "\n";

            // Send the email
            Mail::raw($messageBody, function ($message) use ($client, $subject) {
                $message->to($client->email)
                        ->subject($subject);
            });

        

            DB::commit();

            // Return JSON response
            return response()->json([
                'success' => true,
                'message' => 'Client created successfully!',
                'client' => $client
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to create client.',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getComptableById($id)
    {
        $comptable = Comptables:: where('idComptable', $id)->first();

        if (!$comptable) {
            return response()->json(['success' => false, 'message' => 'Comptable not found'], 404);
        }
        return response()->json([
            'success' => true,
            'data' => $comptable
        ]);
    }


    public function getDeclarations(Request $request)
    {
        Log::info("🔹 Fetching declarations for related comptable...");
    
        try {
            $user = Auth::user();
            Log::info("👤 Authenticated user ID: {$user->id}, type: {$user->usertype}");
    
            // ✅ Ensure the user is a comptable
            if ($user->usertype !== 'comptable') {
                Log::warning("⚠️ Unauthorized access attempt by user ID: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
    
            // ✅ Fetch the authenticated comptable
            $comptable = Comptables::where('email', $user->email)->first();
            if (!$comptable) {
                Log::warning("⚠️ No comptable found for user ID: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Comptable introuvable.'
                ], 404);
            }
    
            Log::info("✅ Authenticated comptable: {$comptable->idComptable}");
    
            // ✅ Get all clients linked to this comptable
            $clients = Clients_comptables::where('id_comptable', $comptable->idComptable)->get();
            Log::info("👥 Found {$clients->count()} clients for comptable {$comptable->idComptable}");
    
            $allDeclarations = collect(); // will store declarations for all clients
    
            foreach ($clients as $client) {
                Log::info("📂 Fetching declarations for client ID: {$client->idClients}");
                $clientname = $client->Nomprenom ?? 'Inconnu'; 
                
    
                $declarations = declarations::with(['lignedeclarations.lignes'])
                    ->where('Clients_comptable_idClients', $client->idClients)
                    ->orderBy('datedeclaration', 'desc')
                    ->get();
    
                Log::info("📦 Found {$declarations->count()} declarations for client ID {$client->idClients}");
    
                // Map and format declarations
                $formatted = $declarations->map(function ($declaration) use ($clientname) {
                    Log::info("📝 Processing declaration ID: {$declaration->iddeclarations}");
                    Log::info("📂 client name : {$clientname}");
    
                    return [
                        'id' => $declaration->iddeclarations,
                        'typedeclaration' => $declaration->typedeclaration,
                        'client_name' => $clientname,
                        'anneemois' => $declaration->anneemois,
                        'etat_declaration' => $declaration->etat_declaration,
                        'document' => $declaration->document ? asset('storage/' . $declaration->document) : null,
                        'datedeclaration' => $declaration->datedeclaration,
                        'lines' => $declaration->lignedeclarations->map(function ($line) {
                            Log::info("   ➖ Processing ligne ID: {$line->idlignedeclarations}");
                            return [
                                'id' => $line->idlignedeclarations,
                                'libelle' => $line->libelle,
                                'values' => $line->lignes->map(function ($subLine) {
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
    
                $allDeclarations = $allDeclarations->merge($formatted);
            }
    
            Log::info("✅ Successfully gathered {$allDeclarations->count()} total declarations.");
    
            return response()->json([
                'success' => true,
                'data' => $allDeclarations,
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
    

    public function getDeclarationsByClientId($id)
    {
        Log::info("🔹 Fetching declarations client with ID : {$id}");
    
        try {
            $user = Auth::user();
            Log::info("👤 Authenticated user ID: {$user->id}, type: {$user->usertype}");
    
            // ✅ Ensure the user is a comptable
            if ($user->usertype !== 'comptable') {
                Log::warning("⚠️ Unauthorized access attempt by user ID: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
    
            // ✅ Fetch the authenticated comptable
            $comptable = Comptables::where('email', $user->email)->first();
            if (!$comptable) {
                Log::warning("⚠️ No comptable found for user ID: {$user->id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Comptable introuvable.'
                ], 404);
            }
    
            Log::info("✅ Authenticated comptable: {$comptable->idComptable}");
    
            // Fetch all declarations of this client
            $declarations = declarations::with([
                'lignedeclarations.lignes',
            ])
            ->where('Clients_comptable_idClients', $id)
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
    
            Log::info("✅ Successfully gathered {$declarations->count()} total declarations.");
    
            return response()->json([
                'success' => true,
                'data' => $result,
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
