<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailingController extends Controller
{
    public function sendEmail(Request $request)
    {
        $request->validate([
            'recipient' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        Mail::raw($request->message, function ($message) use ($request) {
            $message->to($request->recipient)
                    ->subject($request->subject);
        });

        return response()->json(['success' => true, 'message' => 'Email sent']);
    }

    public function sendEmailFromAccountant(Request $request)
    {
        
        $request->validate([
            'recipient' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        // Get logged-in accountant details
        $user = Auth::user(); // Assuming the logged-in user is the accountant

        if (!$user || !$user->email) {
            return response()->json(['success' => false, 'message' => 'Accountant email not found'], 400);
        }

        Mail::raw($request->message, function ($message) use ($request, $user) {
            $message->to($request->recipient)
                    ->subject($request->subject)
                    ->from($user->email, $user->Nomprenom ?? 'Accountant');
        });

        return response()->json(['success' => true, 'message' => 'Email sent from accountant']);
    }

    public function contactUs(Request $request)
    {
        log::info("submitting a contact mail ....");
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'subject' => 'required|string',
            'message' => 'required|string',
        ]);

        Mail::raw($validated['message'], function ($msg) use ($validated) {
            $msg->to('support@yourdomain.com')
                ->subject($validated['subject'])
                ->from($validated['email'], $validated['name'])
                ->replyTo($validated['email'], $validated['name']);
        });

        return response()->json(['success' => true, 'message' => 'Mail envoyé avec succès']);
    }


   
}
