<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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
   
}
