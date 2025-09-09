<?php

namespace App\Http\Controllers;

use App\Models\Clients_comptables;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            // Dans deleteDeclarationLine()
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
            Log::info("Client anduser deleted: $id");


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
}
