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

}
