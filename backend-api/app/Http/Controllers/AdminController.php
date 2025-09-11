<?php

namespace App\Http\Controllers;

use App\Models\Demandes;
use App\Models\notifications;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Comptables;
use App\Models\Clients_comptables;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
class AdminController extends Controller
{
    public function comptableslist(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    
        $comptables = Comptables::all();
    
    
        return response()->json([
            'success' => true,
            'data' => $comptables
        ]);
    }
    public function comptableinfo($id): \Illuminate\Http\JsonResponse
    {
        $comptable = Comptables::find($id);

        if (!$comptable) {
            return response()->json([
                'message' => 'Comptable not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $comptable
        ]);
    }
    public function clientinfo($id): \Illuminate\Http\JsonResponse
    {
        $client = Clients_comptables::find($id);

        if (!$client) {
            return response()->json([
                'message' => 'client not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $client
        ]);
    }
    public function updateEtatComptable($id, Request $request)
    {
        // Validate request
        $request->validate([
            'etat' => 'required|in:active,inactive',
        ]);

        // Find comptable
        $comptable = Comptables::find($id);
        if (!$comptable) {
            return response()->json(['message' => 'Comptable not found'], 404);
        }

        // Update etat
        $comptable->etat = $request->etat;
        $comptable->save();

        return response()->json([
            'message' => 'Etat updated successfully',
            'data' => $comptable
        ]);
    }
    public function clientslist(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    
        $clients = Clients_comptables::all();
    
    
        return response()->json([
            'success' => true,
            'data' =>$clients 
        ]);
    }
    public function demandeslist(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
    
        $demandes = Demandes::all();
    
    
        return response()->json([
            'success' => true,
            'data' =>$demandes 
        ]);
    }
   
}