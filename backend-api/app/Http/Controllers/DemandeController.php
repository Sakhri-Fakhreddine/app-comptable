<?php

namespace App\Http\Controllers;

use App\Models\abonnementsglobals;
use App\Models\Comptables;
use App\Models\notifications;
use Illuminate\Http\Request;
use App\Models\Demandes;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Accountant;
use App\Models\Abonnementsglobal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;


class DemandeController extends Controller
{
    
    public function register(Request $request)
    {
        // Validate the input
        $validatedData = Validator::make($request->all(), [
            'nom_commercial' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'registre_de_commerce' => ['required', 'string', 'max:255'],
            'code_tva' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'], 
            'typeabonnement' => ['required', 'string', 'max:255'],
            'password_confirmation' => ['sometimes', 'string'],
            'password' => ['required', 'string'],
            'terms' => ['sometimes', 'boolean'], 
        ]);
    
        if ($validatedData->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validatedData->errors()
            ], 422);
        }
    
        DB::beginTransaction();
    
        try {
            // Create the demande
            $demande = Demandes::create([
                'etat_demande' => 'en cours de traitement',
                'detailcomptables' => json_encode([
                    'nom_commercial' => $request->nom_commercial,
                    'Nomprenom' => $request->name,
                    'registre_de_commerce' => $request->registre_de_commerce,
                    'code_tva' => $request->code_tva,
                    'phone' => $request->phone,
                    'email' => $request->email,
                    'password'=> $request->password,
                ]),
                'typeabonnement' => $request->typeabonnement,
                'commentaire' => null,
                'Comptables_idComptable' => null,
                'abonnementsglobals_idabonnementglobals' => null,
            ]);

            // 🔔 Create a notification for the admin
            notifications::create([
            'destination' => 'admin',
            'id_destination' => null, // if you have multiple admins, you can set an ID, else null means global
            'contenu_notification' => "Une nouvelle demande a été soumise par {$request->name} ({$request->email})",
            'etat_notification' => 'non vu', // default state: unread
        ]);
    
            DB::commit();
    
            return response()->json([
                'status' => 'success',
                'message' => 'Votre demande a été soumise avec succès.',
                'demande' => $demande
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
    
            return response()->json([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la soumission de la demande.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function demandeinfo($id): \Illuminate\Http\JsonResponse
    {
        $demande = Demandes::find($id);

        if (!$demande) {
            return response()->json([
                'message' => 'Demande  not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $demande
        ]);
    }

    //accepting demande and creating user comptable account 
    public function acceptDemande(Request $request)
    {
        $validated = $request->validate([
            'demandeId' => 'required|exists:demandes,idDemande',
            'montant' => 'required|numeric|min:0',
            'comment' => 'nullable|string|max:500'
        ]);

        $demande = Demandes::findOrFail(id: $validated['demandeId']);

        // Decode the JSON details (stored in demandes.details_comptable)
        $accountantDetails = json_decode($demande->detailcomptables, true);

        DB::transaction(function () use ($demande, $validated, $accountantDetails) {
            // 1. Create User
            $user = User::create([
                'name' => $accountantDetails['Nomprenom'],
                'email' => $accountantDetails['email'],
                'password' => $accountantDetails['password'], // Default password
            ]);

            // 2. Create Accountant
            $comptable = Comptables::create([
                'nom_commerciale' => $accountantDetails['nom_commercial'],
                'Nomprenom' => $accountantDetails['Nomprenom'],
                'registre_de_commerce' => $accountantDetails['registre_de_commerce'],
                'code_tva' => $accountantDetails['code_tva'],
                'phone' => $accountantDetails['phone'],
                'email' => $accountantDetails['email'],
                'etat' => 'active',
            ]);
            if (!$comptable->idComptable) {
                throw new \Exception("Accountant was not created correctly");
            }

            // 3. Create Abonnement
            $abonnement = abonnementsglobals::create([
                'etat_abonnement' => 1, // Active
                'montant' => $validated['montant'],
                'typeaabonnement' => $demande->typeabonnement,
                'id_comptables' => $comptable->idComptable,
            ]);

            // 4. Update Demande
            $demande->update([
                'abonnementsglobals_idabonnementglobals' => $abonnement->idabonnementglobals,
                'Comptables_idComptable' => $comptable->idComptable,
                'etat_demande' => 'acceptée',
                'commentaire' => $validated['comment'] ?? null
            ]);

            if (!empty($accountantDetails['email'])) {
                // Prepare email content
                $subject = "Votre demande a été acceptée";
                $messageBody = $validated['comment'] 
                    ? "Votre demande a été acceptée!! Vous pouvez mainetneant vous connecter . Commentaire : " . $validated['comment'] 
                    : "Votre demande a été acceptée sans commentaire.";

                // Send the email
                Mail::raw($messageBody, function ($message) use ($accountantDetails, $subject) {
                    $message->to($accountantDetails['email'])
                            ->subject($subject);
                });
            }
        });

        return response()->json([
            'message' => 'Demande accepted, accountant created, and abonnement registered successfully'
        ], 200);
    }

    public function refuseDemande(Request $request)
    {
        $validated = $request->validate([
            'demandeId' => 'required|exists:demandes,idDemande',
            'comment' => 'nullable|string|max:500'
        ]);

        $demande = Demandes::findOrFail(id: $validated['demandeId']);


        DB::transaction(function () use ($demande, $validated) {
            //Update Demande
            $demande->update([
                'etat_demande' => 'refusée',
                'commentaire' => $validated['comment'] ?? null
            ]);
            // Decode the JSON details (stored in demandes.details_comptable)
            $accountantDetails = json_decode($demande->detailcomptables);

            if (!empty($accountantDetails->email)) {
                $subject = "Votre demande a été refusée";
                $messageBody = $validated['comment'] 
                    ? "Votre demande a été refusée. Commentaire : " . $validated['comment'] 
                    : "Votre demande a été refusée sans commentaire.";

                Mail::raw($messageBody, function ($message) use ($accountantDetails, $subject) {
                    $message->to($accountantDetails->email)
                            ->subject($subject);
                });
            }

                    });

                    return response()->json([
                        'message' => 'Demande refused successfully and accountant notified'
                    ], 200);
        }



}
