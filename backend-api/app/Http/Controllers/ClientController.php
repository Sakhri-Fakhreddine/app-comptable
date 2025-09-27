<?php

namespace App\Http\Controllers;

use App\Models\Clients_comptables;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ClientController extends Controller
{
    public function clientinfo($id): \Illuminate\Http\JsonResponse
    {
        $client = Clients_comptables::find($id);

        if (!$client) {
            return response()->json([
                'message' => 'Client not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $client
        ]);
    }

    public function deleteclient($id)
    {
        try {
            Log::info("Delete request received for ID: $id");
            
            $client = Clients_comptables::find($id);
            //get the user account associated to the client through the mail 
            $user =User::where('email', $client->email)->first();
            if (!$client) {
                Log::warning("client not found: $id");
                return response()->json([
                    'success' => false,
                    'message' => 'Client not found.'
                ], 404);
            }
            if (!$user) {
                Log::warning("user not found: $id");
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.'
                ], 404);
            }

            $client->delete();
            $user->delete();
            Log::info("Client and user deleted: $id");


            return response()->json([
                'success' => true,
                'message' => 'Client deleted successfully.'
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error deleting Client $id: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error while deleting Client.',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    // 🔹 Fetch client profile
    public function show(Request $request)
    {
        $user = $request->user(); 
        Log::info("Data request recieved for : $user");
        $client = Clients_comptables::where('email',$user->email)->first();
        Log::info("Related Client : $client");

        return response()->json($client);
    }

    // 🔹 Update client profile
    public function update(Request $request)
    {
        $user = $request->user();
        $client = Clients_comptables::where('email',$user->email)->first();

        Log::info("Data update request recieved for : $user");
        $request->validate([
            'Nomprenom' => 'required|string|max:255',
            'nom_commerciale' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'email' => 'required|email|unique:Clients_comptables,email,'.$client->idClients.',idClients',
            'phone' => 'nullable|string|max:20',
            'code_tva' => 'nullable|string|max:50',
        ]);

        $client->update([
            'Nomprenom' => $request->Nomprenom,
            'nom_commerciale' => $request->nom_commerciale,
            'adresse' => $request->adresse,
            'email' => $request->email,
            'phone' => $request->phone,
            'code_tva' => $request->code_tva,
        ]);

        $user->update([
            'name' => $request->Nomprenom,
            'email' => $request->email,
        ]);

        return response()->json(['message' => 'Profil mis à jour avec succès']);
    }

    // 🔹 Change password
    public function resetPassword(Request $request)
    {
        $client = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', Password::min(8)],
            'confirm_password' => 'required|same:new_password',
        ]);

        if (!Hash::check($request->current_password, $client->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect'], 422);
        }

        $client->password = Hash::make($request->new_password);
        $client->save();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès']);
    }
}
