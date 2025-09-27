<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Comptables;
use App\Http\Controllers\Controller;
use App\Models\Clients_comptables;
use Illuminate\Support\Str;

class AuthController extends Controller
{

public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (Auth::attempt($credentials)) {
        $user = Auth::user();

        // Check comptable status
        if ($user->usertype === 'comptable') {
            $comptable = Comptables::where('email', $user->email)->first();

            if (!$comptable) {
                Auth::logout();
                return response()->json(['message' => 'Aucun compte avec cette addresse mail est trouve'], 404);
            }

            if ($comptable->etat !== 'active') {
                Auth::logout();
                return response()->json([
                    'message' => "l'etat de votre compte est :  '". $comptable->etat . "' merci de verifier votre email pour plus d'informations "
                ], 403);
            }
        }

        // ✅ Return the token
        $token = $user->createToken('API Token')->plainTextToken;
        $responseData = [
            'message' => 'Login successful',
            'user' => [
                'email' => $user->email,
                'usertype' => $user->usertype,
            ],
            'token' => $token,
        ];
        // 🔹 Log the response data
        Log::info('Login Response:', $responseData);

        return response()->json($responseData, 200);

       
    }

    return response()->json(['message' => 'Invalid credentials.'], 401);
}

public function clientlogin(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (Auth::attempt($credentials)) {
        $user = Auth::user();

        // Only for clients
        $clientData = null;
        if ($user->usertype === 'client') {
            $client = Clients_comptables::where('email', $user->email)->first();

            if (!$client) {
                Auth::logout();
                return response()->json(['message' => 'Aucun compte avec cette adresse mail n’est trouvé'], 404);
            }

            $comptableassocie = Comptables::where('idComptable', $client->id_comptable)->first();

            if ($comptableassocie->etat !== 'active') {
                Auth::logout();
                return response()->json([
                    'message' => "Le compte de votre comptable associé est '{$comptableassocie->etat}', merci de le contacter pour plus d'informations"
                ], 403);
            }

            $clientData = [
                'id' => $client->idClients,
                'nom' => $client->Nomprenom,
                'email' => $client->email,
            ];
        }

        // Create token
        $token = $user->createToken('API Token')->plainTextToken;

        $responseData = [
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'email' => $user->email,
                'usertype' => $user->usertype,
            ],
            'client' => $clientData, // <-- include client info if client
        ];

        Log::info('Login Response:', $responseData);

        return response()->json($responseData, 200);
    }

    return response()->json(['message' => 'Invalid credentials.'], 401);
}




   // ✅ Logout
   public function logout(Request $request)
{
    if ($request->user()) {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    return response()->json(['message' => 'No user authenticated'], 401);
}

   // 1. Send Reset Link Email
   public function sendResetLink(Request $request)
   {
       $request->validate(['email' => 'required|email']);

       $status = Password::sendResetLink(
           $request->only('email')
       );

       return $status === Password::RESET_LINK_SENT
                   ? response()->json(['message' => __($status)], 200)
                   : response()->json(['error' => __($status)], 400);
   }

   // 2. Handle password reset
   public function resetPassword(Request $request)
   {
       $request->validate([
           'token' => 'required',
           'email' => 'required|email',
           'password' => 'required|confirmed|min:8',
       ]);

       $status = Password::reset(
           $request->only('email', 'password', 'password_confirmation', 'token'),
           function ($user) use ($request) {
               $user->forceFill([
                   'password' => Hash::make($request->password),
                   'remember_token' => Str::random(60),
               ])->save();
           }
       );

       return $status === Password::PASSWORD_RESET
                   ? response()->json(['message' => __($status)], 200)
                   : response()->json(['error' => __($status)], 400);
   }
}
