<?php

namespace App\Http\Controllers;

use App\Models\Comptables;
use App\Models\notifications;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function getAdminNotifications() {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $notifications = notifications::where('destination', 'admin')
                                      ->where('etat_notification', 'non vu')
                                      ->get();
    
        return response()->json($notifications, 200);
    }

    public function getComptableNotifications() {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $comptable=Comptables::where('email',$user->email)->first();
        $notifications = notifications::where('destination', 'comptable')
                                      ->where('etat_notification', 'non vu')
                                      ->where('id_destination',$comptable->idComptable)
                                      ->get();
    
        return response()->json($notifications, 200);
    }


    public function markAsRead(Request $request) {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }
        $ids = $request->ids; // array of notification ids
        Notifications::whereIn('idnotifications', $ids)
                     ->update(['etat_notification' => 'vu']);
    
        return response()->json(['message' => 'Notifications marked as read'], 200);
    }
    
}
