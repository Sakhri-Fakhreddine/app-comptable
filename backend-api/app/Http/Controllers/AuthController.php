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
use Illuminate\Support\Str;

class AuthController extends Controller
{
//    // ✅ Register as 'comptable'
//    public function register(Request $request)
//    {
//     $validated = $request->validate([
//         'name' => 'required|string|max:255',
//         'email' => 'required|email|unique:users,email|unique:comptables,email',
//         'password' => 'required|string|confirmed|min:6',

//         // Comptable-specific fields
//         'nom_commercial' => 'required|string|max:255',
//         'registre_de_commerce' => 'required|string|unique:comptables,registre_de_commerce',
//         'code_tva' => 'required|string|unique:comptables,code_tva',
//         'phone' => 'required|string|max:20',
//     ]);

//     DB::beginTransaction();

//     try {
//         // Create user
//         $user = User::create([
//             'name' => $validated['name'],
//             'email' => $validated['email'],
//             'password' => Hash::make($validated['password']),
//             'usertype' => 'comptable',
//         ]);

//         // Create comptable and link to user
//         $comptable = Comptables::create([
//             'user_id' => $user->id,
//             'nom_commerciale' => $validated['nom_commercial'],
//             'Nomprenom' => $validated['name'],
//             'registre_de_commerce' => $validated['registre_de_commerce'],
//             'code_tva' => $validated['code_tva'],
//             'phone' => $validated['phone'],
//             'email' => $validated['email'],
//             'etat' => 'inactive',
//         ]);

//         DB::commit();

//         // Generate token
//         $token = $user->createToken('API Token')->plainTextToken;

//         return response()->json([
//             'message' => 'Comptable registered successfully.',
//             'user' => $user,
//             'comptable' => $comptable,
//             'token' => $token,
//         ], 201);
//     } catch (\Exception $e) {
//         DB::rollBack();
//         return response()->json(['error' => 'Registration failed.', 'details' => $e->getMessage()], 500);
//     }
//    }


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
