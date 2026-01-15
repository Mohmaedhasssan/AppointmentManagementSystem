<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        // Force 303 so the browser follows with GET (prevents POST replay on redirects)
        return redirect()->intended(config('fortify.home'))->setStatusCode(303);
    }
}
